import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Pricing from './pages/Pricing.tsx';
import Terms from './pages/Terms.tsx';
import Privacy from './pages/Privacy.tsx';
import Refunds from './pages/Refunds.tsx';
import './index.css';

const path = window.location.pathname.replace(/\/+$/, '') || '/';

let Page;

switch (path) {
  case '/pricing':
    Page = <Pricing />;
    break;

  case '/terms':
    Page = <Terms />;
    break;

  case '/privacy':
    Page = <Privacy />;
    break;

  case '/refunds':
    Page = <Refunds />;
    break;

  default:
    Page = <App />;
    break;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {Page}
  </StrictMode>
);
