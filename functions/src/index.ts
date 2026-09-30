/* eslint-disable require-jsdoc */
import {initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {FieldValue, Timestamp, getFirestore} from "firebase-admin/firestore";
import {defineSecret} from "firebase-functions/params";
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

type PlanId = "ptz-monthly" | "ptz-yearly";
type AuthenticatedRequest = Request & {
  firebaseUid?: string;
  firebaseEmail?: string;
};
type FirebaseRequest = Request & {rawBody: Buffer};

const firestore = getFirestore();
const api = express();

function stripeClient() {
  return new Stripe(stripeSecretKey.value());
}

function allowedOrigins() {
  return new Set([
    appUrl.value().replace(/\/$/, ""),
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
  ]);
}

function cors(request: Request, response: Response, next: NextFunction) {
  const origin = request.headers.origin;
  if (origin && allowedOrigins().has(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Authorization, Content-Type",
  );
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (request.method === "OPTIONS") {
    response.status(204).end();
    return;
  }
  next();
}

async function authenticate(
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) {
  const authorization = request.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    response.status(401).json({error: "authentication_required"});
    return;
  }

  try {
    const decoded = await getAuth().verifyIdToken(authorization.slice(7), true);
    request.firebaseUid = decoded.uid;
    request.firebaseEmail = decoded.email;
    next();
  } catch (error) {
    logger.warn("Firebase ID token rejected", {error});
    response.status(401).json({error: "invalid_authentication"});
  }
}

function priceFor(planId: PlanId) {
  return planId === "ptz-monthly" ?
    stripePriceMonthly.value() : stripePriceYearly.value();
}

function isPlanId(value: unknown): value is PlanId {
  return value === "ptz-monthly" || value === "ptz-yearly";
}

function hasActiveAccess(status: Stripe.Subscription.Status | undefined) {
  return status === "active" || status === "trialing";
}

async function getOrCreateCustomer(uid: string, email?: string) {
  const userReference = firestore.collection("billingUsers").doc(uid);
  const user = await userReference.get();
  const existingCustomerId = user.get("stripeCustomerId");
  if (typeof existingCustomerId === "string" && existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripeClient().customers.create({
    email,
    metadata: {firebaseUid: uid},
  });
  await userReference.set({
    stripeCustomerId: customer.id,
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});
  return customer.id;
}

async function persistSubscription(subscription: Stripe.Subscription) {
  const uid = subscription.metadata.firebaseUid;
  const planId = subscription.metadata.planId;
  if (!uid || !isPlanId(planId)) {
    logger.error("Subscription is missing trusted metadata", {
      subscriptionId: subscription.id,
    });
    return;
  }

  const periodEnd = subscription.items.data.reduce(
    (latest, item) => Math.max(latest, item.current_period_end),
    0,
  );

  await firestore.collection("billingUsers").doc(uid).set({
    stripeCustomerId: typeof subscription.customer === "string" ?
      subscription.customer : subscription.customer.id,
    subscriptionId: subscription.id,
    planId,
    status: subscription.status,
    currentPeriodEnd: periodEnd ? Timestamp.fromMillis(periodEnd * 1000) : null,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    updatedAt: FieldValue.serverTimestamp(),
  }, {merge: true});
}

api.use(cors);
api.use(express.json());

api.get("/health", (_request, response) => {
  response.json({ok: true, service: "obs-tools-billing"});
});

api.post("/checkout-sessions", authenticate, async (
  request: AuthenticatedRequest,
  response: Response,
) => {
  const planId = request.body?.planId;
  if (!isPlanId(planId)) {
    response.status(400).json({error: "invalid_plan"});
    return;
  }

  try {
    const uid = request.firebaseUid!;
    const customer = await getOrCreateCustomer(uid, request.firebaseEmail);
    const origin = appUrl.value().replace(/\/$/, "");
    const session = await stripeClient().checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{price: priceFor(planId), quantity: 1}],
      client_reference_id: uid,
      success_url: `${origin}/checkout/sucesso`,
      cancel_url: `${origin}/checkout/cancelado`,
      subscription_data: {metadata: {firebaseUid: uid, planId}},
      allow_promotion_codes: true,
    });
    response.json({checkoutUrl: session.url});
  } catch (error) {
    logger.error("Could not create Stripe Checkout session", {error});
    response.status(500).json({error: "checkout_creation_failed"});
  }
});

api.get("/entitlements/ptz", authenticate, async (
  request: AuthenticatedRequest,
  response: Response,
) => {
  try {
    const snapshot = await firestore.collection("billingUsers")
      .doc(request.firebaseUid!).get();
    const billing = snapshot.data();
    const active = hasActiveAccess(billing?.status);
    response.setHeader("Cache-Control", "private, no-store");
    response.json({
      active,
      ...(active && {
        planId: billing?.planId,
        currentPeriodEnd: billing?.currentPeriodEnd instanceof Timestamp ?
          billing.currentPeriodEnd.toDate().toISOString() : undefined,
      }),
    });
  } catch (error) {
    logger.error("Could not read PTZ entitlement", {error});
    response.status(500).json({error: "entitlement_lookup_failed"});
  }
});

api.post("/stripe-webhook", async (request: Request, response: Response) => {
  const signature = request.headers["stripe-signature"];
  if (!signature) {
    response.status(400).send("Missing Stripe-Signature");
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(
      (request as FirebaseRequest).rawBody,
      signature,
      stripeWebhookSecret.value(),
    );
  } catch (error) {
    logger.warn("Stripe webhook signature rejected", {error});
    response.status(400).send("Invalid webhook signature");
    return;
  }

  try {
    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      await persistSubscription(event.data.object);
    } else if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      if (typeof session.subscription === "string") {
        const subscription = await stripeClient().subscriptions.retrieve(
          session.subscription,
        );
        await persistSubscription(subscription);
      }
    }
    response.json({received: true});
  } catch (error) {
    logger.error("Stripe webhook processing failed", {
      error,
      eventId: event.id,
      eventType: event.type,
    });
    response.status(500).json({error: "webhook_processing_failed"});
  }
});

export const billing = onRequest({
  secrets: [
    stripeSecretKey,
    stripeWebhookSecret,
    stripePriceMonthly,
    stripePriceYearly,
    appUrl,
  ],
  timeoutSeconds: 30,
  memory: "256MiB",
}, api);
