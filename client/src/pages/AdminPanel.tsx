import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Users, Layers, BarChart3, Edit2, Trash2,
    Crown, UserCheck, UserX, Globe
} from 'lucide-react';
import { supabase, useAuth, getPlanName } from '../AuthContext';

interface User {
    id: string;
    email: string;
    full_name?: string;
    role: string;
    plan: string;
    slug: string;
    is_active: boolean;
    created_at: string;
    target_count?: number;
}

interface Target {
    id: number;
    name: string;
    target_url: string;
    content_type: string;
    scan_count: number;
    is_global: boolean;
    user_id: string;
    user_email?: string;
}

export default function AdminPanel() {
    useAuth(); // For auth context
    const navigate = useNavigate();

    const [tab, setTab] = useState<'users' | 'targets' | 'global'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [targets, setTargets] = useState<Target[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [stats, setStats] = useState({ users: 0, targets: 0, scans: 0 });

    const fetchData = useCallback(async () => {
        setLoading(true);

        if (tab === 'users') {
            const { data: usersData } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            // Get target counts for each user
            if (usersData) {
                const usersWithCounts = await Promise.all(
                    usersData.map(async (user) => {
                        const { count } = await supabase
                            .from('targets')
                            .select('*', { count: 'exact', head: true })
                            .eq('user_id', user.id);
                        return { ...user, target_count: count || 0 };
                    })
                );
                setUsers(usersWithCounts);
            }
        } else {
            const isGlobal = tab === 'global';
            const query = supabase
                .from('targets')
                .select('*')
                .order('id', { ascending: false });

            if (isGlobal) {
                query.eq('is_global', true);
            }

            const { data: targetsData } = await query;

            // Add user emails
            if (targetsData) {
                const targetsWithUsers = await Promise.all(
                    targetsData.map(async (target) => {
                        const { data: userData } = await supabase
                            .from('profiles')
                            .select('email')
                            .eq('id', target.user_id)
                            .single();
                        return { ...target, user_email: userData?.email || 'N/A' };
                    })
                );
                setTargets(targetsWithUsers);
            }
        }

        // Fetch stats
        const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: targetsCount } = await supabase.from('targets').select('*', { count: 'exact', head: true });
        const { data: scanData } = await supabase.from('targets').select('scan_count');
        const totalScans = scanData?.reduce((sum, t) => sum + (t.scan_count || 0), 0) || 0;

        setStats({ users: usersCount || 0, targets: targetsCount || 0, scans: totalScans });
        setLoading(false);
    }, [tab]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateUser = async (userId: string, updates: Partial<User>) => {
        await supabase.from('profiles').update(updates).eq('id', userId);
        fetchData();
        setEditingUser(null);
    };

    const toggleUserActive = async (user: User) => {
        await updateUser(user.id, { is_active: !user.is_active });
    };

    const deleteTarget = async (id: number) => {
        if (!confirm('Excluir esta experiência?')) return;
        await supabase.from('targets').delete().eq('id', id);
        fetchData();
    };

    const toggleGlobal = async (target: Target) => {
        await supabase.from('targets').update({ is_global: !target.is_global }).eq('id', target.id);
        fetchData();
    };

    const styles = {
        container: {
            minHeight: '100dvh',
            backgroundColor: '#0a0a0f',
            color: '#fff',
            padding: '16px'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px'
        },
        backBtn: {
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            cursor: 'pointer'
        },
        title: {
            fontSize: '20px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '24px'
        },
        statCard: {
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center' as const
        },
        statValue: {
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--neon-purple)',
            textShadow: 'var(--neon-purple-glow)'
        },
        statLabel: {
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '4px'
        },
        tabs: {
            display: 'flex',
            gap: '4px',
            padding: '4px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            marginBottom: '20px'
        },
        tab: (active: boolean) => ({
            flex: 1,
            padding: '10px',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            background: active ? 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))' : 'transparent',
            color: active ? '#fff' : 'rgba(255,255,255,0.6)',
            boxShadow: active ? 'var(--neon-purple-glow)' : 'none',
            transition: 'all 0.3s ease'
        }),
        card: {
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden'
        },
        listItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        },
        avatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 600,
            flexShrink: 0
        },
        itemInfo: {
            flex: 1,
            overflow: 'hidden'
        },
        itemTitle: {
            fontWeight: 600,
            fontSize: '14px',
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        itemMeta: {
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            display: 'flex',
            gap: '8px',
            marginTop: '2px'
        },
        badge: (type: string) => ({
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 600,
            backgroundColor: type === 'admin' ? 'rgba(255,215,0,0.2)' :
                type === 'enterprise' ? 'rgba(255,215,0,0.2)' :
                    type === 'pro' ? 'rgba(0,212,255,0.2)' :
                        type === 'inactive' ? 'rgba(255,71,87,0.2)' :
                            'rgba(255,255,255,0.1)',
            color: type === 'admin' ? '#ffd700' :
                type === 'enterprise' ? '#ffd700' :
                    type === 'pro' ? '#00d4ff' :
                        type === 'inactive' ? '#ff4757' :
                            'rgba(255,255,255,0.6)'
        }),
        actions: {
            display: 'flex',
            gap: '4px',
            flexShrink: 0
        },
        actionBtn: {
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)'
        },
        modal: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modalContent: {
            backgroundColor: '#1a1a24',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '360px',
            width: '100%'
        },
        select: {
            width: '100%',
            padding: '12px',
            fontSize: '14px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            marginBottom: '12px'
        },
        btn: {
            width: '100%',
            padding: '14px',
            fontSize: '14px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginTop: '8px',
            boxShadow: 'var(--neon-purple-glow)'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={18} color="#fff" />
                </button>
                <h1 style={styles.title}>Painel Administrativo</h1>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.users}</div>
                    <div style={styles.statLabel}>Usuários</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.targets}</div>
                    <div style={styles.statLabel}>Experiências</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statValue}>{stats.scans}</div>
                    <div style={styles.statLabel}>Scans Total</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabs}>
                <button style={styles.tab(tab === 'users')} onClick={() => setTab('users')}>
                    <Users size={14} style={{ marginRight: '4px' }} />
                    Usuários
                </button>
                <button style={styles.tab(tab === 'targets')} onClick={() => setTab('targets')}>
                    <Layers size={14} style={{ marginRight: '4px' }} />
                    Experiências
                </button>
                <button style={styles.tab(tab === 'global')} onClick={() => setTab('global')}>
                    <Globe size={14} style={{ marginRight: '4px' }} />
                    Globais
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
                    Carregando...
                </div>
            ) : tab === 'users' ? (
                <div style={styles.card}>
                    {users.map((user, i) => (
                        <div key={user.id} style={{ ...styles.listItem, borderBottom: i === users.length - 1 ? 'none' : undefined }}>
                            <div style={{ ...styles.avatar, backgroundColor: user.role === 'admin' ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)' }}>
                                {user.role === 'admin' ? <Crown size={18} color="#ffd700" /> : user.email[0].toUpperCase()}
                            </div>
                            <div style={styles.itemInfo}>
                                <div style={{ fontWeight: 700, fontSize: '15px', color: '#fff' }}>
                                    {user.full_name || 'Sem nome'}
                                </div>
                                <div style={styles.itemTitle} title={user.email}>{user.email}</div>
                                <div style={styles.itemMeta}>
                                    <span style={styles.badge(user.plan)}>{getPlanName(user.plan)}</span>
                                    {user.role === 'admin' && <span style={styles.badge('admin')}>Admin</span>}
                                    {!user.is_active && <span style={styles.badge('inactive')}>Inativo</span>}
                                    <span>{user.target_count} exp.</span>
                                </div>
                            </div>
                            <div style={styles.actions}>
                                <button
                                    style={styles.actionBtn}
                                    onClick={() => setEditingUser(user)}
                                    title="Editar"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    style={{ ...styles.actionBtn, color: user.is_active ? '#ff4757' : 'var(--neon-blue)' }}
                                    onClick={() => toggleUserActive(user)}
                                    title={user.is_active ? 'Desativar' : 'Ativar'}
                                >
                                    {user.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={styles.card}>
                    {targets.length === 0 ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                            {tab === 'global' ? 'Nenhuma experiência global ainda.' : 'Nenhuma experiência encontrada.'}
                        </div>
                    ) : (
                        targets.map((target, i) => (
                            <div key={target.id} style={{ ...styles.listItem, borderBottom: i === targets.length - 1 ? 'none' : undefined }}>
                                <img
                                    src={target.target_url}
                                    alt={target.name}
                                    style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                                />
                                <div style={styles.itemInfo}>
                                    <div style={styles.itemTitle}>{target.name}</div>
                                    <div style={styles.itemMeta}>
                                        <span>{target.content_type}</span>
                                        <span><BarChart3 size={10} /> {target.scan_count}</span>
                                        <span>{target.user_email}</span>
                                        {target.is_global && <span style={styles.badge('admin')}>Global</span>}
                                    </div>
                                </div>
                                <div style={styles.actions}>
                                    <button
                                        style={{ ...styles.actionBtn, color: target.is_global ? '#ffd700' : undefined }}
                                        onClick={() => toggleGlobal(target)}
                                        title={target.is_global ? 'Remover do global' : 'Tornar global'}
                                    >
                                        <Globe size={16} />
                                    </button>
                                    <button
                                        style={{ ...styles.actionBtn, color: '#ff4757' }}
                                        onClick={() => deleteTarget(target.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div style={styles.modal} onClick={() => setEditingUser(null)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 style={{ margin: '0 0 16px' }}>Editar Usuário</h3>
                        <div style={{ fontSize: '14px', marginBottom: '16px', color: 'rgba(255,255,255,0.7)' }}>
                            {editingUser.email}
                        </div>

                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Nome</label>
                        <input
                            type="text"
                            value={editingUser.full_name || ''}
                            onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                            style={{
                                ...styles.select,
                                marginBottom: '16px'
                            }}
                            placeholder="Nome do usuário"
                        />

                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Plano</label>
                        <select
                            style={styles.select}
                            value={editingUser.plan}
                            onChange={e => setEditingUser({ ...editingUser, plan: e.target.value })}
                        >
                            <option value="free" style={{ backgroundColor: '#1a1a24' }}>Gratuito (1 exp.)</option>
                            <option value="pro" style={{ backgroundColor: '#1a1a24' }}>Profissional (20 exp.)</option>
                            <option value="enterprise" style={{ backgroundColor: '#1a1a24' }}>Empresarial (ilimitado)</option>
                        </select>

                        <label style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '4px' }}>Função</label>
                        <select
                            style={styles.select}
                            value={editingUser.role}
                            onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                        >
                            <option value="user" style={{ backgroundColor: '#1a1a24' }}>Usuário</option>
                            <option value="admin" style={{ backgroundColor: '#1a1a24' }}>Administrador</option>
                        </select>

                        <button
                            style={styles.btn}
                            onClick={() => updateUser(editingUser.id, { 
                                plan: editingUser.plan, 
                                role: editingUser.role,
                                full_name: editingUser.full_name
                            })}
                        >
                            Salvar Alterações
                        </button>
                        <button
                            style={{ ...styles.btn, backgroundColor: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
                            onClick={() => setEditingUser(null)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
