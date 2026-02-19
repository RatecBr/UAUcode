import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  overlayNav?: boolean;
}

export default function MainLayout({ children, showNav = true, overlayNav = false }: MainLayoutProps) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', background: '#0a0a0f' }}>
      {/* Sidebar - Desktop Only (Hidden on Mobile via CSS) */}
      {showNav && !overlayNav && <Sidebar />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, position: 'relative' }}>
        <div 
          className="main-content"
          style={{ flex: 1, paddingBottom: (showNav && !overlayNav) ? '80px' : '0' }}
        >
          {children}
        </div>
        
        {/* BottomNav - Mobile Only (Hidden on Desktop via CSS) */}
        {showNav && <BottomNav />}
      </div>

      <style>{`
        @media (min-width: 769px) {
           .main-content {
              padding-bottom: 0 !important;
           }
        }
      `}</style>
    </div>
  );
}
