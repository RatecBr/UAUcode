import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

import { supabase } from '../supabaseClient';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (data.user) {
                // Determine redirect based on logic (or just go to Admin for now since roles need DB config)
                // For now, everyone goes to Scanner, Admin link is there
                navigate('/admin');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 100%)'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '40px', width: '100%', maxWidth: '400px' }}
            >
                <h1 style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--primary)' }}>IMAGYNE</h1>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={20} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                        <input
                            className="glass-input"
                            style={{ paddingLeft: '45px' }}
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Lock size={20} style={{ position: 'absolute', top: '14px', left: '12px', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            className="glass-input"
                            style={{ paddingLeft: '45px' }}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>

                    {error && <div style={{ color: '#ff4444', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                    <button type="submit" className="btn-primary">
                        ACCESS SYSTEM
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
                        Default: admin/admin123 or user/user123
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
