import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/** Bump this string to force every visitor's browser to drop stale caches. */
const CACHE_RELEASE = "2026-08-08-logout-cache-1";

const unregisterServiceWorkers = async () => {
  if (!("serviceWorker" in navigator)) return false;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.allSettled(registrations.map((registration) => registration.unregister()));
  return registrations.length > 0;
};

const purgeStaleCaches = async () => {
  try {
    // Always drop any lingering service worker so stale app shells can never be served.
    const hadWorker = await unregisterServiceWorkers();
    if (localStorage.getItem("eden-cache-release") === CACHE_RELEASE) {
      if (hadWorker && "caches" in window) {
        const keys = await caches.keys();
        await Promise.allSettled(keys.map((key) => caches.delete(key)));
      }
      return;
    }
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.allSettled(keys.map((key) => caches.delete(key)));
    }
    localStorage.setItem("eden-cache-release", CACHE_RELEASE);
    window.location.reload();
  } catch (error) {
    console.error("Cache purge skipped:", error);
  }
};

void purgeStaleCaches();

const root = document.getElementById("root");

if (!root) {
  throw new Error("Application root element was not found");
}

createRoot(root).render(<App />);

