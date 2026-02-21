/**
 * Utilitário para otimização de arquivos antes do upload.
 * Focado em reduzir o consumo de banda e armazenamento em smartphones.
 */

export const optimizeImage = (
    file: File,
    quality: number = 0.6
): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensiona mantendo o aspecto, focando no eixo maior para mobile
                const maxDimension = 800;
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (maxDimension / width) * height;
                        width = maxDimension;
                    } else {
                        width = (maxDimension / height) * width;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context not available'));

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const optimizedFile = new File([blob], file.name, {
                                type: 'image/jpeg',
                                lastModified: Date.now(),
                            });
                            resolve(optimizedFile);
                        } else {
                            reject(new Error('Blob creation failed'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};

/**
 * Calcula o tamanho ideal para vídeos gravados em mobile.
 */
export const getVideoConstraints = () => ({
    width: { ideal: 480 },
    height: { ideal: 854 },
    frameRate: { ideal: 20 } // 20fps economiza banda e mantém fluidez aceitável
});

export const getVideoRecorderOptions = () => {
    // Reduzimos de 1.2Mbps para 700Kbps (~42% de economia adicional)
    const bitsPerSecond = 700000;

    const types = [
        'video/mp4', // Prioridade no iOS/Safari
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
    ];

    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return { mimeType: type, videoBitsPerSecond: bitsPerSecond };
        }
    }

    return { videoBitsPerSecond: bitsPerSecond };
};

export const getAudioRecorderOptions = () => {
    // iOS Safari suporta audio/mp4. WebM é limitado.
    const audioTypes = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
    let mimeType = 'audio/webm'; // fallback

    for (const type of audioTypes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            break;
        }
    }

    return {
        audioBitsPerSecond: 64000,
        mimeType
    };
};
