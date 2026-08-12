import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import Pricing from './pages/Pricing.tsx';
import Terms from './pages/Terms.tsx';
import Privacy from './pages/Privacy.tsx';
import Refunds from './pages/Refunds.tsx';
import './index.css';

const path = window.location.pathname.replace(/\/+$/, '') || '/';

const Page = (() => {
  switch (path) {
    case '/pricing':
      return <Pricing />;

    case '/terms':
      return <Terms />;

    case '/privacy':
      return <Privacy />;

    case '/refunds':
      return <Refunds />;

    default:
      return <App />;
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {Page}
  </StrictMode>
);
