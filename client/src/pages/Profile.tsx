import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Save, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth, supabase, getPlanName, getPlanLimit } from '../AuthContext';

export default function Profile() {
    const navigate = useNavigate();
    const { user, profile, isAdmin, refreshProfile, logout } = useAuth();
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ used: 0, total: 0 });

    const fetchStats = useCallback(async () => {
        if (!user?.id) return;
        const { count } = await supabase
            .from('targets')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
        
        setStats({
            used: count || 0,
            total: getPlanLimit(profile)
        });
    }, [user?.id, profile]);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            fetchStats();
        }
    }, [profile, fetchStats]);

    const handleSave = async () => {
        if (!user?.id) return;
        
        if (newPassword && newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        setSaving(true);
        try {
            // 1. Atualizar Nome
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);
            
            if (updateError) throw updateError;

            // 2. Atualizar Senha se preenchida
            if (newPassword) {
                const { error: passError } = await supabase.auth.updateUser({
                    password: newPassword
                });
                if (passError) throw passError;
                setNewPassword('');
                setConfirmPassword('');
            }

            await refreshProfile();
            alert('Perfil atualizado com sucesso!');
        } catch (e: unknown) {
            const error = e as Error;
            alert('Erro ao atualizar: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const styles = {
        container: {
            minHeight: '100dvh',
            background: 'var(--background)',
            color: 'var(--text)',
            padding: '24px',
            paddingBottom: '100px'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
        },
        backBtn: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)',
            padding: '10px',
            borderRadius: '12px',
            color: 'var(--text)',
            cursor: 'pointer'
        },
        card: {
            background: 'var(--surface)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        },
        inputGroup: {
            marginBottom: '20px'
        },
        label: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            marginBottom: '8px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.05em'
        },
        input: {
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: 'var(--text)',
            fontSize: '16px',
            transition: 'all 0.2s',
            outline: 'none'
        },
        planBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '100px',
            background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px',
            boxShadow: 'var(--neon-purple-glow)'
        },
        saveBtn: {
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
            color: '#white',
            border: 'none',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: 'var(--neon-purple-glow)',
            marginTop: '12px'
        },
        logoutBtn: {
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            background: 'rgba(255, 100, 100, 0.1)',
            color: '#ff6666',
            border: '1px solid rgba(255, 100, 100, 0.2)',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '24px'
        },
        progressContainer: {
            marginTop: '12px',
            background: 'rgba(255,255,255,0.05)',
            height: '8px',
            borderRadius: '4px',
            overflow: 'hidden'
        },
        progressBar: (percent: number) => ({
            width: `${Math.min(percent, 100)}%`,
            height: '100%',
            background: 'var(--neon-purple)',
            boxShadow: '0 0 10px var(--neon-purple)'
        })
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate(isAdmin ? '/admin' : '/library')}>
                    <ArrowLeft size={20} />
                </button>
                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>Meu Painel</h1>
            </div>

            <div style={styles.card}>
                <div style={styles.planBadge}>
                    <Shield size={14} /> Plano {getPlanName(profile?.plan || 'free')}
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}><User size={14} /> Nome Completo</label>
                    <input 
                        style={styles.input}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Seu nome"
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}><Mail size={14} /> E-mail</label>
                    <input 
                        style={{ ...styles.input, opacity: 0.5, cursor: 'not-allowed' }}
                        value={user?.email || ''}
                        disabled
                    />
                </div>

                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '32px 0 24px' }} />
                <h3 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-muted)' }}>SEGURANÇA</h3>

                <div style={styles.inputGroup}>
                    <label style={styles.label}><Shield size={14} /> Nova Senha</label>
                    <input 
                        style={styles.input}
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Deixe em branco para manter"
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}><Shield size={14} /> Confirmar Nova Senha</label>
                    <input 
                        style={styles.input}
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                    />
                </div>

                <div style={{ marginTop: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                        <span>Uso de Experiências</span>
                        <span style={{ fontWeight: 700 }}>{stats.used} / {stats.total >= 999999 ? '∞' : stats.total}</span>
                    </div>
                    <div style={styles.progressContainer}>
                        <div style={styles.progressBar((stats.used / stats.total) * 100)} />
                    </div>
                </div>

                <button 
                    style={{ ...styles.saveBtn, opacity: saving ? 0.7 : 1 }}
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={20} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>

            <button style={styles.logoutBtn} onClick={() => logout()}>
                <LogOut size={20} /> Sair da Conta
            </button>
        </div>
    );
}
