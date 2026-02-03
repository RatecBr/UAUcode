import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  Camera,
  Plus,
  X,
  Edit2,
  Trash2,
  QrCode,
  Share2,
  BarChart3,
  Crown,
  Settings,
  Video,
  Mic,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { supabase, useAuth, getPlanLimit, getPlanName } from "../AuthContext";
import QRCodeGenerator from "../components/QRCodeGenerator";
import MediaCapture from "../components/MediaCapture";
import { optimizeImage } from "../utils/fileOptimizer";

interface Target {
  id: number;
  name: string;
  target_url: string;
  content_url: string;
  content_type: string;
  scan_count: number;
}

export default function Dashboard() {
  const { profile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [targets, setTargets] = useState<Target[]>([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentType, setContentType] = useState("video");
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showQR, setShowQR] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [showCapture, setShowCapture] = useState(false);
  const [captureMode, setCaptureMode] = useState<"photo" | "video" | "audio">(
    "photo",
  );
  const [targetPreview, setTargetPreview] = useState<string | null>(null);
  const [contentPreview, setContentPreview] = useState<string | null>(null);

  const planLimit = getPlanLimit(profile);
  const canCreate = targets.length < planLimit;
  const scannerUrl = `${window.location.origin}/s/${profile?.slug || "carregando"}`;

  useEffect(() => {
    if (profile?.id) {
      fetchTargets();
      setNewSlug(profile.slug || "");
    }
  }, [profile]);

  const fetchTargets = async () => {
    if (!profile?.id) return;

    let query = supabase.from("targets").select("*");

    // Se não for admin, filtra apenas os seus
    if (!isAdmin) {
      query = query.eq("user_id", profile.id);
    }

    const { data, error } = await query.order("id", { ascending: false });

    if (!error) setTargets(data || []);
  };

  const uploadFile = async (file: File, predefinedType?: string) => {
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const filePath = `${profile?.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Map MIME types for 3D and other special files if browser fails to detect
    let contentType = predefinedType || file.type;
    if (!contentType || contentType === "") {
      if (fileExt === "glb") contentType = "model/gltf-binary";
      if (fileExt === "gltf") contentType = "model/gltf+json";
    }

    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(filePath, file, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      // Se for erro de aborto, tentamos uma vez mais silenciosamente ou damos uma mensagem melhor
      if (uploadError.message?.includes("aborted")) {
        console.warn("Upload aborted, retrying once...");
        const { error: retryError } = await supabase.storage
          .from("assets")
          .upload(filePath + "-retry", file, { contentType });
        if (retryError) throw retryError;

        const { data } = supabase.storage
          .from("assets")
          .getPublicUrl(filePath + "-retry");
        return data.publicUrl;
      }
      throw uploadError;
    }

    const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editId && !canCreate) {
      alert(
        `Limite de ${planLimit} experiência(s) atingido. Faça upgrade do seu plano.`,
      );
      return;
    }

    if (!editId && (!targetFile || !contentFile)) {
      alert("Arquivos obrigatórios");
      return;
    }

    if (!profile?.id) {
      alert("Perfil não carregado. Aguarde um momento ou recarregue a página.");
      return;
    }

    setUploading(true);

    try {
      let tUrl = null,
        cUrl = null;
      if (targetFile) tUrl = await uploadFile(targetFile, "image/jpeg");

      // Define MIME type esperado para o conteúdo
      const expectedMime =
        contentType === "audio"
          ? "audio/webm"
          : contentType === "video"
            ? "video/mp4"
            : contentType === "3d"
              ? contentFile?.name.endsWith(".glb")
                ? "model/gltf-binary"
                : "model/gltf+json"
              : undefined;

      if (contentFile) cUrl = await uploadFile(contentFile, expectedMime);

      const payload: any = {
        name,
        content_type: contentType,
        user_id: profile.id,
      };
      if (tUrl) payload.target_url = tUrl;
      if (cUrl) payload.content_url = cUrl;

      if (editId) {
        const { error } = await supabase
          .from("targets")
          .update(payload)
          .eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("targets").insert(payload);
        if (error) throw error;
      }

      alert("Salvo com sucesso!");
      resetForm();
      fetchTargets();
    } catch (e: any) {
      console.error("Erro no upload/save:", e);
      alert("Erro ao salvar: " + (e.message || "Erro desconhecido"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Deseja excluir esta experiência?")) return;
    await supabase.from("targets").delete().eq("id", id);
    fetchTargets();
  };

  const startEdit = (t: Target) => {
    setEditId(t.id);
    setName(t.name);
    setTargetFile(null);
    setContentFile(null);
    setTargetPreview(t.target_url);
    setContentPreview(t.content_url);
    setContentType(t.content_type);
    setShowForm(true);
  };

  const resetForm = () => {
    setName("");
    setEditId(null);
    setTargetFile(null);
    setContentFile(null);
    setTargetPreview(null);
    setContentPreview(null);
    setShowForm(false);
  };

  const handleFileChange = async (
    file: File | null,
    type: "target" | "content",
  ) => {
    if (!file) return;

    let processedFile = file;

    // Otimiza se for imagem (alvo sempre é imagem, conteúdo pode ser)
    if (
      type === "target" ||
      (type === "content" && file.type.startsWith("image/"))
    ) {
      try {
        // Diminuímos para 800px para o marcador ser leve e rápido de baixar
        const maxWidth = type === "target" ? 800 : 1280;
        processedFile = await optimizeImage(file, maxWidth, 0.6);
      } catch (e) {
        console.error("Erro ao otimizar imagem:", e);
      }
    }

    if (type === "target") {
      setTargetFile(processedFile);
      setTargetPreview(URL.createObjectURL(processedFile));
    } else {
      setContentFile(processedFile);
      setContentPreview(URL.createObjectURL(processedFile));
    }
  };

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

  const copyLink = () => {
    navigator.clipboard.writeText(scannerUrl);
    alert("Link copiado!");
  };

  const styles = {
    container: {
      minHeight: "100dvh",
      backgroundColor: "#0a0a0f",
      color: "#fff",
      padding: "16px",
      paddingBottom: "100px",
      fontFamily: "Inter, system-ui, sans-serif",
    },
    header: {
      marginBottom: "24px",
    },
    topRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    logo: {
      fontSize: "24px",
      fontWeight: 800,
      color: "#fff",
      margin: 0,
      letterSpacing: "-0.02em",
    },
    planBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "6px 14px",
      borderRadius: "20px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.05em",
      background:
        profile?.plan === "enterprise"
          ? "linear-gradient(135deg, #ffd700, #ff8c00)"
          : profile?.plan === "pro"
            ? "linear-gradient(135deg, #00d4ff, #00ff9d)"
            : "rgba(255,255,255,0.05)",
      color: profile?.plan === "free" ? "rgba(255,255,255,0.5)" : "#000",
    },
    buttons: {
      display: "flex",
      gap: "12px",
    },
    iconButton: {
      width: "44px",
      height: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "all 0.2s",
      color: "#fff",
    },
    statsCard: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "12px",
      marginBottom: "24px",
    },
    statItem: {
      backgroundColor: "rgba(255,255,255,0.02)",
      borderRadius: "16px",
      padding: "20px",
      textAlign: "center" as const,
      border: "1px solid rgba(255,255,255,0.05)",
    },
    statValue: {
      fontSize: "28px",
      fontWeight: 800,
      color: "#00ff9d",
    },
    statLabel: {
      fontSize: "12px",
      fontWeight: 600,
      color: "rgba(255,255,255,0.4)",
      marginTop: "4px",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
    },
    scannerLink: {
      backgroundColor: "rgba(0,255,157,0.05)",
      border: "1px solid rgba(0,255,157,0.1)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "32px",
    },
    linkRow: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    linkText: {
      flex: 1,
      fontSize: "14px",
      fontWeight: 500,
      color: "#00ff9d",
      wordBreak: "break-all" as const,
    },
    card: {
      backgroundColor: "transparent",
      borderRadius: "0",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: 700,
      marginBottom: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "rgba(255,255,255,0.9)",
    },
    listItem: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "16px",
      backgroundColor: "rgba(255,255,255,0.02)",
      borderRadius: "16px",
      marginBottom: "12px",
      border: "1px solid rgba(255,255,255,0.05)",
      transition: "transform 0.2s",
    },
    thumbnail: {
      width: "56px",
      height: "56px",
      borderRadius: "12px",
      objectFit: "cover" as const,
      flexShrink: 0,
    },
    itemInfo: {
      flex: 1,
      overflow: "hidden",
    },
    itemName: {
      fontWeight: 700,
      fontSize: "15px",
      whiteSpace: "nowrap" as const,
      overflow: "hidden",
      textOverflow: "ellipsis",
      color: "#fff",
    },
    itemMeta: {
      fontSize: "12px",
      fontWeight: 500,
      color: "rgba(255,255,255,0.4)",
      display: "flex",
      gap: "12px",
      marginTop: "6px",
      alignItems: "center",
    },
    itemActions: {
      display: "flex",
      gap: "6px",
    },
    actionBtn: {
      width: "36px",
      height: "36px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.03)",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      color: "rgba(255,255,255,0.6)",
      transition: "all 0.2s",
    },
    fab: {
      position: "fixed" as const,
      bottom: "32px",
      right: "32px",
      width: "64px",
      height: "64px",
      borderRadius: "22px",
      backgroundColor: "#00ff9d",
      border: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      boxShadow: "0 12px 24px rgba(0,255,157,0.4)",
      transition: "all 0.3s ease",
    },
    modal: {
      position: "fixed" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.85)",
      backdropFilter: "blur(12px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "20px",
    },
    modalContent: {
      backgroundColor: "#0d0d12",
      borderRadius: "32px",
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "32px",
      maxWidth: "450px",
      width: "100%",
      boxShadow: "0 30px 60px rgba(0,0,0,0.7)",
      position: "relative" as const,
    },
    fieldLabel: {
      fontSize: "10px",
      fontWeight: 800,
      color: "rgba(255,255,255,0.3)",
      letterSpacing: "0.1em",
      marginBottom: "10px",
      display: "block",
      textTransform: "uppercase" as const,
    },
    formInput: {
      width: "100%",
      padding: "16px 20px",
      backgroundColor: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "16px",
      color: "#fff",
      fontSize: "15px",
      outline: "none",
      transition: "all 0.2s",
      boxSizing: "border-box" as const,
    },
    dropzone: {
      border: "2px dashed rgba(255,255,255,0.1)",
      borderRadius: "16px",
      padding: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(255,255,255,0.01)",
      transition: "all 0.2s",
    },
    modernUploadBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      padding: "14px",
      backgroundColor: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "14px",
      color: "#fff",
      fontSize: "13px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s",
      flex: 1,
    },
    primaryBtn: {
      width: "100%",
      padding: "18px",
      backgroundColor: "#00ff9d",
      color: "#000",
      border: "none",
      borderRadius: "18px",
      fontSize: "15px",
      fontWeight: 800,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px",
      marginTop: "12px",
      boxShadow: "0 12px 24px rgba(0,255,157,0.3)",
      transition: "all 0.2s",
    },
  };

  const totalScans = targets.reduce((sum, t) => sum + (t.scan_count || 0), 0);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.topRow}>
          <div>
            <h1 style={styles.logo}>MAIPIX</h1>
            <div style={{ ...styles.planBadge, marginTop: "8px" }}>
              <Crown size={12} />
              {isAdmin ? "Admin" : getPlanName(profile?.plan || "free")}
            </div>
          </div>
          <div style={styles.buttons}>
            {isAdmin && (
              <button
                style={styles.iconButton}
                onClick={() => navigate("/admin")}
                title="Painel Admin"
              >
                <Crown size={20} color="#ffd700" />
              </button>
            )}
            <button
              style={styles.iconButton}
              onClick={() => setShowSettings(true)}
            >
              <Settings size={20} />
            </button>
            <button
              style={styles.iconButton}
              onClick={() => navigate("/scanner")}
            >
              <Camera size={20} />
            </button>
            <button
              style={styles.iconButton}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut size={20} color="#ff4757" />
            </button>
          </div>
        </div>
      </header>

      <div style={styles.statsCard}>
        <div style={styles.statItem}>
          <div style={styles.statValue}>
            {targets.length}/{planLimit === 999999 ? "∞" : planLimit}
          </div>
          <div style={styles.statLabel}>Experiências</div>
        </div>
        <div style={styles.statItem}>
          <div style={styles.statValue}>{totalScans}</div>
          <div style={styles.statLabel}>Escaneamentos</div>
        </div>
      </div>

      <div style={styles.scannerLink}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Seu link de scanner:
        </div>
        <div style={styles.linkRow}>
          <div style={styles.linkText}>{scannerUrl}</div>
          <button style={styles.iconButton} onClick={copyLink}>
            <Share2 size={18} color="#00ff9d" />
          </button>
        </div>
      </div>

      {showForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "22px", fontWeight: 800 }}>
                {editId ? "Editar" : "Nova"} Experiência
              </h3>
              <button
                onClick={resetForm}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  cursor: "pointer",
                  padding: "10px",
                  borderRadius: "14px",
                  color: "#fff",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleUpload}
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div>
                <label style={styles.fieldLabel}>NOME DA EXPERIÊNCIA</label>
                <input
                  type="text"
                  placeholder="Ex: Cartão de Visitas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.formInput}
                  required
                />
              </div>

              <div>
                <label style={styles.fieldLabel}>TIPO DE CONTEÚDO</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["video", "audio", "3d"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setContentType(type)}
                      style={{
                        flex: 1,
                        padding: "12px",
                        borderRadius: "14px",
                        border: "2px solid",
                        borderColor:
                          contentType === type
                            ? "#00ff9d"
                            : "rgba(255,255,255,0.05)",
                        backgroundColor:
                          contentType === type
                            ? "rgba(0,255,157,0.1)"
                            : "rgba(255,255,255,0.02)",
                        color:
                          contentType === type
                            ? "#00ff9d"
                            : "rgba(255,255,255,0.3)",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>
                  IMAGEM ALVO (MARCADOR AR)
                </label>
                <div style={styles.dropzone}>
                  {targetPreview ? (
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "140px",
                      }}
                    >
                      <img
                        src={targetPreview}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "12px",
                          opacity: 0.6,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(0,0,0,0.3)",
                          borderRadius: "12px",
                        }}
                      >
                        <div style={{ textAlign: "center", width: "100%" }}>
                          <p
                            style={{
                              margin: "0 0 8px",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#fff",
                            }}
                          >
                            {targetFile
                              ? "NOVA IMAGEM SELECIONADA"
                              : "IMAGEM ATUAL"}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setTargetFile(null);
                              setTargetPreview(null);
                            }}
                            style={{
                              ...styles.modernUploadBtn,
                              margin: "0 auto",
                              padding: "8px 16px",
                              background: "#ff4757",
                              border: "none",
                              width: "auto",
                              flex: "none",
                            }}
                          >
                            <RefreshCw size={14} /> ALTERAR
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ display: "flex", gap: "12px", width: "100%" }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setCaptureMode("photo");
                          setShowCapture(true);
                        }}
                        style={styles.modernUploadBtn}
                      >
                        <Camera size={20} color="#00ff9d" /> CÂMERA
                      </button>
                      <label style={styles.modernUploadBtn}>
                        <ImageIcon size={20} color="#00ff9d" /> ARQUIVO
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(
                              e.target.files?.[0] || null,
                              "target",
                            )
                          }
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={styles.fieldLabel}>
                  CONTEÚDO AR (ARQUIVO OU GRAVAÇÃO)
                </label>
                <div style={styles.dropzone}>
                  {contentPreview ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        width: "100%",
                        padding: "12px",
                        backgroundColor: contentFile
                          ? "rgba(0,255,157,0.1)"
                          : "rgba(255,255,255,0.05)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            color: contentFile
                              ? "#00ff9d"
                              : "rgba(255,255,255,0.5)",
                            display: "block",
                          }}
                        >
                          {contentFile
                            ? "✓ NOVO CONTEÚDO PRONTO"
                            : "CONTEÚDO EXISTENTE"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setContentFile(null);
                          setContentPreview(null);
                        }}
                        style={{
                          background: "#ff4757",
                          border: "none",
                          color: "#fff",
                          cursor: "pointer",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          fontSize: "11px",
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <RefreshCw size={14} /> ALTERAR
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{ display: "flex", gap: "12px", width: "100%" }}
                    >
                      {contentType !== "3d" && (
                        <button
                          type="button"
                          onClick={() => {
                            setCaptureMode(contentType as "video" | "audio");
                            setShowCapture(true);
                          }}
                          style={styles.modernUploadBtn}
                        >
                          {contentType === "video" ? (
                            <Video size={20} color="#00ff9d" />
                          ) : (
                            <Mic size={20} color="#00ff9d" />
                          )}{" "}
                          GRAVAR
                        </button>
                      )}
                      <label style={styles.modernUploadBtn}>
                        <ImageIcon size={20} color="#00ff9d" /> ARQUIVO
                        <input
                          type="file"
                          accept={
                            contentType === "video"
                              ? "video/*"
                              : contentType === "audio"
                                ? "audio/*"
                                : ".glb,.gltf,model/gltf-binary,model/gltf+json"
                          }
                          onChange={(e) =>
                            handleFileChange(
                              e.target.files?.[0] || null,
                              "content",
                            )
                          }
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                style={styles.primaryBtn}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 size={20} className="spin" />
                ) : editId ? (
                  "SALVAR ALTERAÇÕES"
                ) : (
                  "CRIAR AGORA"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {showCapture && (
        <MediaCapture
          mode={captureMode}
          onCapture={(file) => {
            handleFileChange(
              file,
              captureMode === "photo" ? "target" : "content",
            );
            setShowCapture(false);
          }}
          onClose={() => setShowCapture(false)}
        />
      )}

      <div style={styles.card}>
        <div style={styles.cardTitle}>
          <span>Minhas Experiências ({targets.length})</span>
        </div>

        {targets.length === 0 ? (
          <div
            style={{
              padding: "60px 40px",
              textAlign: "center",
              backgroundColor: "rgba(255,255,255,0.02)",
              borderRadius: "24px",
              border: "1px dashed rgba(255,255,255,0.1)",
            }}
          >
            <ImageIcon
              size={48}
              style={{ opacity: 0.2, marginBottom: "16px" }}
            />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "15px" }}>
              Nada por aqui ainda. Clique no + para começar!
            </div>
          </div>
        ) : (
          targets.map((t) => (
            <div key={t.id} style={styles.listItem}>
              <img src={t.target_url} alt={t.name} style={styles.thumbnail} />
              <div style={styles.itemInfo}>
                <div style={styles.itemName}>{t.name}</div>
                <div style={styles.itemMeta}>
                  <span
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {t.content_type}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <BarChart3 size={12} /> {t.scan_count || 0}
                  </span>
                </div>
              </div>
              <div style={styles.itemActions}>
                <button
                  style={styles.actionBtn}
                  onClick={() => setShowQR(t.id)}
                >
                  <QrCode size={18} />
                </button>
                <button style={styles.actionBtn} onClick={() => startEdit(t)}>
                  <Edit2 size={18} />
                </button>
                <button
                  style={{ ...styles.actionBtn, color: "#ff4757" }}
                  onClick={() => handleDelete(t.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!showForm && (
        <button
          style={styles.fab}
          onClick={() => canCreate && setShowForm(true)}
          disabled={!canCreate}
        >
          <Plus size={32} color="#000" />
        </button>
      )}

      {showQR && (
        <div style={styles.modal} onClick={() => setShowQR(null)}>
          <div style={{ ...styles.modalContent, textAlign: "center" }}>
            <h3
              style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: 800 }}
            >
              QR Code da Experiência
            </h3>
            <div
              style={{
                backgroundColor: "#fff",
                padding: "20px",
                borderRadius: "24px",
                display: "inline-block",
              }}
            >
              <QRCodeGenerator
                url={`${scannerUrl}/${showQR}`}
                name={targets.find((t) => t.id === showQR)?.name || ""}
              />
            </div>
            <button
              onClick={() => setShowQR(null)}
              style={{
                ...styles.primaryBtn,
                marginTop: "24px",
                backgroundColor: "rgba(255,255,255,0.1)",
                color: "#fff",
              }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div style={styles.modal} onClick={() => setShowSettings(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3
              style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: 800 }}
            >
              Configurações
            </h3>
            <div style={{ marginBottom: "24px" }}>
              <label style={styles.fieldLabel}>SEU SLUG PERSONALIZADO</label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) =>
                  setNewSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""),
                  )
                }
                style={styles.formInput}
                placeholder="seunome"
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: "8px",
                }}
              >
                URL: maipix.app/s/{newSlug || "seunome"}
              </div>
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              <button onClick={updateSlug} style={styles.primaryBtn}>
                ATUALIZAR SLUG
              </button>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  ...styles.primaryBtn,
                  backgroundColor: "transparent",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
