export function register(config?: any) {
    if ('serviceWorker' in navigator) {
        const swUrl = '/sw.js'; // Assumes sw.js is in public
        window.addEventListener('load', () => {
            registerValidSW(swUrl, config);
        });
    }
}

function registerValidSW(swUrl: string, _config?: any) {
    navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
            console.log('SW registered: ', registration);
        })
        .catch((error) => {
            console.error('SW register error: ', error);
        });
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
            })
            .catch((error) => {
                console.error(error.message);
            });
    }
}
