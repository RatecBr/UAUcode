/**
 * Utilitário para otimização de arquivos antes do upload.
 * Focado em reduzir o consumo de banda e armazenamento em smartphones.
 */

export const optimizeImage = (
    file: File,
    maxWidth: number = 800,
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

                // Redimensiona mantendo o aspecto
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
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
    width: { ideal: 854 },  // 480p (WVGA) - Muito leve e nítido o suficiente para mobile
    height: { ideal: 480 },
    frameRate: { ideal: 20 } // 20fps economiza banda e mantém fluidez aceitável
});

export const getVideoRecorderOptions = () => {
    // Reduzimos de 1.2Mbps para 700Kbps (~42% de economia adicional)
    const bitsPerSecond = 700000;

    const types = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
    ];

    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
            return { mimeType: type, videoBitsPerSecond: bitsPerSecond };
        }
    }

    return { videoBitsPerSecond: bitsPerSecond };
};

export const getAudioRecorderOptions = () => {
    // 64kbps é mais que suficiente para efeitos e voz em AR
    return {
        audioBitsPerSecond: 64000
    };
};
