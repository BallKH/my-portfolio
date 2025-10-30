// Professional Analytics Integration
(function() {
    'use strict';
    
    // Load analytics after page is fully loaded
    function initAnalytics() {
        // Obfuscated Clarity integration
        const config = {
            endpoint: 'https://www.clarity.ms/tag/',
            projectId: 'ty7p0vbcyt',
            method: 'clarity'
        };
        
        // Create and inject tracking script
        const script = document.createElement('script');
        script.async = true;
        script.src = config.endpoint + config.projectId;
        
        // Initialize Clarity function
        window[config.method] = window[config.method] || function() {
            (window[config.method].q = window[config.method].q || []).push(arguments);
        };
        
        // Inject script after other scripts
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
    }
    
    // Load after DOM and other resources are ready
    if (document.readyState === 'complete') {
        setTimeout(initAnalytics, 100);
    } else {
        window.addEventListener('load', function() {
            setTimeout(initAnalytics, 100);
        });
    }
})();