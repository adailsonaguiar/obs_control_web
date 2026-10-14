/* eslint-disable require-jsdoc, max-len */
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {FieldValue, Timestamp, getFirestore} from "firebase-admin/firestore";
import {defineSecret, defineString} from "firebase-functions/params";
import {setGlobalOptions} from "firebase-functions/v2";
import {onRequest} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import express, {NextFunction, Request, Response} from "express";
import Stripe from "stripe";

initializeApp();
setGlobalOptions({region: "southamerica-east1", maxInstances: 5});

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const stripePriceMonthly = defineSecret("STRIPE_PRICE_PTZ_MONTHLY");
const stripePriceYearly = defineSecret("STRIPE_PRICE_PTZ_YEARLY");
const appUrl = defineSecret("APP_URL");
const checkoutEnabled = defineString("CHECKOUT_ENABLED", {default: "false"});

type PlanId = "ptz-monthly" | "ptz-yearly";
type LegalType = "terms" | "privacy" | "cancellation";
type AuthenticatedRequest = Request & {firebaseUid?: string; firebaseEmail?: string};
type FirebaseRequest = Request & {rawBody: Buffer};

const firestore = getFirestore();
const api = express();
const legalDocuments: Record<LegalType, {type: LegalType; version: string; effectiveAt: string; url: string; hash: string}> = {
  terms: {type: "terms", version: "draft-0.1", effectiveAt: "pending", url: "/termos", hash: "70b3f400902122fd9ab47dc7122fd80fc090a183c38bdad678fa3ed8f35304fb"},
  privacy: {type: "privacy", version: "draft-0.1", effectiveAt: "pending", url: "/privacidade", hash: "d84676553d53637135398fc4db525998abb77663c0ea644a3103246ebe10699f"},
  cancellation: {type: "cancellation", version: "draft-0.1", effectiveAt: "pending", url: "/cancelamento-e-reembolso", hash: "f94cc15f846f8cace4a623d0b18edbbb264f3185ee5d087bcf6ab9afd045d5bf"},
};
const rateBuckets = new Map<string, {count: number; resetAt: number}>();

function stripeClient() {
  return new Stripe(stripeSecretKey.value());
}
function officialOrigin() {
  return appUrl.value().replace(/\/$/, "");
}
function isCheckoutEnabled() {
  return checkoutEnabled.value() === "true" && Object.values(legalDocuments).every((document) => document.effectiveAt !== "pending" && !document.version.startsWith("draft"));
}
function allowedOrigins() {
  return new Set([officialOrigin(), "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5175", "http://127.0.0.1:5175"]);
}

function cors(request: Request, response: Response, next: NextFunction) {
  const origin = request.headers.origin;
  if (origin && allowedOrigins().has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin); response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (request.method === "OPTIONS") {
    response.status(204).end(); return;
  }
  next();
}

function rateLimit(limit: number, windowMs: number) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    const key = `${request.firebaseUid || "anonymous"}:${request.path}`;
    const now = Date.now(); const current = rateBuckets.get(key);
    if (!current || current.resetAt <= now) {
      rateBuckets.set(key, {count: 1, resetAt: now + windowMs}); next(); return;
    }
    if (current.count >= limit) {
      response.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000))); response.status(429).json({error: "rate_limit_exceeded"}); return;
    }
    current.count += 1; next();
  };
}

async function authenticate(request: AuthenticatedRequest, response: Response, next: NextFunction) {
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    response.status(401).json({error: "authentication_required"}); return;
  }
  try {
    const decoded = await getAuth().verifyIdToken(authorization.slice(7), true); request.firebaseUid = decoded.uid; request.firebaseEmail = decoded.email; next();
  } catch {
    response.status(401).json({error: "invalid_authentication"});
  }
}

