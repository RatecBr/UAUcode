import React, { useState } from 'react';
import { useCreation } from '../../contexts/CreationContext';
import { Upload, Video, Mic, Loader2, Image as ImageIcon, Camera, FileText } from 'lucide-react';
import { optimizeImage } from '../../utils/fileOptimizer';
import MediaCapture from '../MediaCapture';

interface CreationFormProps {
  onSuccess?: () => void;
  isUploading?: boolean;
}

export default function CreationForm({ onSuccess, isUploading = false }: CreationFormProps) {
  const {
    targetFile, setTargetFile, targetPreview, setTargetPreview,
    contentFile, setContentFile, contentPreview, setContentPreview,
    contentType, setContentType,
    contentLink, setContentLink,
    name, setName,
    isPublic, setIsPublic,
    categories, setCategories
  } = useCreation();

  const [targetMode, setTargetMode] = useState<'camera' | 'file'>('camera');
  const [contentMode, setContentMode] = useState<'record' | 'file'>('record');
  
  // Media Capture State
  const [showCapture, setShowCapture] = useState(false);
  const [captureConfig, setCaptureConfig] = useState<{ mode: 'photo' | 'video' | 'audio', target: 'target' | 'content' } | null>(null);

  const handleFileChange = async (file: File | null, type: 'target' | 'content') => {
    if (!file) return;

    let processedFile = file;

    // Optimize if image
    if (type === 'target' || (type === 'content' && file.type.startsWith('image/'))) {
      try {
        const maxWidth = type === 'target' ? 800 : 1280;
        processedFile = await optimizeImage(file, maxWidth, 0.6);
      } catch (e) {
        console.error("Error optimizing image:", e);
      }
    }

    if (type === 'target') {
      setTargetFile(processedFile);
      setTargetPreview(URL.createObjectURL(processedFile));
    } else {
      setContentFile(processedFile);
      setContentPreview(URL.createObjectURL(processedFile));
    }
  };

  const openCamera = (target: 'target' | 'content') => {
    let mode: 'photo' | 'video' | 'audio' = 'photo';
    if (target === 'content') {
        if (contentType === 'video') mode = 'video';
        if (contentType === 'audio') mode = 'audio';
    }
    setCaptureConfig({ mode, target });
    setShowCapture(true);
  };

  const handleCapture = (file: File) => {
    if (captureConfig?.target === 'target') {
        handleFileChange(file, 'target');
    } else if (captureConfig?.target === 'content') {
        handleFileChange(file, 'content');
    }
    setShowCapture(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSuccess) onSuccess();
  };

  const styles = {
    container: {
      background: 'var(--surface)',
      border: '1px solid var(--glass-border)',
      borderRadius: '24px',
      padding: '24px',
      maxWidth: '800px',
      width: '100%',
      margin: '0 auto',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)', // Reduced shadow opacity for light mode compatibility? Or keep dark?
      fontFamily: 'Inter, sans-serif',
      color: 'var(--text)'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    },
    title: {
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--text)',
        margin: 0
    },
    sectionLabel: {
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase' as const,
        marginBottom: '12px',
        letterSpacing: '0.05em'
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '12px',
      color: 'var(--text)',
      fontSize: '14px',
      marginBottom: '24px',
      outline: 'none'
    },
    toggleContainer: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
    },
    toggleBtn: (isActive: boolean) => ({
        flex: 1,
        padding: '12px',
        borderRadius: '12px',
        border: isActive ? '1px solid var(--neon-purple)' : '1px solid var(--glass-border)',
        background: isActive ? 'rgba(188, 54, 194, 0.1)' : 'transparent',
        color: isActive ? 'var(--text)' : 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'all 0.2s'
    }),
    uploadBox: {
      border: '1px dashed var(--glass-border)',
      borderRadius: '16px',
      height: '140px',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      background: 'var(--glass-bg)',
      transition: 'all 0.2s',
      marginBottom: '24px',
      position: 'relative' as const,
      overflow: 'hidden' as const
    },
    preview: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    typeGrid: {
      display: 'flex',
      background: 'var(--glass-bg)',
      padding: '4px',
      borderRadius: '12px',
      marginBottom: '24px'
    },
    typeBtn: (isActive: boolean) => ({
      flex: 1,
      padding: '10px',
      borderRadius: '8px',
      border: 'none',
      background: isActive ? 'var(--neon-purple)' : 'transparent',
      color: isActive ? '#fff' : 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: '12px',
      fontWeight: 600,
      transition: 'all 0.2s',
      textAlign: 'center' as const
    }),
    submitBtn: {
        width: '100%',
        padding: '16px',
        background: 'linear-gradient(90deg, #5142FC 0%, #BC36C2 100%)',
        border: 'none',
        borderRadius: '50px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 8px 25px rgba(81, 66, 252, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '12px',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em',
        touchAction: 'manipulation', // Melhora resposta ao toque no mobile
        userSelect: 'none' as const,
        WebkitTapHighlightColor: 'transparent'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
                {/* <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
             <X size={16} />
        </button> */}
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Nome e Categoria */}
        <div style={styles.sectionLabel}>NOME DA EXPERIÊNCIA</div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input 
              type="text" 
              placeholder="Ex: Cartão de Visitas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ ...styles.input, marginBottom: 0, flex: 1 }}
            />
            
            {/* Category Dropdown */}
            <div style={{ position: 'relative', width: '200px' }}>
                <button 
                    type="button" 
                    onClick={() => document.getElementById('category-dropdown')?.classList.toggle('show')}
                    style={{
                        width: '100%',
                        height: '100%',
                        padding: '0 12px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: categories.length > 0 ? 'var(--text)' : 'var(--text-muted)',
                        fontSize: '13px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {categories.length > 0 ? `${categories.length} Selecionado(s)` : 'Tipo (Vários)'}
                    </span>
                    <span style={{ fontSize: '10px' }}>▼</span>
                </button>
                
                <div id="category-dropdown" style={{
                    display: 'none',
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '220px',
                    background: '#1a1a2e',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '8px',
                    zIndex: 100,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    maxHeight: '300px',
                    overflowY: 'auto'
                }}>
                    {[
                        'Acessibilidade', 'Rótulo', 'Gente', 'Animal', 
                        'Natureza', 'Produto', 'Logomarca', 'Placa', 'Objeto', 'Outros'
                    ].map(cat => (
                        <label key={cat} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            color: 'var(--text)',
                            borderRadius: '6px',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <input 
                                type="checkbox"
                                checked={categories.includes(cat)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setCategories([...categories, cat]);
                                    } else {
                                        setCategories(categories.filter((c: string) => c !== cat));
                                    }
                                }}
                                style={{ marginRight: '8px', accentColor: 'var(--neon-purple)' }}
                            />
                            {cat}
                        </label>
                    ))}
                    <div 
                        style={{ 
                            position: 'fixed', inset: 0, zIndex: -1 
                        }} 
                        onClick={() => document.getElementById('category-dropdown')?.classList.remove('show')}
                    />
                </div>
            </div>
        </div>
        
        <style>{`
            #category-dropdown.show { display: block !important; }
        `}</style>
        
        {/* Autorização Galeria - MOVED DOWN */}

        {/* Passo 1: Imagem Alvo */}
        <div style={styles.sectionLabel}>IMAGEM ALVO (MARCADOR AR)</div>
        
        <div style={styles.toggleContainer}>
            <button type="button" onClick={() => setTargetMode('camera')} style={styles.toggleBtn(targetMode === 'camera')}>
                <Camera size={18} color={targetMode === 'camera' ? '#00ff9d' : 'currentColor'} /> CÂMERA
            </button>
            <button type="button" onClick={() => setTargetMode('file')} style={styles.toggleBtn(targetMode === 'file')}>
                <ImageIcon size={18} color={targetMode === 'file' ? '#00ff9d' : 'currentColor'} /> ARQUIVO
            </button>
        </div>

        {targetMode === 'camera' ? (
             <div style={styles.uploadBox} onClick={() => openCamera('target')}>
                {targetPreview ? (
                   <img src={targetPreview} alt="Target" style={styles.preview} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                        <Camera size={32} />
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>CLIQUE PARA ABRIR CÂMERA</span>
                    </div>
                )}
             </div>
        ) : (
            <label style={styles.uploadBox}>
                <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'target')}
                style={{ display: 'none' }}
                />
                {targetPreview ? (
                <img src={targetPreview} alt="Target Preview" style={styles.preview} />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                    <Upload size={32} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>CLIQUE PARA CARREGAR IMAGEM</span>
                </div>
                )}
            </label>
        )}

        {/* Passo 2: Tipo de Conteúdo (Só aparece após definir Target) */}
        {targetFile && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div style={styles.sectionLabel}>TIPO DE CONTEÚDO</div>
                <div style={styles.typeGrid}>
                    <button type="button" onClick={() => setContentType('video')} style={styles.typeBtn(contentType === 'video')}>VIDEO</button>
                    <button type="button" onClick={() => setContentType('audio')} style={styles.typeBtn(contentType === 'audio')}>AUDIO</button>
                    <button type="button" onClick={() => setContentType('3d')} style={styles.typeBtn(contentType === '3d')}>3D</button>
                    <button type="button" onClick={() => setContentType('link')} style={styles.typeBtn(contentType === 'link')}>LINK</button>
                </div>

                {/* Content Source */}
                {contentType !== 'link' && (
                     <div style={styles.sectionLabel}>CONTEÚDO AR (ARQUIVO OU GRAVAÇÃO)</div>
                )}

                {contentType === 'link' ? (
                   <input 
                     type="url" 
                     placeholder="https://seu-link.com"
                     value={contentLink}
                     onChange={(e) => setContentLink(e.target.value)}
                     style={styles.input}
                     required
                   />
                ) : (
                    <>
                         {contentType !== '3d' && (
                            <div style={styles.toggleContainer}>
                                <button type="button" onClick={() => setContentMode('record')} style={styles.toggleBtn(contentMode === 'record')}>
                                    {contentType === 'audio' ? <Mic size={18} color={contentMode === 'record' ? '#00ff9d' : 'currentColor'} /> : <Video size={18} color={contentMode === 'record' ? '#00ff9d' : 'currentColor'} />}
                                    GRAVAR
                                </button>
                                <button type="button" onClick={() => setContentMode('file')} style={styles.toggleBtn(contentMode === 'file')}>
                                     <FileText size={18} color={contentMode === 'file' ? '#00ff9d' : 'currentColor'} /> ARQUIVO
                                </button>
                            </div>
                         )}

                         {(contentMode === 'record' && contentType !== '3d') ? (
                              <div style={styles.uploadBox} onClick={() => openCamera('content')}>
                                   {contentPreview ? (
                                        contentType === 'video' ? <video src={contentPreview} controls style={styles.preview} /> : 
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Mic size={32} /> Audio Gravado</div>
                                   ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                                            {contentType === 'audio' ? <Mic size={32} /> : <Video size={32} />}
                                            <span style={{ fontSize: '12px', fontWeight: 600 }}>CLIQUE PARA GRAVAR</span>
                                        </div>
                                   )}
                              </div>
                         ) : (
                            <label style={styles.uploadBox}>
                                <input 
                                type="file" 
                                accept={
                                    contentType === 'video' ? 'video/*' :
                                    contentType === 'audio' ? 'audio/*' :
                                    '.glb,.gltf'
                                } 
                                onChange={(e) => handleFileChange(e.target.files?.[0] || null, 'content')}
                                style={{ display: 'none' }}
                                />
                                
                                {contentPreview ? (
                                contentType === 'video' ? (
                                    <video src={contentPreview} style={styles.preview} controls />
                                ) : contentType === 'audio' ? (
                                    <div style={{ padding: '20px', borderRadius: '12px', width: '100%' }}>
                                        <audio src={contentPreview} controls style={{ width: '100%' }} />
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: 20 }}>{contentFile?.name}</div>
                                )
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                                    <Upload size={32} />
                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>CARREGAR {contentType.toUpperCase()}</span>
                                </div>
                                )}
                            </label>
                         )}
                    </>
                )}
            </div>
        )}

        {/* Passo 3: Finalização (Só aparece se tiver conteúdo e target) */}
        {(targetFile && (contentFile || (contentType === 'link' && contentLink))) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Autorização Galeria - MOVED HERE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', marginTop: '24px', background: 'var(--glass-bg)', padding: '12px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>Exibir na Galeria Pública?</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sua criação aparecerá na Home para todos verem.</div>
                    </div>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={isPublic} 
                            onChange={(e) => setIsPublic(e.target.checked)} 
                        />
                        <span className="slider round"></span>
                    </label>
                </div>

                <button 
                  type="submit" 
                  disabled={isUploading}
                  style={{
                      ...styles.submitBtn,
                      opacity: isUploading ? 0.8 : 1,
                      cursor: isUploading ? 'wait' : 'pointer'
                  }}
                >
                  {isUploading ? <Loader2 className="animate-spin" /> : null}
                  {isUploading ? 'CRIANDO...' : 'CRIAR AGORA'}
                </button>
            </div>
        )}

      </form>
      
      {showCapture && captureConfig && (
        <MediaCapture 
            mode={captureConfig.mode}
            onCapture={handleCapture}
            onClose={() => setShowCapture(false)}
        />
      )}
    </div>
  );
}
