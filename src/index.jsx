import "./init";
import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { GuideProvider } from "./context/GuideContext.jsx";

// Import the new Vibe tokens which include all necessary CSS
import "@vibe/core/tokens";

const root = createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <GuideProvider>
      <App />
    </GuideProvider>
  </React.StrictMode>
);