function isPlanId(value: unknown): value is PlanId {
  return value === "ptz-monthly" || value === "ptz-yearly";
}
function priceFor(planId: PlanId) {
  return planId === "ptz-monthly" ? stripePriceMonthly.value() : stripePriceYearly.value();
}
function hasActiveAccess(status: Stripe.Subscription.Status | undefined) {
  return status === "active" || status === "trialing";
}
function validateLegalVersions(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const versions = value as Record<string, unknown>;
  return Object.values(legalDocuments).every((document) => versions[document.type] === document.version);
}

async function getOrCreateCustomer(uid: string, email?: string) {
  const reference = firestore.collection("billingUsers").doc(uid); const snapshot = await reference.get(); const existing = snapshot.get("stripeCustomerId");
  if (typeof existing === "string" && existing) return {customerId: existing, trialUsed: snapshot.get("trialUsed") === true};
  const customer = await stripeClient().customers.create({email, metadata: {firebaseUid: uid}});
  await reference.set({stripeCustomerId: customer.id, updatedAt: FieldValue.serverTimestamp()}, {merge: true});
  return {customerId: customer.id, trialUsed: false};
}

async function persistSubscription(subscription: Stripe.Subscription) {
  const uid = subscription.metadata.firebaseUid; const planId = subscription.metadata.planId;
  if (!uid || !isPlanId(planId)) {
    logger.error("Subscription missing trusted metadata", {subscriptionId: subscription.id}); return;
  }
  const periodEnd = subscription.items.data.reduce((latest, item) => Math.max(latest, item.current_period_end), 0);
  await firestore.collection("billingUsers").doc(uid).set({stripeCustomerId: typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id, subscriptionId: subscription.id, planId, status: subscription.status, trialEnd: subscription.trial_end ? Timestamp.fromMillis(subscription.trial_end * 1000) : null, currentPeriodEnd: periodEnd ? Timestamp.fromMillis(periodEnd * 1000) : null, cancelAtPeriodEnd: subscription.cancel_at_period_end, ...(subscription.trial_end ? {trialUsed: true} : {}), updatedAt: FieldValue.serverTimestamp()}, {merge: true});
}

async function reconcileEvent(event: Stripe.Event) {
  if (event.type.startsWith("customer.subscription.")) {
    await persistSubscription(await stripeClient().subscriptions.retrieve((event.data.object as Stripe.Subscription).id)); return;
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session; if (typeof session.subscription === "string") await persistSubscription(await stripeClient().subscriptions.retrieve(session.subscription)); return;
  }
  if (event.type.startsWith("invoice.")) {
    const invoice = event.data.object as Stripe.Invoice; const subscriptionId = invoice.parent?.subscription_details?.subscription; if (typeof subscriptionId === "string") await persistSubscription(await stripeClient().subscriptions.retrieve(subscriptionId));
  }
}

api.use(cors);
api.use(express.json());
api.get("/health", (_request, response) => response.json({ok: true, service: "obs-tools-billing"}));
api.get("/legal-documents/current", rateLimit(60, 60_000), (_request, response) => {
  response.setHeader("Cache-Control", "public, max-age=300"); response.json({checkoutEnabled: isCheckoutEnabled(), documents: Object.values(legalDocuments)});
});

