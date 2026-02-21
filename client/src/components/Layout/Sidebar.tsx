import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Layers, Camera, LogOut, LogIn, Sun, Moon, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LoginModal from '../Auth/LoginModal';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Theme Hook
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Criar', path: '/' },
    { icon: Layers, label: 'Biblioteca', path: '/library' },
    { icon: Camera, label: 'Scanner', path: '/scanner' },
    { icon: User, label: 'Perfil', path: '/profile' }
  ];

  if (isAdmin) {
    navItems.push({ icon: ShieldCheck, label: 'Admin', path: '/admin' });
  }

  return (
    <>
      <aside className="sidebar">
        <div style={{ marginBottom: '32px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/')}>
           <img src="/logo.png" alt="UAU" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', flex: 1 }}>
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                color: isActive(item.path) ? 'var(--neon-purple)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                width: '100%'
              }}
            >
              <div style={{
                padding: '10px',
                borderRadius: '12px',
                background: isActive(item.path) ? 'rgba(188, 54, 194, 0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}>
                <item.icon size={24} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 600 }}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', width: '100%', alignItems: 'center' }}>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'all 0.2s'
            }}
            title={theme === 'dark' ? 'Mudar para Claro' : 'Mudar para Escuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <>
               {/* User Avatar */}
               <div style={{ 
                 width: '32px', 
                 height: '32px', 
                 borderRadius: '50%', 
                 background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 overflow: 'hidden',
                 border: '1px solid rgba(255,255,255,0.2)'
               }}>
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
               </div>

               <button
                onClick={() => logout()}
                style={{
                  background: 'transparent',
                  border: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--error)',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={20} />
                <span style={{ fontSize: '10px' }}>Sair</span>
              </button>
            </>
          ) : (
             <button
              onClick={() => setShowLoginModal(true)}
              style={{
                background: 'transparent',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text)',
                cursor: 'pointer',
              }}
            >
              <div style={{
                  padding: '10px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  transition: 'all 0.2s'
                }}>
                <LogIn size={20} />
              </div>
              <span style={{ fontSize: '10px' }}>Entrar</span>
            </button>
          )}
        </div>
      </aside>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onSuccess={() => setShowLoginModal(false)}
      />

      <style>{`
        .sidebar {
          width: 80px;
          height: 100dvh;
          background: var(--surface);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        @media (max-width: 768px) {
          .sidebar {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
