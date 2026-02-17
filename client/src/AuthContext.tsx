import React, { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Single source of truth for Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

// Export for use elsewhere
export { supabase };

// Types
export interface UserProfile {
  id: string;
  email: string;
  role: "admin" | "user";
  plan: "free" | "pro" | "enterprise";
  slug: string;
  is_active: boolean;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for:", userId);

      // Criar um timeout de 3 segundos para a busca não travar a UI
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 3000),
      );

      const fetchPromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      // Correr entre a busca e o timeout
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        if (error.message?.includes("abort") || error.code === "ABORT") {
          console.warn("Profile fetch aborted.");
          return null;
        }
        console.error("Error fetching profile:", error);
        return null;
      }
      console.log("Profile loaded successfully:", data?.slug);
      return data as UserProfile;
    } catch (e: any) {
      if (e.message === "timeout") {
        console.warn(
          "Profile fetch timed out. Proceeding without profile data...",
        );
      } else if (!e.message?.includes("abort")) {
        console.error("Exception fetching profile:", e);
      }
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const p = await fetchProfile(user.id);
      setProfile(p);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Timeout de segurança: NUNCA deixa a tela travada no carregamento por mais de 4s
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Auth initialization took too long, forcing UI reveal.");
        setLoading(false);
      }
    }, 4000);

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id).then((p) => {
            if (mounted) {
              setProfile(p);
              setLoading(false);
              clearTimeout(safetyTimeout);
            }
          });
        } else {
          if (mounted) {
            setLoading(false);
            clearTimeout(safetyTimeout);
          }
        }
      } catch (e) {
        console.error("Auth initialization error:", e);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth event:", event);
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).then((p) => {
          if (mounted) {
            setProfile(p);
            setLoading(false);
          }
        });
      } else {
        if (mounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    console.log("Iniciando logout agressivo...");
    try {
      // Limpar todos os possíveis rastros de sessão
      localStorage.clear();
      sessionStorage.clear();
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setUser(null);
      setProfile(null);
      // Redirecionar forçadamente para a raiz limpando a URL
      window.location.replace("/");
    }
  };

  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAdmin, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

// Plan limits helper
export const PLAN_LIMITS = {
  free: 1,
  pro: 20,
  enterprise: 999999,
};

export const getPlanLimit = (profile: UserProfile | null): number => {
  if (profile?.role === "admin") return 999999;
  return PLAN_LIMITS[profile?.plan as keyof typeof PLAN_LIMITS] || 1;
};

export const getPlanName = (plan: string): string => {
  const names: Record<string, string> = {
    free: "Gratuito",
    pro: "Profissional",
    enterprise: "Empresarial",
  };
  return names[plan] || "Gratuito";
};
