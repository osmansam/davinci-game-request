import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DateProvider } from "./context/General.context";
import i18n from "./i18n/config";
import "./index.css";

const queryClient = new QueryClient();

const normalizeLang = (lang: string) => (lang.startsWith("tr") ? "tr" : "en");
const syncDocumentLanguage = (lang: string) => {
  document.documentElement.lang = normalizeLang(lang);
};

syncDocumentLanguage(i18n.resolvedLanguage || i18n.language || "tr");
i18n.on("languageChanged", syncDocumentLanguage);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DateProvider>
        <App />
      </DateProvider>
    </QueryClientProvider>
  </StrictMode>,
);
