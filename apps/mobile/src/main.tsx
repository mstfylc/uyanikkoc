import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/uk-m.css";
import "./styles/base.css";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("#root bulunamadı");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
