import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "react-grid-layout/css/styles.css";
import { setBaseUrl } from "@workspace/api-client-react";

// Configure API base URL for remote API calls
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "";
setBaseUrl(apiBaseUrl || null);

// Apply saved theme before React renders — prevents flash of wrong theme
(function () {
  try {
    const theme = localStorage.getItem("sf-theme") ?? "system";
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.classList.add("dark");
    }
  } catch {}
})();

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
