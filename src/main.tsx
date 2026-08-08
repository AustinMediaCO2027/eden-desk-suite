import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/** Bump this string to force every visitor's browser to drop stale caches. */
const CACHE_RELEASE = "2026-08-08-cache-purge-2";

const purgeStaleCaches = async () => {
  try {
    if (localStorage.getItem("eden-cache-release") === CACHE_RELEASE) return;
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.allSettled(registrations.map((registration) => registration.unregister()));
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

