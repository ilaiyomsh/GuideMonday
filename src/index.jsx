import "./init";
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { GuideProvider } from "./context/GuideContext";

const root = createRoot(document.getElementById("root"));

// 2. Wrap the <App /> component with the <GuideProvider />
root.render(
  <React.StrictMode>
    <GuideProvider>
      <App />
    </GuideProvider>
  </React.StrictMode>
);