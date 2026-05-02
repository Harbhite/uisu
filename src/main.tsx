import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { reportError } from "./lib/error-reporting";
import App from "./App.tsx";
import "./index.css";

// Global runtime error capture (uncaught errors + unhandled promise rejections).
// Throttled to avoid logging the same error repeatedly.
const recentErrors = new Map<string, number>();
const shouldReport = (key: string) => {
  const now = Date.now();
  const last = recentErrors.get(key) || 0;
  if (now - last < 5000) return false;
  recentErrors.set(key, now);
  // Cap map size
  if (recentErrors.size > 50) {
    const oldest = [...recentErrors.entries()].sort((a, b) => a[1] - b[1])[0]?.[0];
    if (oldest) recentErrors.delete(oldest);
  }
  return true;
};

window.addEventListener("error", (event) => {
  const message = event.message || "Unknown error";
  // Skip noisy benign errors
  if (/ResizeObserver|Script error|Loading chunk/i.test(message)) return;
  const key = `err:${message}`;
  if (!shouldReport(key)) return;
  reportError({
    message,
    stack: event.error?.stack,
    metadata: { source: "window.error", filename: event.filename, lineno: event.lineno, colno: event.colno },
  });
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  const message = typeof reason === "string" ? reason : reason?.message || "Unhandled promise rejection";
  if (/AbortError|cancelled/i.test(message)) return;
  const key = `rej:${message}`;
  if (!shouldReport(key)) return;
  reportError({
    message,
    stack: reason?.stack,
    metadata: { source: "unhandledrejection" },
  });
});

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </HelmetProvider>
);
