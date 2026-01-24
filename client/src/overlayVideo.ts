export class VideoOverlay {
    private container: HTMLElement;
    private video: HTMLVideoElement;

    constructor(container: HTMLElement) {
        this.container = container;
        this.video = document.createElement('video');
        this.video.style.maxWidth = '100%';
        this.video.style.maxHeight = '100%';
        this.video.style.borderRadius = '16px';
        this.video.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
        this.video.controls = true;
        this.video.loop = true;
        this.video.playsInline = true; // CRITICAL for iOS/Mobile PWA
        (this.video as any).webkitPlaysInline = true; // Legacy iOS
        // Apply animation class
        this.video.className = 'overlay-content';
    }

    public setSource(url: string) {
        this.video.src = url;
        this.video.load(); // Force load
    }

    public show() {
        if (!this.container.contains(this.video)) {
            this.container.innerHTML = ''; // Clear previous
            this.container.appendChild(this.video);

            // Try playing with sound first
            this.video.play()
                .then(() => {
                    console.log("Video playing with sound");
                })
                .catch(e => {
                    console.warn("Autoplay blocked (likely due to sound). Retrying muted.", e);
                    this.video.muted = true;
                    this.video.play().catch(err => console.error("Video playback failed completely", err));
                });
        }
    }

    public hide() {
        if (this.container.contains(this.video)) {
            this.video.pause();
            this.container.removeChild(this.video);
        }
    }

    public dispose() {
        this.hide();
        this.video.src = '';
    }
}
