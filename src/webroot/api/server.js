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

app.use((req, res) => {
    const errorPage = path.join(process.cwd(), 'public', 'pages', 'error404.html');
    const fallbackPage = path.join(process.cwd(), 'pages', 'error404.html');
    const fallbackPage2 = path.join(process.cwd(), '..', 'public', 'pages', 'error404.html');
    const fallbackPage3 = path.join(process.cwd(), '..', 'pages', 'error404.html');
    const fallbackPage4 = path.join(process.cwd(), 'src', 'webroot', 'public', 'pages', 'error404.html');

    res.status(404).sendFile(errorPage, err => {
        if (err) res.sendFile(fallbackPage, err => {
            if (err) res.sendFile(fallbackPage2, err => {
                if (err) res.sendFile(fallbackPage3, err => {
                    if (err) res.sendFile(fallbackPage4);
                });
            });
        });
    });
});

// --- Generic error handler ------------------------------------------------
app.use(async (err, req, res) => {
    // 1. Log the error locally
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled Server Error');

    // 3. Serve the professional error page
    const errorPage = path.join(process.cwd(), 'public', 'pages', 'error.html');
    const fallbackPage = path.join(process.cwd(), 'pages', 'error.html');
    res.status(500).sendFile(errorPage, err => {
        if (err) res.sendFile(fallbackPage);
    });
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
