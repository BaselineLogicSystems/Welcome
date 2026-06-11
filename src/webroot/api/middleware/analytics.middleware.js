// js/middleware/analytics.middleware.js
import fs from 'fs-extra';
import { SERVER_CONFIG } from '../config/serverEnv.js';

/**
 * Generates the Google Analytics gtag.js snippet
 */
function generateGAScript() {
    const gaId = SERVER_CONFIG.KEYS.GOOGLE_ANALYTICS_ID;
    if (!gaId) return '';

    return `
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    </script>
    `;
}

/**
 * Middleware to inject Analytics into HTML responses
 */
export const analyticsMiddleware = async (req, res, next) => {
    // 1. Check feature flag
    if (!SERVER_CONFIG.FEATURES.ENABLE_ANALYTICS_GOOGLE) {
        return next();
    }

    // 2. Only intercept HTML files or the root path
    const isHtmlRequest = req.url.endsWith('.html') || req.url === '/' || req.url === '/index.html';
    if (!isHtmlRequest) {
        return next();
    }

    // Store the original sendFile method to avoid infinite loops or conflicts
    const originalSendFile = res.sendFile;

    // Override res.sendFile for this request
    res.sendFile = async function (filePath, options) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const script = generateGAScript();

            // Inject the script right before the closing </head> tag
            const modifiedContent = content.replace('</head>', `${script}\n</head>`);

            res.setHeader('Content-Type', 'text/html');
            return res.send(modifiedContent);
        } catch (err) {
            // If reading fails, fallback to original sendFile behavior
            return originalSendFile.call(this, filePath, options);
        }
    };

    next();
};