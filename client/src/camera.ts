export interface CameraConfig {
  width?: number;
  height?: number;
  fps?: number;
  facingMode?: "user" | "environment";
}

let currentStream: MediaStream | null = null;

export async function initCamera(
  videoElement: HTMLVideoElement,
  config: CameraConfig = {},
): Promise<MediaStream> {
  // Parar stream anterior se existir para evitar conflitos de hardware
  if (currentStream) {
    stopCamera(currentStream);
  }

  const constraints: MediaStreamConstraints = {
    audio: false,
    video: {
      facingMode: config.facingMode || "environment",
      width: { ideal: config.facingMode === "user" ? 720 : 720 },
      height: { ideal: config.facingMode === "user" ? 1280 : 1280 },
      frameRate: { ideal: config.fps || 30 },
    },
  };

  try {
    console.log("[Camera] Solicitando permissão...");
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log("[Camera] Permissão concedida.");

    currentStream = stream;
    videoElement.srcObject = stream;

    // Atributos obrigatórios para autoplay em navegadores modernos
    videoElement.setAttribute("autoplay", "true");
    videoElement.setAttribute("muted", "true");
    videoElement.setAttribute("playsinline", "true");
    videoElement.muted = true;

    // Forçar play imediato após receber o stream
    try {
      await videoElement.play();
      console.log("[Camera] Play automático iniciado.");
    } catch (e) {
      console.warn(
        "[Camera] Play automático bloqueado, aguardando clique do usuário.",
      );
    }

    return stream;
  } catch (err) {
    console.error("[Camera] Erro fatal ao acessar câmera:", err);
    throw err;
  }
}

export function stopCamera(stream?: MediaStream) {
  const streamToStop = stream || currentStream;
  if (streamToStop) {
    streamToStop.getTracks().forEach((track) => track.stop());
  }
  currentStream = null;
}
