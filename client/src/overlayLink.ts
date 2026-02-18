export class LinkOverlay {
    private wrapper: HTMLDivElement;
    private iframe: HTMLIFrameElement;
    private disposed = false;

    constructor(onClose: () => void) {
        // Wrapper full-screen
        this.wrapper = document.createElement('div');
        this.wrapper.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            background: #000;
        `;

        // Top bar
        const topBar = document.createElement('div');
        topBar.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 16px;
            background: rgba(13,13,18,0.97);
            border-bottom: 1px solid rgba(255,255,255,0.08);
            flex-shrink: 0;
            gap: 12px;
            min-height: 52px;
        `;

        // URL label
        const urlLabel = document.createElement('span');
        urlLabel.style.cssText = `
            flex: 1;
            font-size: 11px;
            color: rgba(255,255,255,0.4);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: monospace;
        `;

        // Botão abrir em nova aba
        const openBtn = document.createElement('a');
        openBtn.target = '_blank';
        openBtn.rel = 'noopener noreferrer';
        openBtn.style.cssText = `
            padding: 7px 14px;
            background: linear-gradient(135deg, #3156f3, #BC36C2);
            border-radius: 10px;
            color: #fff;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
            flex-shrink: 0;
            white-space: nowrap;
        `;
        openBtn.textContent = '↗ Abrir';

        // Botão fechar — chama onClose diretamente, SEM passar pelo dispose
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            width: 36px; height: 36px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.05);
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            flex-shrink: 0;
        `;
        // Fechar: remove DOM e avisa o scanner — sem chamar dispose()
        closeBtn.onclick = () => {
            this._removeFromDOM();
            onClose();
        };

        topBar.appendChild(urlLabel);
        topBar.appendChild(openBtn);
        topBar.appendChild(closeBtn);

        // iframe
        this.iframe = document.createElement('iframe');
        this.iframe.style.cssText = `
            flex: 1;
            width: 100%;
            border: none;
            background: #fff;
        `;
        this.iframe.setAttribute('allowfullscreen', 'true');
        this.iframe.setAttribute('allow', 'autoplay; fullscreen; camera; microphone');

        this.wrapper.appendChild(topBar);
        this.wrapper.appendChild(this.iframe);

        // Guarda refs para setSource
        (this as unknown as { _urlLabel: HTMLSpanElement })._urlLabel = urlLabel;
        (this as unknown as { _openBtn: HTMLAnchorElement })._openBtn = openBtn;
    }

    public setSource(url: string) {
        this.iframe.src = url;
        (this as unknown as { _urlLabel: HTMLSpanElement })._urlLabel.textContent = url;
        (this as unknown as { _openBtn: HTMLAnchorElement })._openBtn.href = url;
    }

    public show() {
        if (!document.body.contains(this.wrapper)) {
            document.body.appendChild(this.wrapper);
        }
    }

    private _removeFromDOM() {
        if (document.body.contains(this.wrapper)) {
            this.iframe.src = 'about:blank';
            document.body.removeChild(this.wrapper);
        }
    }

    // Chamado pelo resetOverlays do scanner — apenas remove DOM, SEM callback
    public dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this._removeFromDOM();
    }
}
