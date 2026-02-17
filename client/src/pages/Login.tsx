import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, useAuth } from '../AuthContext';
import { Mail, Lock, ArrowRight, UserPlus, ArrowLeft } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [status, setStatus] = useState('');
    const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const doLogin = async () => {
        if (isLoading || !email || !password) return;
        setIsLoading(true);
        setStatus('Entrando...');
        setStatusType('info');

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setStatus(traduzirErro(error.message));
                setStatusType('error');
                setIsLoading(false);
                return;
            }
            setStatus('Bem-vindo de volta!');
            setStatusType('success');
            setTimeout(() => navigate('/dashboard'), 500);
        } catch (e: any) {
            setStatus(e.message);
            setStatusType('error');
            setIsLoading(false);
        }
    };

    const doSignUp = async () => {
        if (isLoading || !email || !password) return;
        if (password.length < 6) {
            setStatus('A senha deve ter pelo menos 6 caracteres');
            setStatusType('error');
            return;
        }

        setIsLoading(true);
        setStatus('Criando sua conta...');
        setStatusType('info');

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: window.location.origin
                }
            });

            console.log('SignUp Response:', { data, error });

            if (error) {
                setStatus(traduzirErro(error.message));
                setStatusType('error');
                setIsLoading(false);
                return;
            }

            // Verificar se precisa confirmar email
            if (data?.user?.identities?.length === 0) {
                setStatus('Este email já está cadastrado. Faça login.');
                setStatusType('error');
                setMode('login');
            } else if (data?.user?.email_confirmed_at) {
                // Email já confirmado (auto-confirm habilitado)
                setStatus('Conta criada! Você já pode entrar.');
                setStatusType('success');
                setMode('login');
            } else {
                // Precisa confirmar email
                setStatus('Conta criada! Verifique seu email para confirmar.');
                setStatusType('success');
                setMode('login');
            }

            setIsLoading(false);
        } catch (e: any) {
            console.error('SignUp Exception:', e);
            setStatus(e.message);
            setStatusType('error');
            setIsLoading(false);
        }
    };

    const traduzirErro = (msg: string): string => {
        const traducoes: Record<string, string> = {
            'Invalid login credentials': 'Email ou senha incorretos',
            'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
            'User already registered': 'Este email já está cadastrado',
            'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres',
            'Unable to validate email address: invalid format': 'Formato de email inválido',
            'Signup requires a valid password': 'É necessário informar uma senha válida',
            'Email rate limit exceeded': 'Muitas tentativas. Aguarde alguns minutos.',
        };
        return traducoes[msg] || msg;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'login') {
            doLogin();
        } else {
            doSignUp();
        }
    };

    const styles = {
        container: {
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)',
            padding: '24px',
            position: 'relative' as const,
            overflow: 'hidden'
        },
        bgGlow: {
            position: 'absolute' as const,
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(188, 54, 194, 0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none' as const
        },
        backHome: {
            position: 'absolute' as const,
            top: '24px',
            left: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '50px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--neon-purple)',
            fontSize: '14px',
            fontWeight: 700,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            zIndex: 10,
            textDecoration: 'none'
        },
        logoContainer: {
            marginBottom: '32px',
            textAlign: 'center' as const,
            position: 'relative' as const,
            zIndex: 1
        },
        logoIcon: {
            marginBottom: '16px'
        },
        logo: {
            fontSize: '32px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 50%, var(--neon-red) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(188, 54, 194, 0.5))',
            backgroundClip: 'text',
            letterSpacing: '0.15em',
            margin: 0
        },
        tagline: {
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px',
            marginTop: '8px'
        },
        card: {
            width: '100%',
            maxWidth: '380px',
            backgroundColor: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '32px 24px',
            boxShadow: '0 0 40px rgba(0,0,0,0.5), 0 0 20px rgba(188, 54, 194, 0.1)',
            position: 'relative' as const,
            zIndex: 1
        },
        modeToggle: {
            display: 'flex',
            gap: '4px',
            padding: '4px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            marginBottom: '24px'
        },
        modeButton: (isActive: boolean) => ({
            flex: 1,
            padding: '10px 16px',
            fontSize: '13px',
            fontWeight: 600,
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            backgroundColor: isActive ? 'var(--neon-purple)' : 'transparent',
            color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
            boxShadow: isActive ? 'var(--neon-purple-glow)' : 'none'
        }),
        inputGroup: {
            marginBottom: '16px',
            position: 'relative' as const
        },
        inputIcon: {
            position: 'absolute' as const,
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(255,255,255,0.3)',
            pointerEvents: 'none' as const
        },
        input: {
            width: '100%',
            padding: '16px 16px 16px 48px',
            fontSize: '15px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            color: '#fff',
            outline: 'none',
            transition: 'all 0.2s ease',
            boxSizing: 'border-box' as const
        },
        submitButton: {
            width: '100%',
            padding: '16px',
            fontSize: '15px',
            fontWeight: 700,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '8px',
            transition: 'all 0.2s ease'
        },
        submitButtonDisabled: {
            opacity: 0.5,
            cursor: 'not-allowed'
        },
        statusBox: (type: 'info' | 'success' | 'error') => ({
            marginTop: '16px',
            padding: '14px',
            borderRadius: '12px',
            fontSize: '13px',
            textAlign: 'center' as const,
            backgroundColor: type === 'error'
                ? 'rgba(255, 71, 87, 0.1)'
                : type === 'success'
                    ? 'rgba(0, 255, 157, 0.1)'
                    : 'rgba(255,255,255,0.05)',
            color: type === 'error'
                ? '#ff6b7a'
                : type === 'success'
                    ? '#BC36C2'
                    : 'rgba(255,255,255,0.7)',
            border: `1px solid ${type === 'error'
                ? 'rgba(255, 71, 87, 0.2)'
                : type === 'success'
                    ? 'rgba(188, 54, 194, 0.2)'
                    : 'rgba(255,255,255,0.1)'}`
        }),
        footer: {
            marginTop: '32px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.3)',
            textAlign: 'center' as const,
            position: 'relative' as const,
            zIndex: 1
        },
        hint: {
            marginTop: '20px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center' as const
        }
    };

    const isFormValid = email.length > 0 && password.length > 0;

    return (
        <div style={styles.container}>
            {/* Background glow effect */}
            <div style={styles.bgGlow} />

            {/* Back Home Button */}
            <button
                onClick={() => navigate('/')}
                style={styles.backHome}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(188, 54, 194, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            >
                <ArrowLeft size={18} />
                Início
            </button>

            {/* Logo */}
            <div style={styles.logoContainer}>
                <img src="/logo.png" alt="UAU Code Logo" style={{ width: '280px', height: 'auto', objectFit: 'contain' }} />
                <p style={styles.tagline}>O sucessor do QR Code</p>
            </div>

            {/* Login Card */}
            <div style={styles.card}>
                {/* Mode Toggle */}
                <div style={styles.modeToggle}>
                    <button
                        type="button"
                        style={styles.modeButton(mode === 'login')}
                        onClick={() => { setMode('login'); setStatus(''); }}
                    >
                        Entrar
                    </button>
                    <button
                        type="button"
                        style={styles.modeButton(mode === 'signup')}
                        onClick={() => { setMode('signup'); setStatus(''); }}
                    >
                        Criar Conta
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div style={styles.inputGroup}>
                        <div style={styles.inputIcon}>
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            placeholder="Seu email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={styles.input}
                            autoComplete="email"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* Password Input */}
                    <div style={styles.inputGroup}>
                        <div style={styles.inputIcon}>
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            placeholder={mode === 'signup' ? 'Senha (mín. 6 caracteres)' : 'Sua senha'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={styles.input}
                            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                            disabled={isLoading}
                            required
                            minLength={6}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            ...styles.submitButton,
                            backgroundColor: 'unset',
                            boxShadow: 'unset',
                            ...((!isFormValid || isLoading) ? styles.submitButtonDisabled : {})
                        }}
                        disabled={!isFormValid || isLoading}
                    >
                        {isLoading ? (
                            'Aguarde...'
                        ) : mode === 'login' ? (
                            <>
                                Entrar
                                <ArrowRight size={18} />
                            </>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Criar Conta
                            </>
                        )}
                    </button>
                </form>

                {/* Status Message */}
                {status && (
                    <div style={styles.statusBox(statusType)}>
                        {status}
                    </div>
                )}

                {/* Hint */}
                {mode === 'signup' && (
                    <p style={styles.hint}>
                        Após criar a conta, você poderá entrar imediatamente.
                    </p>
                )}
            </div>

            {/* Footer */}
            <p style={styles.footer}>
                © 2026 UAU Code. Todos os direitos reservados.
            </p>
        </div>
    );
}
