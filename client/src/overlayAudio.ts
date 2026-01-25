export class AudioOverlay {
    private audio: HTMLAudioElement | null;
    private isDisposed: boolean = false;

    constructor(audioUrl: string) {
        this.audio = new Audio(audioUrl);
        this.audio.loop = true;
    }

    public play() {
        if (this.isDisposed || !this.audio) return;

        this.audio.play().then(() => {
            // Se foi descartado enquanto o play() estava resolvendo, paramos imediatamente
            if (this.isDisposed && this.audio) {
                this.audio.pause();
                this.audio.src = '';
            }
        }).catch(e => {
            // Ignora erro se foi descartado, caso contrário loga
            if (!this.isDisposed) {
                console.warn("Audio play blocked or failed:", e);
            }
        });
    }

    public pause() {
        if (this.audio) {
            this.audio.pause();
        }
    }

    public stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    public dispose() {
        this.isDisposed = true;
        if (this.audio) {
            this.audio.pause();
            this.audio.src = '';
            this.audio.load(); // Libera recursos do navegador
            this.audio = null;
        }
    }
}
