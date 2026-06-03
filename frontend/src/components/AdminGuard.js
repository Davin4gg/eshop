import React from 'react';
import { Navigate } from 'react-router-dom';

function AdminGuard({ children }) {
  const stored = localStorage.getItem('user');
  if (!stored) return <Navigate to="/login" replace />;
  const user = JSON.parse(stored);
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default AdminGuard;