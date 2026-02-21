import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Trash2,
  Share2,
  Settings,
  Box,
  Mic,
  Link,
  Search,
  Plus,
  Home,
  X,
  Video,
  Eye,
} from "lucide-react";
import { supabase, useAuth, getPlanName } from "../AuthContext";
import { useCreation } from "../contexts/CreationContext";


interface Target {
  id: number;
  name: string;
  target_url: string;
  content_url: string;
  content_type: string;
  scan_count: number;
  created_at: string;
  is_public: boolean;
  categories?: string[];
}

export default function MyLibrary() {
  const { user, profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [newSlug, setNewSlug] = useState("");

  const scannerUrl = `${window.location.origin}/s/${profile?.slug || "..."}`;

  const fetchTargets = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    let query = supabase.from("targets").select("*");

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query.order("id", { ascending: false });

    if (!error) setTargets(data || []);
    setLoading(false);
  }, [profile, isAdmin]);

    const {
        targetFile, contentFile, contentType, contentLink, name,
        isPendingAuth, setIsPendingAuth, resetCreation,
        isPublic, categories
    } = useCreation();

  const isUploadingRef = useRef(false);

  // Função de upload (reutilizada e adaptada)
  const performUpload = useCallback(async () => {
    if (!targetFile || isUploadingRef.current) return;

    isUploadingRef.current = true;
    setUploading(true);

    try {
      const uploadFile = async (file: File, predefinedType?: string) => {
        const fileExt = file.name.split(".").pop()?.toLowerCase();
        const filePath = `${user?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        let mime = predefinedType || file.type;
        if (!mime) {
          if (fileExt === "glb") mime = "model/gltf-binary";
          if (fileExt === "gltf") mime = "model/gltf+json";
        }

        const { error } = await supabase.storage
          .from("assets")
          .upload(filePath, file, { contentType: mime });
        if (error) throw error;

        const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
        return data.publicUrl;
      };

      const tUrl = await uploadFile(targetFile, "image/jpeg");
      let cUrl = null;

      if (contentType !== "link" && contentFile) {
        cUrl = await uploadFile(contentFile);
      }

      const payload: any = {
        name: name || "Nova Experiência",
        content_type: contentType,
        user_id: user?.id,
        target_url: tUrl,
        is_public: isPublic,
        categories: categories, // Added categories
      };

      if (contentType === "link") {
        payload.content_url = contentLink;
      } else if (cUrl) {
        payload.content_url = cUrl;
      }

      const { error } = await supabase.from("targets").insert(payload);
      if (error) throw error;

      alert("Experiência criada com sucesso!");
      resetCreation();
      setIsPendingAuth(false); // Reset pending flag
      fetchTargets();
    } catch (e: any) {
      console.error("Erro no upload automático:", e);
      alert(
        "Erro ao salvar criação pendente: " +
          (e.message || "Erro desconhecido"),
      );
    } finally {
      setUploading(false);
      isUploadingRef.current = false;
    }
  }, [
    targetFile,
    contentFile,
    contentType,
    contentLink,
    name,
    user,
    profile,
    resetCreation,
    fetchTargets,
    setIsPendingAuth,
  ]);

  useEffect(() => {
    if (user?.id) {
      fetchTargets();
      setNewSlug(profile?.slug || "");

      // Check for pending creation
      if (isPendingAuth && targetFile) {
        performUpload();
      }
    }
  }, [user, fetchTargets, isPendingAuth, targetFile, performUpload]);

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta experiência?")) return;
    await supabase.from("targets").delete().eq("id", id);
    fetchTargets();
  };

  const togglePublic = async (id: number, currentStatus: boolean) => {
    // Optimistic update
    setTargets(targets.map(t => t.id === id ? { ...t, is_public: !currentStatus } : t));

    const { error } = await supabase
      .from('targets')
      .update({ is_public: !currentStatus })
      .eq('id', id);

    if (error) {
      // Revert on error
      setTargets(targets.map(t => t.id === id ? { ...t, is_public: currentStatus } : t));
      alert('Erro ao atualizar status público');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(scannerUrl);
    alert("Link copiado!");
  };

  const filteredTargets = targets.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const updateSlug = async () => {
    if (!newSlug.trim()) {
      alert("Slug não pode estar vazio");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({ slug: newSlug.toLowerCase().replace(/[^a-z0-9]/g, "") })
      .eq("id", profile?.id);

    if (error) {
      if (error.code === "23505") {
        alert("Este slug já está em uso. Escolha outro.");
      } else {
        alert("Erro ao atualizar: " + error.message);
      }
    } else {
      alert("Slug atualizado! Recarregando...");
      window.location.reload();
    }
  };

  const styles = {
    container: {
      minHeight: "100dvh",
      backgroundColor: "var(--background)",
      color: "var(--text)",
      padding: "20px",
      paddingBottom: "100px", // Espaço para BottomNav
      fontFamily: "Inter, system-ui, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    title: {
      fontSize: "24px",
      fontWeight: 800,
    },
    planBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 600,
      background: "rgba(188, 54, 194, 0.1)",
      color: "var(--neon-purple)",
      border: "1px solid rgba(188, 54, 194, 0.2)",
    },
    searchBox: {
      background: "var(--surface)",
      border: "1px solid var(--glass-border)",
      borderRadius: "16px",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      marginBottom: "24px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
      gap: "16px",
    },
    card: {
      background: "var(--surface)",
      border: "1px solid var(--glass-border)",
      borderRadius: "20px",

      position: "relative" as const,
      transition: "transform 0.2s",
    },
    cardImage: {
      width: "100%",
      aspectRatio: "0.7",
      objectFit: "cover" as const,
      background: "#000",
      borderTopLeftRadius: "20px",
      borderTopRightRadius: "20px",
    },
    cardContent: {
      padding: "12px",
    },
    cardTitle: {
      fontSize: "14px",
      fontWeight: 600,
      marginBottom: "4px",
      whiteSpace: "nowrap" as const,
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    cardMeta: {
      fontSize: "12px",
      color: "var(--text-muted)",
      display: "flex",
      alignItems: "center",
      gap: "4px",
    },
    iconType: {
      position: "absolute" as const,
      top: "8px",
      right: "8px",
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      padding: "6px",
      borderRadius: "8px",
      color: "#fff",
    },
    emptyState: {
      textAlign: "center" as const,
      padding: "60px 20px",
      color: "var(--text-muted)",
    },
    fab: {
      position: "fixed" as const,
      bottom: "90px", // Acima do BottomNav
      right: "24px",
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      background: "var(--neon-purple)",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 4px 15px rgba(188, 54, 194, 0.4)",
      border: "none",
      cursor: "pointer",
      zIndex: 50,
    },
    modal: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background: "rgba(0,0,0,0.8)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      backdropFilter: "blur(5px)",
    },
    modalContent: {
      background: "var(--surface)",
      padding: "24px",
      borderRadius: "24px",
      width: "90%",
      maxWidth: "400px",
    },
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Minha Biblioteca</h1>
          <div style={styles.planBadge}>
            {isAdmin ? "Admin" : getPlanName(profile?.plan || "free")}
          </div>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text)",
          }}
        >
          <Settings size={24} />
        </button>
      </header>

      {/* Stats Card Simplificado */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(49, 86, 243, 0.1), rgba(188, 54, 194, 0.1))",
          borderRadius: "20px",
          padding: "20px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: "1px solid var(--glass-border)",
        }}
      >
        <div>
          <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "4px" }}>
            SEU LINK PÚBLICO
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: "var(--neon-blue)",
            }}
          >
            uaucode.com/s/{profile?.slug}
          </div>
        </div>
        <button
          onClick={copyLink}
          style={{
            background: "rgba(255,255,255,0.1)",
            borderRadius: "10px",
            padding: "8px",
            border: "none",
            color: "var(--text)",
            cursor: "pointer",
          }}
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Search */}
      <div style={styles.searchBox}>
        <Search size={20} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Buscar experiências..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text)",
            width: "100%",
            outline: "none",
          }}
        />
      </div>

      {loading ? (
        <div
          style={{ display: "flex", justifyContent: "center", padding: "40px" }}
        >
          <div className="animate-spin">⏳</div>
        </div>
      ) : filteredTargets.length === 0 ? (
        <div style={styles.emptyState}>
          <Box size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
          <p>Nenhuma experiência encontrada.</p>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              borderRadius: "20px",
              background: "var(--neon-purple)",
              border: "none",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Criar Agora
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {filteredTargets.map((target) => (
            <div key={target.id} style={styles.card}>
              <div style={styles.iconType}>
                {target.content_type === "video" && (
                  <Video size={18} />
                )}
                {target.content_type === "audio" && <Mic size={18} />}
                {target.content_type === "3d" && <Box size={18} />}
                {target.content_type === "link" && <Link size={18} />}
              </div>
              <img
                src={target.target_url}
                style={styles.cardImage}
                alt={target.name}
                loading="lazy"
              />
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{target.name}</h3>
                <div style={{ marginBottom: '8px' }}>
                    {/* Compact Category Selector for Existing Items */}
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                const el = document.getElementById(`cat-drop-${target.id}`);
                                if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                            }}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                padding: '4px 8px',
                                fontSize: '11px',
                                color: 'var(--neon-blue)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}
                        >
                            <span style={{maxWidth: '120px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>
                                {(target.categories && target.categories.length > 0) 
                                    ? target.categories.join(', ') 
                                    : '+ Categorias'}
                            </span>
                        </button>
                        
                        <div id={`cat-drop-${target.id}`} style={{
                            display: 'none',
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            minWidth: '200px',
                            background: '#1a1a2e',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            padding: '8px',
                            zIndex: 9999,
                            boxShadow: '0 5px 25px rgba(0,0,0,0.8)',
                            marginTop: '4px'
                        }} onClick={e => e.stopPropagation()}>
                             {[
                                'Acessibilidade', 'Rótulo', 'Gente', 'Animal', 
                                'Natureza', 'Produto', 'Logomarca', 'Placa', 'Objeto', 'Outros'
                            ].map(cat => (
                                <label key={cat} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: 'var(--text)',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <input 
                                        type="checkbox"
                                        checked={target.categories?.includes(cat) || false}
                                        onChange={async (e) => {
                                            const currentCats = target.categories || [];
                                            let newCats;
                                            if (e.target.checked) {
                                                newCats = [...currentCats, cat];
                                            } else {
                                                newCats = currentCats.filter((c: string) => c !== cat);
                                            }
                                            
                                            // Optimistic Update
                                            setTargets(targets.map(t => t.id === target.id ? { ...t, categories: newCats } : t));
                                            
                                            await supabase.from('targets').update({ categories: newCats }).eq('id', target.id);
                                        }}
                                        style={{ marginRight: '8px', accentColor: 'var(--neon-purple)' }}
                                    />
                                    {cat}
                                </label>
                            ))}
                             <div 
                                style={{ textAlign: 'center', fontSize: '10px', marginTop: '4px', cursor: 'pointer', color: 'var(--text-muted)' }}
                                onClick={() => {
                                    const el = document.getElementById(`cat-drop-${target.id}`);
                                    if (el) el.style.display = 'none';
                                }}
                            >
                                FECHAR
                            </div>
                        </div>
                    </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "8px"
                  }}
                >
                  <div style={styles.cardMeta}>
                    <Eye size={16} /> <span style={{ fontSize: '14px', fontWeight: 600 }}>{target.scan_count || 0}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(target.id)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,100,100,0.8)",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '8px', marginTop: '4px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <input
                            type="checkbox"
                            checked={target.is_public || false}
                            onChange={() => togglePublic(target.id, target.is_public)}
                            style={{ accentColor: 'var(--neon-purple)', width: '16px', height: '16px' }}
                        />
                        Galeria
                    </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB para criar nova - Redireciona para Home */}
      <button onClick={() => navigate('/')} style={styles.fab}>
        <Plus size={28} />
      </button>



      {/* Settings Modal */}
      {showSettings && (
        <div style={styles.modal} onClick={() => setShowSettings(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: "20px" }}>
                <h3 style={{ margin: 0, fontSize: "20px", fontWeight: 700 }}>
                Configurações
                </h3>
                <button 
                  onClick={() => setShowSettings(false)}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <X size={20} />
                </button>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "12px",
                  opacity: 0.7,
                }}
              >
                SEU SLUG (URL)
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff",
                  }}
                />
                <button
                  onClick={updateSlug}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    background: "var(--neon-blue)",
                    border: "none",
                    color: "#fff",
                  }}
                >
                  Salvar
                </button>
              </div>
            </div>
            <button
              onClick={() => navigate("/")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                color: "var(--text)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              <Home size={18} /> Voltar ao Início
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "rgba(255, 50, 50, 0.1)",
                color: "#ff5555",
                border: "1px solid rgba(255, 50, 50, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: "pointer",
              }}
            >
              <LogOut size={18} /> Sair da conta
            </button>
          </div>
        </div>
      )}

      {/* Uploading Overlay */}
      {uploading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.8)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div className="animate-spin" style={{ fontSize: "40px" }}>
            ⏳
          </div>
          <div style={{ fontWeight: 600 }}>Criando sua experiência...</div>
        </div>
      )}
    </div>
  );
}
