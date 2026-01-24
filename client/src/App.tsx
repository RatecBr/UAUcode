import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './pages/Scanner';

const PrivateRoute = ({ children, role }: { children: React.ReactNode, role?: 'admin' | 'user' }) => {
  const { token, user } = useAuth();

  if (!token) return <Navigate to="/" />;

  if (role && user) {
    if (user.role !== role && user.role !== 'admin') {
      return <Navigate to={user.role === 'admin' ? '/admin' : '/scanner'} />;
    }
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
          <Route path="/scanner" element={
            <PrivateRoute>
              <Scanner />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
