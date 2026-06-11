
import express from 'express';
import path from 'path';

import { authorize } from '../middleware/login.middleware.js';
import { ROLES } from '../config/authServer.js';
import { readConfigFile } from '../config/serverConfig.js';
import { SERVER_CONFIG } from '../config/serverEnv.js';

const router = express.Router();
const errorPage = path.join(SERVER_CONFIG.ROOT_DIR, 'pages', 'error404.html');

router.get('/favicon.ico', (req, res) => {
    res.redirect(301, `/images/favicon.png`);
});

router.get(`/{:page}`, authorize(ROLES.PUBLIC), async (req, res) => {
    const pageParam = req.params.page || 'index';
    const pageName = pageParam.replace(/\.html$/, '');
    const config = await readConfigFile();
    const pageCfg = config.app?.pages?.[pageName];

    if (!pageCfg || pageCfg.enabled === false) {
        return res.status(404).sendFile(errorPage);
    }

    const pagePath = path.join(SERVER_CONFIG.ROOT_DIR, 'pages', `${pageName}.html`);
    res.sendFile(pagePath, err => {
        if (err) res.status(404).sendFile(errorPage);
    });
});

export default router;
