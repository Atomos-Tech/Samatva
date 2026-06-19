import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Augment the global Window type to avoid the unsafe `any` cast for the
// Firebase App Check debug token (development only).
declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// Initialize Firebase App Check — only on the client side.
if (typeof window !== "undefined") {
  // In local development, enable the App Check debug token.
  // This must NEVER run in production.
  if (import.meta.env.DEV) {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }

  // Fail loudly if the reCAPTCHA key is missing — a missing key means
  // App Check is silently bypassed, which is a security misconfiguration.
  const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  if (!recaptchaKey && !import.meta.env.DEV) {
    console.error(
      "[Samatva] VITE_RECAPTCHA_SITE_KEY is not set. Firebase App Check will not be enforced in production.",
    );
  }

  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(recaptchaKey ?? "debug"),
    isTokenAutoRefreshEnabled: true,
  });
}

// Initialize Analytics only if supported (blocked in SSR / private-browsing contexts).
export const analyticsPromise = isSupported().then((yes) => (yes ? getAnalytics(app) : null));
