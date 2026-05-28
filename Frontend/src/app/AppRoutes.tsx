import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import AppRoot from './AppRoot';

/** Rutas públicas (/privacidad) y aplicación principal. */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/privacidad" element={<PrivacyPolicyPage />} />
        <Route path="/*" element={<AppRoot />} />
      </Routes>
    </BrowserRouter>
  );
}
