import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
    // const [username, setUsername] = useState('');
    // const [password, setPassword] = useState('');
    // const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleMockLogin = (role: 'admin' | 'user') => {
        // MOCK LOGIN for Serverless/Vercel Demo
        const mockToken = "mock_token_" + Date.now();
        const mockUser = { username: role, role: role };
        login(mockToken, mockUser);
        navigate(role === 'admin' ? '/admin' : '/scanner');
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
                <h1 style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--primary)' }}>IMAGYNE</h1>
                <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-muted)' }}>Augmented Reality Platform</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button
                        onClick={() => handleMockLogin('admin')}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <Lock size={18} /> ADMIN ACCESS
                    </button>

                    <button
                        onClick={() => handleMockLogin('user')}
                        className="btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                    >
                        <User size={18} /> OPEN SCANNER
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '11px', color: '#666', marginTop: '20px' }}>
                        * Demo Mode: Authentication bypassed for preview
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
