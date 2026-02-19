import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Layers, User, Camera } from 'lucide-react';
import { useAuth } from '../../AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Só mostra se for mobile (controle via CSS media query no layout pai ou aqui mesmo)
  // Mas vamos fazer responsive via CSS global ou inline media query
  
  const isActive = (path: string) => location.pathname === path;

  const styles = {
    nav: {
      position: 'fixed' as const,
      bottom: 0,
      left: 0,
      width: '100%',
      height: '80px',
      background: 'rgba(10, 10, 15, 0.95)',
      backdropFilter: 'blur(10px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 16px',
      zIndex: 1000,
      paddingBottom: 'env(safe-area-inset-bottom, 16px)'
    },
    navItem: (active: boolean) => ({
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '4px',
      background: 'transparent',
      border: 'none',
      color: active ? '#fff' : 'rgba(255, 255, 255, 0.4)',
      fontSize: '10px',
      fontWeight: 600,
      cursor: 'pointer',
      width: '60px'
    }),
    fab: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 100%)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      boxShadow: '0 0 20px rgba(188, 54, 194, 0.5)',
      transform: 'translateY(-20px)',
      cursor: 'pointer'
    }
  };

  return (
    <nav style={styles.nav} className="mobile-nav">
      
      <button onClick={() => navigate('/library')} style={styles.navItem(isActive('/library'))}>
        <Layers size={24} color={isActive('/library') ? 'var(--neon-purple)' : 'currentColor'} />
        <span>Biblioteca</span>
      </button>

      {/* Central Create Button */}
      <button onClick={() => navigate('/')} style={styles.fab}>
        <Plus size={32} />
      </button>

      <button onClick={() => navigate('/scanner')} style={styles.navItem(isActive('/scanner'))}>
        <Camera size={24} color={isActive('/scanner') ? 'var(--neon-blue)' : 'currentColor'} />
        <span>Scanner</span>
      </button>

      <style>{`
        @media (min-width: 769px) {
          .mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
