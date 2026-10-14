import { publicPaths } from "./legal";

export const ANALYTICS_CONSENT_KEY = "verolab.analytics-consent.v1";
export const CONSENT_MAX_AGE_MS = 183 * 24 * 60 * 60 * 1000;

export type AnalyticsConsent = {
  choice: "accepted" | "rejected";
  decidedAt: number;
};

const measurementId = import.meta.env.VITE_GA4_MEASUREMENT_ID?.trim() || "";

export function readAnalyticsConsent(
  storage: Pick<Storage, "getItem" | "removeItem"> = localStorage,
  now = Date.now(),
): AnalyticsConsent | null {
  try {
    const stored = JSON.parse(
      storage.getItem(ANALYTICS_CONSENT_KEY) || "null",
    ) as AnalyticsConsent | null;
    if (
      !stored ||
      !["accepted", "rejected"].includes(stored.choice) ||
      now - stored.decidedAt >= CONSENT_MAX_AGE_MS
    ) {
      storage.removeItem(ANALYTICS_CONSENT_KEY);
      return null;
    }
    return stored;
  } catch {
    storage.removeItem(ANALYTICS_CONSENT_KEY);
    return null;
  }
}

export function isPublicAnalyticsPath(pathname = window.location.pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return publicPaths.has(path);
}

export function disableAnalytics() {
  if (!measurementId) return;
  (window as unknown as Record<string, unknown>)[`ga-disable-${measurementId}`] =
    true;
}

export function enableAnalytics(pathname = window.location.pathname) {
  if (!measurementId || !isPublicAnalyticsPath(pathname)) return;
  const globalWindow = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  } & Record<string, unknown>;
  globalWindow[`ga-disable-${measurementId}`] = false;
  globalWindow.dataLayer = globalWindow.dataLayer || [];
  globalWindow.gtag =
    globalWindow.gtag ||
    function (...args: unknown[]) {
      globalWindow.dataLayer!.push(args);
    };
  if (!document.querySelector(`script[data-ga4="${measurementId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.dataset.ga4 = measurementId;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
    globalWindow.gtag("js", new Date());
    globalWindow.gtag("config", measurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_path: pathname,
    });
  }
}
