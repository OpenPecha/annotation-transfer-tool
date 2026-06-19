import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { applyTheme } from "@/app/shared/hooks/useTheme";

import App from "./app/App";
import "./styles/index.css";

applyTheme("light");

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
