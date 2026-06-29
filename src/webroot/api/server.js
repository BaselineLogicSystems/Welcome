import express from 'express';

import path from 'path';

import {logger} from './middleware/logger.js';
import {SERVER_CONFIG} from './config/serverEnv.js';

import apiRoutes from './routes/api.routes.js';
import webRoutes from './routes/web.routes.js';

const app = express();
app.use(express.json());

// Serve static files
app.use(SERVER_CONFIG.CONTEXT_ROOT, express.static(SERVER_CONFIG.ROOT_DIR));

// Routes
app.use(apiRoutes);
app.use(webRoutes);

// --- 404 handler ---
app.use((req, res) => {
    const errorPage = path.join(SERVER_CONFIG.ROOT_DIR, 'pages', 'error404.html');
    res.status(404).sendFile(errorPage);
});

// --- Generic error handler ------------------------------------------------
app.use(async (err, req, res) => {
    // 1. Log the error locally
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled Server Error');

    // 3. Serve the professional error page
    const errorPage = path.join(SERVER_CONFIG.ROOT_DIR, 'pages', 'error.html');
    res.status(500).sendFile(errorPage);
});

// Initialize DB connections before starting the listener
async function startServer() {
    try {
        logger.debug (`Starting server with env: ${SERVER_CONFIG.ENVIRON_NAME}`)

        if (SERVER_CONFIG.ENVIRON_NAME === 'production' || SERVER_CONFIG.ENVIRON_NAME === 'testrunner') {
            logger.info(`Starting app in command mode!  Context Root: ${SERVER_CONFIG.CONTEXT_ROOT}`);
        } else if (SERVER_CONFIG.ENVIRON_NAME === 'development' || SERVER_CONFIG.ENVIRON_NAME === 'test') {
            app.listen(SERVER_CONFIG.PORT, () => {
                logger.info(`Server running at http://localhost:${SERVER_CONFIG.PORT}/`);
            });
        } else {
            logger.info(`Warning: environment not specified.  Exposing the application to caller.`);
        }
    } catch (error) {
        logger.error(error, 'Critical failure during server startup');
        process.exit(1);
    }
}

startServer();

// Export the app so tests can import it
export default app;
