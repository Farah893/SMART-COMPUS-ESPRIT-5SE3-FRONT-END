import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/auth/AuthContext";
import { onError, tokenStore } from "@/api/client";

// Intercepteur global : un 401 invalide la session (le modèle de connexion viendra avec le backend).
onError((e) => {
  if (e.status === 401) tokenStore.clear();
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
);
