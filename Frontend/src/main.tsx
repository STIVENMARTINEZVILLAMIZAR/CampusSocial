import { createRoot } from 'react-dom/client';
import AppRoutes from './app/AppRoutes';
import { ConfigErrorScreen } from './app/ConfigErrorScreen';
import { RootErrorBoundary } from './app/RootErrorBoundary';
import { hasRealFirebaseWebConfig } from './lib/firebase';
import './styles/index.css';

const root = document.getElementById('root')!;

createRoot(root).render(
  <RootErrorBoundary>
    {import.meta.env.PROD && !hasRealFirebaseWebConfig() ? <ConfigErrorScreen /> : <AppRoutes />}
  </RootErrorBoundary>
);
