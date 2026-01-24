import { useEffect, useState } from 'react';
import { supabase } from '../AuthContext';
import { UserPlus, Shield, User } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    role: 'admin' | 'user';
}

export default function ManageUsers() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPass, setNewUserPass] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) console.error("Error fetching profiles:", error);
        else setUsers(data as any[] || []);
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
                                flex: 1
                            }}>
                                <span style={{
                                    fontWeight: 600,
                                    fontSize: 'var(--font-size-base)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {u.email}
                                </span>
                                <span style={{
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--text-muted)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {u.id}
                                </span>
                            </div>

                            <button
                                onClick={() => toggleRole(u)}
                                className="glass-card"
                                style={{
                                    padding: 'var(--space-xs) var(--space-sm)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-xs)',
                                    background: u.role === 'admin' ? 'rgba(0, 255, 157, 0.15)' : 'transparent',
                                    color: u.role === 'admin' ? 'var(--primary)' : 'var(--text)',
                                    fontSize: 'var(--font-size-xs)',
                                    fontWeight: 600,
                                    flexShrink: 0
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
