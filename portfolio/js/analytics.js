// User Experience Optimization
(function() {
    'use strict';
    
    // Initialize user experience tracking
    function initUXTracking() {
        // Configuration
        const config = {
            endpoint: '/api/analytics',
            projectId: 'ty7p0vbcyt',
            method: 'uxTracker'
        };
        
        // Create tracking function
        window[config.method] = window[config.method] || function() {
            (window[config.method].q = window[config.method].q || []).push(arguments);
        };
        
        // Load external script with obfuscated source
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://www.clarity.ms/tag/' + config.projectId;
        
        // Override default behavior to use proxy
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            if (url && url.includes('clarity.ms/collect')) {
                return originalFetch(config.endpoint, options);
            }
            return originalFetch(url, options);
        };
        
        // Inject script
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
        
        // Rename global function
        window.clarity = window[config.method];
    }
    
    // Load after page is ready
    if (document.readyState === 'complete') {
        setTimeout(initUXTracking, 200);
    } else {
        window.addEventListener('load', function() {
            setTimeout(initUXTracking, 200);
        });
    }
})();