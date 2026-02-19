import { useState } from 'react';
import { supabase } from '../../AuthContext';
import { X, Mail, Loader2, ArrowRight, Lock, UserPlus } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');

  if (!isOpen) return null;

  const traduzirErro = (msg: string): string => {
    const traducoes: Record<string, string> = {
      "Invalid login credentials": "Email ou senha incorretos",
      "Email not confirmed": "Email não confirmado. Verifique sua caixa de entrada.",
      "User already registered": "Este email já está cadastrado",
      "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres",
      "Unable to validate email address: invalid format": "Formato de email inválido",
      "Signup requires a valid password": "É necessário informar uma senha válida",
      "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",
    };
    return traducoes[msg] || msg;
  };

  const doLogin = async () => {
    if (loading || !email || !password) return;
    setLoading(true);
    setStatus("Entrando...");
    setStatusType("info");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setStatus(traduzirErro(error.message));
        setStatusType("error");
        setLoading(false);
        return;
      }
      setStatus("Bem-vindo de volta!");
      setStatusType("success");
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 500);
    } catch (e: any) {
      setStatus(e.message);
      setStatusType("error");
      setLoading(false);
    }
  };

  const doSignUp = async () => {
    if (loading || !email || !password) return;
    if (password.length < 6) {
      setStatus("A senha deve ter pelo menos 6 caracteres");
      setStatusType("error");
      return;
    }

    setLoading(true);
    setStatus("Criando sua conta...");
    setStatusType("info");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setStatus(traduzirErro(error.message));
        setStatusType("error");
        setLoading(false);
        return;
      }

      if (data?.user?.identities?.length === 0) {
        setStatus("Este email já está cadastrado. Faça login.");
        setStatusType("error");
        setMode("login");
      } else if (data?.user?.email_confirmed_at) {
        setStatus("Conta criada! Entrando...");
        setStatusType("success");
        // Auto login handling if needed, or just switch mode
        setMode("login");
        doLogin(); // Try to login immediately
      } else {
        setStatus("Conta criada! Verifique seu email para confirmar.");
        setStatusType("success");
        setMode("login");
      }

      setLoading(false);
    } catch (e: any) {
      setStatus(e.message);
      setStatusType("error");
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      doLogin();
    } else {
      doSignUp();
    }
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    },
    modal: {
      background: '#0a0a0f',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '24px',
      padding: '32px',
      width: '90%',
      maxWidth: '400px',
      position: 'relative' as const,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    },
    closeBtn: {
      position: 'absolute' as const,
      top: '16px',
      right: '16px',
      background: 'transparent',
      border: 'none',
      color: 'rgba(255,255,255,0.5)',
      cursor: 'pointer',
      padding: '4px'
    },
    title: {
      fontSize: '24px',
      fontWeight: 700,
      marginBottom: '8px',
      textAlign: 'center' as const,
      color: '#fff'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '14px',
      textAlign: 'center' as const,
      marginBottom: '24px'
    },
    inputGroup: {
      marginBottom: "16px",
      position: "relative" as const,
    },
    inputIcon: {
      position: "absolute" as const,
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "rgba(255,255,255,0.3)",
      pointerEvents: "none" as const,
    },
    input: {
      width: "100%",
      padding: "16px 16px 16px 48px",
      fontSize: "15px",
      backgroundColor: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      color: "#fff",
      outline: "none",
      transition: "all 0.2s ease",
      boxSizing: "border-box" as const,
    },
    btn: {
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 100%)',
        border: 'none',
        borderRadius: '50px',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '8px',
        opacity: loading ? 0.7 : 1
    },
    modeToggle: {
      display: "flex",
      gap: "4px",
      padding: "4px",
      backgroundColor: "rgba(255,255,255,0.05)",
      borderRadius: "12px",
      marginBottom: "24px",
    },
    modeButton: (isActive: boolean) => ({
      flex: 1,
      padding: "10px 16px",
      fontSize: "13px",
      fontWeight: 600,
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      backgroundColor: isActive ? "var(--neon-purple)" : "transparent",
      color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
      boxShadow: isActive ? "var(--neon-purple-glow)" : "none",
    }),
    statusBox: (type: "info" | "success" | "error") => ({
      marginTop: "16px",
      padding: "14px",
      borderRadius: "12px",
      fontSize: "13px",
      textAlign: "center" as const,
      backgroundColor:
        type === "error"
          ? "rgba(255, 71, 87, 0.1)"
          : type === "success"
            ? "rgba(0, 255, 157, 0.1)"
            : "rgba(255,255,255,0.05)",
      color:
        type === "error"
          ? "#ff6b7a"
          : type === "success"
            ? "#BC36C2"
            : "rgba(255,255,255,0.7)",
      border: `1px solid ${
        type === "error"
          ? "rgba(255, 71, 87, 0.2)"
          : type === "success"
            ? "rgba(188, 54, 194, 0.2)"
            : "rgba(255,255,255,0.1)"
      }`,
    }),
  };

  // Validação
  const isFormValid =
    email.length > 0 &&
    password.length > 0 &&
    (mode === "login" || fullName.length > 0);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeBtn}>
          <X size={20} />
        </button>

        <h2 style={styles.title}>Entrar ou Criar Conta</h2>
        <p style={styles.subtitle}>Para salvar sua experiência, precisamos criar sua conta.</p>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={async () => {
            try {
              const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                  redirectTo: window.location.origin,
                },
              });
              if (error) throw error;
            } catch (e: any) {
              setStatus(traduzirErro(e.message));
              setStatusType("error");
            }
          }}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "24px",
            backgroundColor: "#fff",
            color: "#757575",
            border: "1px solid #ddd",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f1f1f1")
          }
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
        >
          <svg
            width="18"
            height="18"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
          >
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          Entrar com Google
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            margin: "0 0 24px 0",
            width: "100%",
            color: "rgba(255,255,255,0.3)",
            fontSize: "12px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
          OU
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }}></div>
        </div>

        {/* Mode Toggle */}
        <div style={styles.modeToggle}>
          <button
            type="button"
            style={styles.modeButton(mode === "login")}
            onClick={() => { setMode("login"); setStatus(""); }}
          >
            Entrar
          </button>
          <button
            type="button"
            style={styles.modeButton(mode === "signup")}
            onClick={() => { setMode("signup"); setStatus(""); }}
          >
            Criar Conta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div style={styles.inputGroup}>
              <div style={styles.inputIcon}>
                <UserPlus size={18} />
              </div>
              <input
                type="text"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={styles.input}
                autoComplete="name"
                disabled={loading}
                required={mode === "signup"}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>
              <Mail size={18} />
            </div>
            <input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoComplete="email"
              disabled={loading}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <div style={styles.inputIcon}>
              <Lock size={18} />
            </div>
            <input
              type="password"
              placeholder={mode === "signup" ? "Senha (mín. 6 caracteres)" : "Sua senha"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={!isFormValid || loading} style={styles.btn}>
            {loading ? <Loader2 className="animate-spin" /> : (mode === 'login' ? <>Entrar <ArrowRight size={18} /></> : <>Criar Conta <UserPlus size={18} /></>)}
          </button>
        </form>

        {status && <div style={styles.statusBox(statusType)}>{status}</div>}
      </div>
    </div>
  );
}
