import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { OperatorPage } from './pages/OperatorPage';
import { ViewerPage } from './pages/ViewerPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/operator" element={<OperatorPage />} />
      <Route path="/viewer" element={<ViewerPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
