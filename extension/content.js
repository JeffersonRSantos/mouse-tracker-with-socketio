(() => {
    
    const TARGET_IFRAME_ID = 'editor-preview-iframe';
    let scriptInjected = false;

    function injectScript() {
        if (scriptInjected) return;
        
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('inject.js');
        script.onload = () => script.remove();
        (document.head || document.documentElement).appendChild(script);
        scriptInjected = true;
    }

    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit__feature')) {
            const element = e.target.closest('[data-fingerprint]');
            if (element) {
                const fingerprintId = element.getAttribute('data-fingerprint');
                const iframe = document.getElementById(TARGET_IFRAME_ID);
                console.log("fingerprintId", fingerprintId);
                if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({
                        type: 'ELEMENT_CLICK',
                        data: { fingerprintId }
                    }, '*');
                }
            }
        }
    });
    
    // Only inject the script if we're inside the target iframe
    if (window !== window.top && window.frameElement && window.frameElement.id === TARGET_IFRAME_ID) {
        injectScript();
    }
})();