api.post("/checkout-sessions", authenticate, rateLimit(5, 60_000), async (request: AuthenticatedRequest, response: Response) => {
  const planId = request.body?.planId;
  if (!isCheckoutEnabled()) {
    response.status(503).json({error: "checkout_not_enabled"}); return;
  }
  if (!isPlanId(planId)) {
    response.status(400).json({error: "invalid_plan"}); return;
  }
  if (!validateLegalVersions(request.body?.legalVersions)) {
    response.status(409).json({error: "legal_documents_outdated"}); return;
  }
  try {
    const uid = request.firebaseUid!; const customer = await getOrCreateCustomer(uid, request.firebaseEmail);
    const session = await stripeClient().checkout.sessions.create({mode: "subscription", customer: customer.customerId, line_items: [{price: priceFor(planId), quantity: 1}], client_reference_id: uid, success_url: `${officialOrigin()}/checkout/sucesso`, cancel_url: `${officialOrigin()}/checkout/cancelado`, subscription_data: {...(!customer.trialUsed ? {trial_period_days: 2} : {}), metadata: {firebaseUid: uid, planId}}, payment_method_collection: "always", allow_promotion_codes: true});
    await firestore.collection("legalAcceptances").doc(session.id).create({uid, planId, source: "checkout", checkoutSessionId: session.id, documents: Object.values(legalDocuments).map((document) => ({type: document.type, version: document.version, effectiveAt: document.effectiveAt, url: `${officialOrigin()}${document.url}`, hash: document.hash})), acceptedAt: FieldValue.serverTimestamp()});
    response.json({checkoutUrl: session.url});
  } catch (error) {
    logger.error("Checkout creation failed", {error}); response.status(500).json({error: "checkout_creation_failed"});
  }
});

api.post("/billing-portal-sessions", authenticate, rateLimit(8, 60_000), async (request: AuthenticatedRequest, response: Response) => {
  try {
    const snapshot = await firestore.collection("billingUsers").doc(request.firebaseUid!).get(); const customerId = snapshot.get("stripeCustomerId"); if (typeof customerId !== "string" || !customerId) {
      response.status(404).json({error: "billing_customer_not_found"}); return;
    } const session = await stripeClient().billingPortal.sessions.create({customer: customerId, return_url: `${officialOrigin()}/produtos`}); response.json({portalUrl: session.url});
  } catch (error) {
    logger.error("Portal creation failed", {error}); response.status(500).json({error: "portal_creation_failed"});
  }
});

api.get("/entitlements/ptz", authenticate, rateLimit(30, 60_000), async (request: AuthenticatedRequest, response: Response) => {
  try {
    const snapshot = await firestore.collection("billingUsers").doc(request.firebaseUid!).get(); const billing = snapshot.data(); const iso = (value: unknown) => value instanceof Timestamp ? value.toDate().toISOString() : undefined; response.setHeader("Cache-Control", "private, no-store"); response.json({active: hasActiveAccess(billing?.status), planId: billing?.planId, status: billing?.status, trialEnd: iso(billing?.trialEnd), nextChargeAt: iso(billing?.currentPeriodEnd), currentPeriodEnd: iso(billing?.currentPeriodEnd), cancelAtPeriodEnd: billing?.cancelAtPeriodEnd === true});
  } catch (error) {
    logger.error("Entitlement lookup failed", {error}); response.status(500).json({error: "entitlement_lookup_failed"});
  }
});

api.post("/stripe-webhook", rateLimit(300, 60_000), async (request: Request, response: Response) => {
  const signature = request.headers["stripe-signature"]; if (!signature) {
    response.status(400).send("Missing Stripe-Signature"); return;
  }
  let event: Stripe.Event; try {
    event = stripeClient().webhooks.constructEvent((request as FirebaseRequest).rawBody, signature, stripeWebhookSecret.value());
  } catch {
    response.status(400).send("Invalid webhook signature"); return;
  }
  const reference = firestore.collection("stripeEvents").doc(event.id);
  try {
    const shouldProcess = await firestore.runTransaction(async (transaction) => {
      if ((await transaction.get(reference)).exists) return false; transaction.create(reference, {type: event.type, receivedAt: FieldValue.serverTimestamp()}); return true;
    }); if (shouldProcess) await reconcileEvent(event); response.json({received: true, duplicate: !shouldProcess});
  } catch (error) {
    logger.error("Webhook processing failed", {eventId: event.id, eventType: event.type, error}); response.status(500).json({error: "webhook_processing_failed"});
  }
});

export const billing = onRequest({secrets: [stripeSecretKey, stripeWebhookSecret, stripePriceMonthly, stripePriceYearly, appUrl], timeoutSeconds: 30, memory: "256MiB"}, api);
