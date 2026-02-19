import { createContext, useContext, useState, type ReactNode } from 'react';
// Force Vercel rebuild

interface CreationContextType {
  targetFile: File | null;
  setTargetFile: (file: File | null) => void;
  targetPreview: string | null;
  setTargetPreview: (url: string | null) => void;
  
  contentFile: File | null;
  setContentFile: (file: File | null) => void;
  contentPreview: string | null;
  setContentPreview: (url: string | null) => void;
  
  contentType: 'video' | 'audio' | '3d' | 'link';
  setContentType: (type: 'video' | 'audio' | '3d' | 'link') => void;
  
  contentLink: string;
  setContentLink: (link: string) => void;
  
  name: string;
  setName: (name: string) => void;

  isPendingAuth: boolean;
  setIsPendingAuth: (pending: boolean) => void;

  resetCreation: () => void;
}

const CreationContext = createContext<CreationContextType | undefined>(undefined);

export function CreationProvider({ children }: { children: ReactNode }) {
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [targetPreview, setTargetPreview] = useState<string | null>(null);
  
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentPreview, setContentPreview] = useState<string | null>(null);
  
  const [contentType, setContentType] = useState<'video' | 'audio' | '3d' | 'link'>('video');
  const [contentLink, setContentLink] = useState('');
  
  const [name, setName] = useState('');
  const [isPendingAuth, setIsPendingAuth] = useState(false);

  const resetCreation = () => {
    setTargetFile(null);
    setTargetPreview(null);
    setContentFile(null);
    setContentPreview(null);
    setContentType('video');
    setContentLink('');
    setName('');
    setIsPendingAuth(false);
  };

  return (
    <CreationContext.Provider value={{
      targetFile, setTargetFile,
      targetPreview, setTargetPreview,
      contentFile, setContentFile,
      contentPreview, setContentPreview,
      contentType, setContentType,
      contentLink, setContentLink,
      name, setName,
      isPendingAuth, setIsPendingAuth,
      resetCreation
    }}>
      {children}
    </CreationContext.Provider>
  );
}

export function useCreation() {
  const context = useContext(CreationContext);
  if (context === undefined) {
    throw new Error('useCreation must be used within a CreationProvider');
  }
  return context;
}
