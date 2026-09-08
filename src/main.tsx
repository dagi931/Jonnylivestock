import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Self-hosted variable fonts — eliminates render-blocking Google Fonts request
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/lora';
import './index.css';

if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
