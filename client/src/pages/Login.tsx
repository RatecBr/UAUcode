import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, useAuth } from '../AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/admin');
        }
    }, [user, navigate]);

    const doLogin = async () => {
        setStatus('Logging in...');
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setStatus('ERROR: ' + error.message);
                return;
            }
            setStatus('SUCCESS! Redirecting...');
            navigate('/admin');
        } catch (e: any) {
            setStatus('EXCEPTION: ' + e.message);
        }
    };

    const doSignUp = async () => {
        setStatus('Creating account...');
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setStatus('ERROR: ' + error.message);
                return;
            }
            setStatus('Account created! Now login.');
        } catch (e: any) {
            setStatus('EXCEPTION: ' + e.message);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000',
            color: 'white',
            fontFamily: 'sans-serif'
        }}>
            <h1 style={{ color: '#00ff9d', marginBottom: 30 }}>IMAGYNE LOGIN</h1>

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ padding: 15, marginBottom: 15, width: 300, borderRadius: 8, border: 'none', fontSize: 16 }}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding: 15, marginBottom: 15, width: 300, borderRadius: 8, border: 'none', fontSize: 16 }}
            />

            <button
                onClick={doLogin}
                style={{
                    padding: '15px 40px',
                    background: '#00ff9d',
                    color: '#000',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 16,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginBottom: 10
                }}
            >
                LOGIN
            </button>

            <button
                onClick={doSignUp}
                style={{
                    padding: '10px 30px',
                    background: 'transparent',
                    color: '#00ff9d',
                    border: '1px solid #00ff9d',
                    borderRadius: 8,
                    fontSize: 14,
                    cursor: 'pointer'
                }}
            >
                Create Account
            </button>

            {status && (
                <div style={{
                    marginTop: 20,
                    padding: 15,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    maxWidth: 300,
                    textAlign: 'center'
                }}>
                    {status}
                </div>
            )}
        </div>
    );
}
