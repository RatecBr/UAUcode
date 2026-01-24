import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Scanner from './pages/Scanner';
import PublicScanner from './pages/PublicScanner';

// Rota privada (requer login)
const PrivateRoute = ({ children, adminOnly }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        color: 'white',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0f'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          <div>Carregando...</div>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/" />;

  // Se é rota apenas para admin e usuário não é admin
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/s/:userSlug" element={<PublicScanner />} />
          <Route path="/s/:userSlug/:targetId" element={<PublicScanner />} />

          {/* Dashboard do usuário (qualquer logado) */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          {/* Scanner privado (para testes do usuário) */}
          <Route path="/scanner" element={
            <PrivateRoute>
              <Scanner />
            </PrivateRoute>
          } />

          {/* Painel Admin (apenas admins) */}
          <Route path="/admin" element={
            <PrivateRoute adminOnly>
              <AdminPanel />
            </PrivateRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
