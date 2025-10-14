import "./init";
import React from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import "./styles/table-of-contents.css";
import App from "./App";
import { GuideProvider } from "./context/GuideContext.jsx";

// Import the new Vibe tokens which include all necessary CSS
import "@vibe/core/tokens";

const root = createRoot(document.getElementById("root"));

// Toast מינימלי לשמירה מוצלחת
function mountSaveToast() {
  const id = 'guide-save-toast';
  if (document.getElementById(id)) return;
  const el = document.createElement('div');
  el.id = id;
  el.style.position = 'fixed';
  el.style.bottom = '16px';
  el.style.left = '16px';
  el.style.padding = '10px 14px';
  el.style.background = '#0ea5e9';
  el.style.color = 'white';
  el.style.borderRadius = '8px';
  el.style.fontSize = '14px';
  el.style.boxShadow = '0 4px 12px rgba(0,0,0,.2)';
  el.style.zIndex = '10000';
  el.style.transition = 'opacity .2s ease';
  el.style.opacity = '0';
  document.body.appendChild(el);

  window.addEventListener('guide:saved', (e) => {
    const ts = new Date(e.detail?.ts || Date.now());
    el.textContent = `נשמר לפני רגע · ${ts.toLocaleTimeString()}`;
    el.style.opacity = '1';
    clearTimeout(window.__save_toast_timer);
    window.__save_toast_timer = setTimeout(() => {
      el.style.opacity = '0';
    }, 2000);
  });
}

if (typeof window !== 'undefined') {
  mountSaveToast();
}

root.render(
  <React.StrictMode>
    <GuideProvider>
      <App />
    </GuideProvider>
  </React.StrictMode>
);