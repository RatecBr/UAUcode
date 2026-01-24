import React, { useEffect, useState } from 'react';
import { supabase } from '../AuthContext';
import { Trash2, UserPlus, Shield, User } from 'lucide-react';

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

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        // Fetch from 'profiles' table which mirrors auth.users via trigger
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) console.error("Error fetching profiles:", error);
        else setUsers(data as any[] || []);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Note: Creating a user while logged in as another user usually requires
            // Supabase Admin API (Backend) OR 'supabase.auth.signUp' which logs the current user out by default unless configured.
            // Using a simple invite work-around or secondary instance for client-side creation isn't standard securely.
            // But we will try standard signUp. BEWARE: This might change local session.

            const { data, error } = await supabase.auth.signUp({
                email: newUserEmail,
                password: newUserPass
            });

            if (error) throw error;

            alert(`User created! ID: ${data.user?.id}`);

            // Wait for trigger to populate profile
            setTimeout(() => {
                fetchUsers();
                setNewUserEmail('');
                setNewUserPass('');
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
        <div className="glass-card" style={{ padding: '30px' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus size={20} color="var(--primary)" /> User Management
            </h3>

            {/* Create User Form */}
            <form onSubmit={handleCreateUser} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                <input
                    className="glass-input"
                    placeholder="New User Email"
                    value={newUserEmail}
                    onChange={e => setNewUserEmail(e.target.value)}
                    required
                />
                <input
                    className="glass-input"
                    placeholder="Password"
                    type="password"
                    value={newUserPass}
                    onChange={e => setNewUserPass(e.target.value)}
                    required
                />
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Add User'}
                </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.map(u => (
                    <div key={u.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '15px', borderBottom: '1px solid var(--glass-border)'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 'bold' }}>{u.email}</span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {u.id}</span>
                        </div>

                        <button
                            onClick={() => toggleRole(u)}
                            className="glass-card"
                            style={{
                                padding: '5px 10px',
                                display: 'flex', alignItems: 'center', gap: '5px',
                                background: u.role === 'admin' ? 'rgba(0,255,157,0.1)' : 'transparent',
                                color: u.role === 'admin' ? '#00ff9d' : 'white',
                                cursor: 'pointer'
                            }}
                        >
                            {u.role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                            {u.role.toUpperCase()}
                        </button>
                    </div>
                ))}
                {users.length === 0 && <div style={{ padding: '20px', textAlign: 'center' }}>No users found (Check 'profiles' table trigger).</div>}
            </div>
        </div>
    );
}
