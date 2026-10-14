import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth";
import {
  BillingPlanId,
  billingPlans,
  createCheckoutSession,
  getCurrentLegalDocuments,
  isBillingConfigured,
} from "../billing";
import { LegalFooter } from "../components/LegalFooter";
import { LegalDocument } from "../legal";

export function SubscribePage() {
  const { user, loading: authLoading, getToken, signOut } = useAuth();
  const [loading, setLoading] = useState<BillingPlanId | null>(null);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [checkoutEnabled, setCheckoutEnabled] = useState(false);
  const [legalLoading, setLegalLoading] = useState(true);
  const firstCharge = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
  }, []);

  useEffect(() => {
    if (!isBillingConfigured) {
      setLegalLoading(false);
      return;
    }
    void getCurrentLegalDocuments()
      .then((result) => {
        setDocuments(result.documents);
        setCheckoutEnabled(result.checkoutEnabled);
      })
      .catch((caught) =>
        setError(
          caught instanceof Error
            ? caught.message
            : "Não foi possível carregar os documentos vigentes.",
        ),
      )
      .finally(() => setLegalLoading(false));
  }, []);

  if (authLoading)
    return (
      <main className="access-page">
        <div className="access-spinner" />
        <p>Carregando sua conta…</p>
      </main>
    );
  if (!user) {
    window.location.replace(
      `/entrar?returnTo=${encodeURIComponent("/assinar")}`,
    );
    return null;
  }

  async function checkout(planId: BillingPlanId) {
    setLoading(planId);
    setError("");
    try {
      const legalVersions = Object.fromEntries(
        documents.map((document) => [document.type, document.version]),
      );
      window.location.assign(
        await createCheckoutSession(planId, {
          token: await getToken(),
          legalVersions,
        }),
      );
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Não foi possível abrir o checkout.";
      setError(message);
      setAccepted(false);
      setLoading(null);
      if (message.toLowerCase().includes("document"))
        void getCurrentLegalDocuments().then((result) =>
          setDocuments(result.documents),
        );
    }
  }

  return (
    <main className="checkout-page">
      <header>
        <a href="/" className="account-brand">
          <img src="/logo.png" alt="" />
          <span>
            <strong>OBS Stream</strong>
            <small>TOOLS</small>
          </span>
        </a>
        <button
          onClick={() => void signOut().then(() => window.location.assign("/"))}
        >
          Sair
        </button>
      </header>
      <section className="checkout-heading">
        <span>OBS STREAM TOOLS</span>
        <h1>Uma assinatura. Duas superfícies de controle.</h1>
        <p>
          Os planos mensal e anual liberam o OBS Deck e o Controle PTZ completos
          na mesma conta.
        </p>
        <div className="trial-callout">
          <strong>2 dias gratuitos</strong>
          <span>
            Informe o método de pagamento agora. Se você não cancelar durante o
            teste, a primeira cobrança será em <b>{firstCharge}</b>, no 3º dia.
          </span>
        </div>
      </section>
      <div className="checkout-plans">
        {billingPlans.map((plan) => (
          <article key={plan.id} className={plan.highlight ? "highlight" : ""}>
            {plan.highlight && (
              <span className="checkout-badge">ECONOMIZE R$ 40</span>
            )}
            <h2>{plan.name}</h2>
            <strong>
              {plan.priceLabel}
              <small>{plan.intervalLabel}</small>
            </strong>
            <p>{plan.description}</p>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p className="renewal-copy">
              Renovação automática a cada{" "}
              {plan.id === "ptz-monthly" ? "mês" : "ano"} até o cancelamento.
            </p>
            <button
              disabled={
                !isBillingConfigured ||
                !checkoutEnabled ||
                legalLoading ||
                !accepted ||
                Boolean(loading)
              }
              onClick={() => void checkout(plan.id)}
            >
              {loading === plan.id
                ? "Abrindo Stripe…"
                : `Iniciar teste no plano ${plan.name.toLowerCase()}`}
            </button>
          </article>
        ))}
      </div>
      <label className="legal-acceptance">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(event) => setAccepted(event.target.checked)}
        />
        <span>
          Li e aceito os{" "}
          <a href="/termos" target="_blank">
            Termos de Uso
          </a>{" "}
          e a{" "}
          <a href="/cancelamento-e-reembolso" target="_blank">
            Política de Cancelamento e Reembolso
          </a>{" "}
          e declaro estar ciente da{" "}
          <a href="/privacidade" target="_blank">
            Política de Privacidade
          </a>
          .
        </span>
      </label>
      {!isBillingConfigured && (
        <p className="checkout-notice">
          Checkout indisponível: configure o backend de cobrança.
        </p>
      )}
      {isBillingConfigured && !legalLoading && !checkoutEnabled && (
        <p className="checkout-notice">
          Checkout ainda não ativado. A revisão jurídica, a validação contábil e
          os testes externos precisam ser concluídos.
        </p>
      )}
      {error && (
        <p className="checkout-failure" role="alert">
          {error}
        </p>
      )}
      <div className="checkout-trust">
        <span>Pagamento processado pela Stripe</span>
        <span>Acesso vinculado a {user.email}</span>
        <span>Este site não recebe os dados completos do cartão</span>
      </div>
      <LegalFooter compact />
    </main>
  );
}
