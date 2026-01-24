export interface CameraConfig {
    width?: number;
    height?: number;
    fps?: number;
    facingMode?: 'user' | 'environment';
}

export async function initCamera(
    videoElement: HTMLVideoElement,
    config: CameraConfig = {}
): Promise<MediaStream> {
    const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
            facingMode: config.facingMode || 'environment',
            width: { ideal: config.width || 1280 }, // Lower res for performance? 640x480 might be faster for ORB
            height: { ideal: config.height || 720 },
            frameRate: { ideal: config.fps || 30 }
        }
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = stream;

        // Wait for video to be ready
        await new Promise<void>((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play().catch(e => console.error("Play error:", e));
                resolve();
            };
        });

        return stream;
    } catch (err) {
        console.error("Error accessing camera:", err);
        throw new Error("Could not access camera. Please allow permissions.");
    }
}

export function stopCamera(stream: MediaStream) {
    stream.getTracks().forEach(track => track.stop());
}
