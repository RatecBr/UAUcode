import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layers, Camera, Plus } from 'lucide-react';
import { useAuth } from '../../AuthContext';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [showLogo, setShowLogo] = useState(true);

  // Alterna entre Logo e Avatar a cada 3 segundos se estiver logado
  useEffect(() => {
    if (!user) {
      return;
    }

    const interval = setInterval(() => {
      setShowLogo(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

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
      padding: '0 12px',
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
      width: '64px',
      transition: 'all 0.2s'
    }),
    logoBtn: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.05)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      border: '1px solid var(--glass-border)',
      cursor: 'pointer',
      transition: 'all 0.5s ease-in-out'
    },
    avatar: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontWeight: 800,
      fontSize: '18px'
    }
  };

  return (
    <nav style={styles.nav} className="mobile-nav">
      
      {/* 1. Logo/Avatar (Far Left) */}
      <div onClick={() => navigate('/profile')} style={styles.logoBtn}>
        {(!user || showLogo) ? (
          <img src="/logo.png" alt="UAU" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        ) : (
          <div style={styles.avatarPlaceholder}>
            {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
              <img src={user.user_metadata.avatar_url || user.user_metadata.picture} alt="Perfil" style={styles.avatar} />
            ) : (
              <span>{user.email?.charAt(0).toUpperCase()}</span>
            )}
          </div>
        )}
      </div>

      {/* 2. Criar (Home) */}
      <button onClick={() => navigate('/')} style={styles.navItem(isActive('/'))}>
        <Plus size={22} color={isActive('/') ? 'var(--neon-purple)' : 'currentColor'} />
        <span>Criar</span>
      </button>

      {/* 3. Biblioteca */}
      <button onClick={() => navigate('/library')} style={styles.navItem(isActive('/library'))}>
        <Layers size={22} color={isActive('/library') ? 'var(--neon-purple)' : 'currentColor'} />
        <span>Biblioteca</span>
      </button>

      {/* 4. Scanner */}
      <button onClick={() => navigate('/scanner')} style={styles.navItem(isActive('/scanner'))}>
        <Camera size={22} color={isActive('/scanner') ? 'var(--neon-blue)' : 'currentColor'} />
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
