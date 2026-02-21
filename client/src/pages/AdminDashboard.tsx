import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Camera, X, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '../AuthContext';
import ManageUsers from './ManageUsers';
import { optimizeImage } from '../utils/fileOptimizer';

interface Target {
    id: number;
    name: string;
    target_url: string;
    content_url: string;
    content_type: string;
    profiles?: {
        email: string;
        full_name?: string;
    }
}

export default function AdminDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState<'targets' | 'users'>('targets');
    const [targets, setTargets] = useState<Target[]>([]);
    const [uploading, setUploading] = useState(false);
    const [name, setName] = useState('');
    const [targetFile, setTargetFile] = useState<File | null>(null);
    const [contentFile, setContentFile] = useState<File | null>(null);
    const [contentType, setContentType] = useState('video');
    const [editId, setEditId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => { fetchTargets(); }, []);

    const fetchTargets = async () => {
        const { data, error } = await supabase
            .from('targets')
            .select('*, profiles(email, full_name)')
            .order('id', { ascending: false });
        if (!error) setTargets(data as any || []);
    };

    const uploadFile = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('assets').upload(filePath, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('assets').getPublicUrl(filePath);
        return data.publicUrl;
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editId && (!targetFile || !contentFile)) { alert("Arquivos obrigatórios"); return; }
        setUploading(true);
        try {
            let tUrl = null, cUrl = null;
            if (targetFile) tUrl = await uploadFile(targetFile);
            if (contentFile) cUrl = await uploadFile(contentFile);

            const payload: any = { name, content_type: contentType };
            if (tUrl) payload.target_url = tUrl;
            if (cUrl) payload.content_url = cUrl;

            if (editId) {
                await supabase.from('targets').update(payload).eq('id', editId);
            } else {
                await supabase.from('targets').insert({
                    name, target_url: tUrl, content_url: cUrl, content_type: contentType
                });
            }
            alert('Salvo com sucesso!');
            resetForm();
            fetchTargets();
        } catch (e: any) { alert(e.message); }
        finally { setUploading(false); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Deseja excluir esta experiência?")) return;
        
        try {
            // 1. Buscar as URLs atuais para limpeza do storage
            const { data: target, error: fetchError } = await supabase
                .from('targets')
                .select('target_url, content_url')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // 2. Extrair caminhos dos arquivos (última parte da URL)
            const filesToDelete: string[] = [];
            if (target.target_url) {
                const targetPath = target.target_url.split('/').pop();
                if (targetPath) filesToDelete.push(targetPath);
            }
            if (target.content_url) {
                const contentPath = target.content_url.split('/').pop();
                if (contentPath) filesToDelete.push(contentPath);
            }

            // 3. Remover do Storage se houver arquivos
            if (filesToDelete.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('assets')
                    .remove(filesToDelete);
                
                if (storageError) {
                    console.error("Erro ao limpar storage:", storageError);
                    // Continuamos a deleção mesmo se o storage falhar (ex: arquivo já não existia)
                }
            }

            // 4. Deletar do Banco de Dados
            const { error: dbError } = await supabase
                .from('targets')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            alert('Excluído com sucesso!');
            fetchTargets();
        } catch (e: any) {
            alert('Erro ao excluir: ' + e.message);
        }
    };

    const startEdit = (t: Target) => {
        setEditId(t.id);
        setName(t.name);
        setTargetFile(null);
        setContentFile(null);
        setShowForm(true);
    };

    const handleFileChange = async (file: File | null, type: 'target' | 'content') => {
        if (!file) return;
        let processedFile = file;
        if (type === 'target' || (type === 'content' && file.type.startsWith('image/'))) {
            try {
                processedFile = await optimizeImage(file, 0.6);
            } catch (e) { console.error('Erro ao otimizar:', e); }
        }
        if (type === 'target') setTargetFile(processedFile);
        else setContentFile(processedFile);
    };

    const resetForm = () => {
        setName('');
        setEditId(null);
        setTargetFile(null);
        setContentFile(null);
        setShowForm(false);
    };

    // Styles object for cleaner JSX
    const styles = {
        container: {
            minHeight: '100dvh',
            padding: '16px',
            paddingBottom: '100px',
            backgroundColor: '#0a0a0f',
            color: 'white',
            fontFamily: "'Inter', system-ui, sans-serif"
        } as React.CSSProperties,
        header: {
            marginBottom: '20px'
        } as React.CSSProperties,
        topRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
        } as React.CSSProperties,
        logo: {
            fontSize: '20px',
            fontWeight: 700,
            color: '#00ff9d',
            margin: 0
        } as React.CSSProperties,
        headerButtons: {
            display: 'flex',
            gap: '8px'
        } as React.CSSProperties,
        iconButton: {
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
        } as React.CSSProperties,
        tabContainer: {
            display: 'flex',
            gap: '8px',
            marginBottom: '20px'
        } as React.CSSProperties,
        tab: (isActive: boolean) => ({
            flex: 1,
            padding: '12px',
            fontSize: '14px',
            fontWeight: 600,
            textAlign: 'center' as const,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: isActive ? '#00ff9d' : 'rgba(255,255,255,0.1)',
            color: isActive ? '#000' : '#fff',
            transition: 'all 0.2s ease'
        }) as React.CSSProperties,
        card: {
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '16px',
            marginBottom: '16px'
        } as React.CSSProperties,
        cardTitle: {
            fontSize: '16px',
            fontWeight: 600,
            marginBottom: '16px',
            color: '#fff'
        } as React.CSSProperties,
        listItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            gap: '12px'
        } as React.CSSProperties,
        thumbnail: {
            width: '48px',
            height: '48px',
            borderRadius: '8px',
            objectFit: 'cover' as const,
            backgroundColor: 'rgba(255,255,255,0.1)',
            flexShrink: 0
        } as React.CSSProperties,
        itemInfo: {
            flex: 1,
            minWidth: 0,
            overflow: 'hidden'
        } as React.CSSProperties,
        itemName: {
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        } as React.CSSProperties,
        itemType: {
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase' as const
        } as React.CSSProperties,
        itemActions: {
            display: 'flex',
            gap: '4px',
            flexShrink: 0
        } as React.CSSProperties,
        actionButton: {
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)'
        } as React.CSSProperties,
        deleteButton: {
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: '#ff4757'
        } as React.CSSProperties,
        fab: {
            position: 'fixed' as const,
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#00ff9d',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,255,157,0.4)',
            zIndex: 100
        } as React.CSSProperties,
        formContainer: {
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '16px',
            marginBottom: '16px'
        } as React.CSSProperties,
        formHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
        } as React.CSSProperties,
        formTitle: {
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
            margin: 0
        } as React.CSSProperties,
        closeButton: {
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)'
        } as React.CSSProperties,
        input: {
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            marginBottom: '12px',
            outline: 'none'
        } as React.CSSProperties,
        label: {
            display: 'block',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '4px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px'
        } as React.CSSProperties,
        submitButton: {
            width: '100%',
            padding: '14px',
            fontSize: '14px',
            fontWeight: 600,
            backgroundColor: '#00ff9d',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            marginTop: '8px'
        } as React.CSSProperties,
        emptyState: {
            padding: '40px 20px',
            textAlign: 'center' as const,
            color: 'rgba(255,255,255,0.5)'
        } as React.CSSProperties
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.topRow}>
                    <h1 style={styles.logo}>ADMIN</h1>
                    <div style={styles.headerButtons}>
                        <button
                            style={styles.iconButton}
                            onClick={() => navigate('/scanner')}
                        >
                            <Camera size={18} color="#fff" />
                        </button>
                        <button
                            style={{ ...styles.iconButton }}
                            onClick={() => { logout(); navigate('/'); }}
                        >
                            <LogOut size={18} color="#ff4757" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabContainer}>
                    <button
                        style={styles.tab(tab === 'targets')}
                        onClick={() => setTab('targets')}
                    >
                        EXPERIÊNCIAS
                    </button>
                    <button
                        style={styles.tab(tab === 'users')}
                        onClick={() => setTab('users')}
                    >
                        Usuários
                    </button>
                </div>
            </header>

            {/* Content */}
            {tab === 'targets' ? (
                <>
                    {/* Form */}
                    {showForm && (
                        <div style={styles.formContainer}>
                            <div style={styles.formHeader}>
                                <h3 style={styles.formTitle}>
                                    {editId ? 'Editar' : 'Nova'} Experiência
                                </h3>
                                <button style={styles.closeButton} onClick={resetForm}>
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleUpload}>
                                <input
                                    type="text"
                                    placeholder="Nome da experiência"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    style={styles.input}
                                    required
                                />
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={styles.label}>Imagem Alvo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => handleFileChange(e.target.files?.[0] || null, 'target')}
                                        style={{ ...styles.input, marginBottom: 0 }}
                                    />
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <label style={styles.label}>Arquivo de Conteúdo</label>
                                    <input
                                        type="file"
                                        onChange={e => handleFileChange(e.target.files?.[0] || null, 'content')}
                                        style={{ ...styles.input, marginBottom: 0 }}
                                    />
                                </div>
                                <select
                                    value={contentType}
                                    onChange={e => setContentType(e.target.value)}
                                    style={styles.input}
                                >
                                    <option value="video">Vídeo</option>
                                    <option value="audio">Audio</option>
                                    <option value="3d">Modelo 3D</option>
                                </select>
                                <button
                                    type="submit"
                                    style={styles.submitButton}
                                    disabled={uploading}
                                >
                                    {uploading ? 'Salvando...' : 'Salvar Experiência'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Experiences List */}
                    {/* Experiences List */}
                    <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
                        <h3 style={{ 
                            fontSize: 'var(--font-size-lg)', 
                            fontWeight: 700, 
                            marginBottom: 'var(--space-md)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 'var(--space-sm)' 
                        }}>
                             Lista de Experiências <span style={{ fontSize: 'var(--font-size-sm)', opacity: 0.5, fontWeight: 400 }}>({targets.length})</span>
                        </h3>

                        {targets.length === 0 ? (
                            <div style={styles.emptyState}>
                                Nenhuma experiência ainda. Toque + para criar.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {targets.map(t => (
                                    <div key={t.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--space-md)',
                                        borderBottom: '1px solid var(--glass-border)',
                                        gap: 'var(--space-sm)'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: 1, minWidth: 0 }}>
                                            <img
                                                src={t.target_url}
                                                alt={t.name}
                                                style={{
                                                    width: '48px',
                                                    height: '48px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover',
                                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                                    flexShrink: 0
                                                }}
                                            />
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    {t.content_type?.toUpperCase()} • {t.profiles?.full_name?.split(' ')[0] || t.profiles?.email?.split('@')[0] || 'Anon'}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                                            <button
                                                style={{
                                                    background: 'rgba(255,255,255,0.05)',
                                                    border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    color: '#4ade80',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                onClick={() => startEdit(t)}
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                style={{
                                                    background: 'rgba(255, 50, 50, 0.1)',
                                                    border: '1px solid rgba(255, 50, 50, 0.2)',
                                                    borderRadius: '8px',
                                                    padding: '8px',
                                                    cursor: 'pointer',
                                                    color: '#f87171',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                                onClick={() => handleDelete(t.id)}
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                </>
            ) : (
                <ManageUsers />
            )}
        </div>
    );
}
