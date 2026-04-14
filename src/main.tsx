import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DateProvider } from "./context/General.context";
import "./i18n/config";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DateProvider>
        <App />
      </DateProvider>
    </QueryClientProvider>
  </StrictMode>,
);
