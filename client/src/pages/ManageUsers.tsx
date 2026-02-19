import { useEffect, useState } from 'react';
import { supabase } from '../AuthContext';
import { Edit2, Check, X, UserPlus, Shield, User } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    full_name?: string;
    role: 'admin' | 'user';
}

export default function ManageUsers() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPass, setNewUserPass] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    
    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('profiles').select('*, full_name').order('created_at', { ascending: false });
        if (error) console.error("Error fetching profiles:", error);
        else setUsers(data as any[] || []);
    };

    const startEditing = (user: Profile) => {
        setEditingId(user.id);
        setEditName(user.full_name || user.email.split('@')[0]);
    };

    const saveName = async () => {
        if (!editingId) return;
        
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: editName })
            .eq('id', editingId);

        if (error) {
            alert('Erro ao atualizar nome');
        } else {
            setUsers(users.map(u => u.id === editingId ? { ...u, full_name: editName } : u));
            setEditingId(null);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: newUserEmail,
                password: newUserPass
            });

            if (error) throw error;

            alert(`User created! ID: ${data.user?.id}`);

            setTimeout(() => {
                fetchUsers();
                setNewUserEmail('');
                setNewUserPass('');
                setShowCreateForm(false);
            }, 2000);

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleRole = async (user: Profile) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
        if (error) alert("Failed to update role. (Are you admin?)");
        else fetchUsers();
    };

    return (
        <div className="glass-card" style={{ padding: 'var(--space-lg)' }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-lg)',
                flexWrap: 'wrap',
                gap: 'var(--space-sm)'
            }}>
                <h3 style={{
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-sm)',
                    fontSize: 'var(--font-size-lg)'
                }}>
                    <UserPlus size={20} color="var(--primary)" />
                    Gerenciar Usuários
                </h3>

                {!showCreateForm && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="btn-primary"
                        style={{ fontSize: 'var(--font-size-sm)' }}
                    >
                        + Novo Usuário
                    </button>
                )}
            </div>

            {/* Create User Form - Collapsible */}
            {showCreateForm && (
                <form
                    onSubmit={handleCreateUser}
                    className="animate-enter"
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-md)',
                        marginBottom: 'var(--space-xl)',
                        padding: 'var(--space-md)',
                        background: 'var(--glass-bg)',
                        borderRadius: 'var(--radius-md)'
                    }}
                >
                    <input
                        className="glass-input"
                        placeholder="Email do novo usuário"
                        type="email"
                        value={newUserEmail}
                        onChange={e => setNewUserEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                    <input
                        className="glass-input"
                        placeholder="Senha"
                        type="password"
                        value={newUserPass}
                        onChange={e => setNewUserPass(e.target.value)}
                        required
                        disabled={loading}
                        minLength={6}
                    />
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-sm)',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                            style={{ flex: 1, minWidth: '120px' }}
                        >
                            {loading ? 'Criando...' : 'Criar Usuário'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowCreateForm(false);
                                setNewUserEmail('');
                                setNewUserPass('');
                            }}
                            className="btn-ghost"
                            style={{ padding: 'var(--space-sm) var(--space-md)' }}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Users List */}
            <div style={{
                display: 'flex',
                flexDirection: 'column'
            }}>
                {users.length === 0 ? (
                    <div style={{
                        padding: 'var(--space-xl)',
                        textAlign: 'center',
                        color: 'var(--text-muted)'
                    }}>
                        Nenhum usuário encontrado (Verifique o trigger da tabela 'profiles').
                    </div>
                ) : (
                    users.map(u => (
                        <div
                            key={u.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 'var(--space-md)',
                                borderBottom: '1px solid var(--glass-border)',
                                gap: 'var(--space-sm)',
                                flexWrap: 'wrap'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                minWidth: 0,
                                flex: 1,
                                marginRight: '16px'
                            }}>
                                {editingId === u.id ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input 
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            style={{
                                                background: 'rgba(255,255,255,0.1)',
                                                border: '1px solid rgba(255,255,255,0.2)',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                color: '#fff',
                                                fontSize: 'var(--font-size-base)',
                                                width: '100%',
                                                maxWidth: '200px'
                                            }}
                                            autoFocus
                                        />
                                        <button onClick={saveName} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4ade80' }}>
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            fontWeight: 700,
                                            fontSize: 'var(--font-size-base)',
                                            color: '#fff'
                                        }}>
                                            {u.full_name || 'Sem nome'}
                                        </span>
                                        <button 
                                            onClick={() => startEditing(u)}
                                            style={{ 
                                                background: 'none', 
                                                border: 'none', 
                                                cursor: 'pointer', 
                                                color: 'var(--neon-green)', 
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                borderRadius: '4px'
                                            }}
                                            title="Editar nome"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                    </div>
                                )}
                                
                                <span style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-muted)',
                                    marginTop: '2px'
                                }}>
                                    {u.email}
                                </span>
                            </div>

                            <button
                                onClick={() => toggleRole(u)}
                                className="glass-card"
                                style={{
                                    padding: '8px 12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: u.role === 'admin' ? 'rgba(0, 255, 157, 0.15)' : 'transparent',
                                    color: u.role === 'admin' ? 'var(--primary)' : 'var(--text)',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    flexShrink: 0,
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                {u.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                                {u.role.toUpperCase()}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
