export class AudioOverlay {
    private audio: HTMLAudioElement;
    private isPlaying: boolean = false;

    constructor(audioUrl: string) {
        this.audio = new Audio(audioUrl);
        this.audio.loop = true;
    }

    public play() {
        if (!this.isPlaying) {
            this.audio.play().then(() => {
                this.isPlaying = true;
            }).catch(e => console.error("Audio play error:", e));
        }
    }

    public pause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        }
    }

    public stop() {
        this.pause();
        this.audio.currentTime = 0;
    }

    public setUrl(url: string) {
        this.stop();
        this.audio.src = url;
    }

    public dispose() {
        this.stop();
        this.audio.src = '';
    }
}
