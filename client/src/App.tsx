import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { CreationProvider } from './contexts/CreationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/Layout/MainLayout';

import Login from './pages/Login';
import Home from './pages/Home';
import MyLibrary from './pages/MyLibrary';
import AdminDashboard from './pages/AdminDashboard';
import Scanner from './pages/Scanner';
import PublicScanner from './pages/PublicScanner';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

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
        <div className="animate-spin">⏳</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  // Se é rota apenas para admin e usuário não é admin
  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/library" />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CreationProvider>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={
                <MainLayout>
                  <Home />
                </MainLayout>
              } />
              
              <Route path="/login" element={<Login />} />
              
              <Route path="/s/:userSlug" element={<PublicScanner />} />
              <Route path="/s/:userSlug/:targetId" element={<PublicScanner />} />
              
              <Route path="/terms" element={
                 <MainLayout>
                   <Terms />
                 </MainLayout>
              } />
              
              <Route path="/privacy" element={
                <MainLayout>
                   <Privacy />
                 </MainLayout>
              } />

              {/* My Library (Protegida) */}
              <Route path="/library" element={
                <PrivateRoute>
                  <MainLayout>
                    <MyLibrary />
                  </MainLayout>
                </PrivateRoute>
              } />

              {/* Legacy Dashboard Route -> Redirect to Library */}
              <Route path="/dashboard" element={<Navigate to="/library" replace />} />

              {/* Scanner privado (para testes do usuário) */}
              {/* Ocultamos o BottomNav no Scanner para imersão total */}
              <Route path="/scanner" element={
                <PrivateRoute>
                  <MainLayout showNav={true} overlayNav={true}> 
                    <Scanner />
                  </MainLayout>
                </PrivateRoute>
              } />

              {/* Painel Admin (apenas admins) */}
              <Route path="/admin" element={
                <PrivateRoute adminOnly>
                  <MainLayout>
                    <AdminDashboard />
                  </MainLayout>
                </PrivateRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CreationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
