
import express from 'express';
import path from 'path';

import { authorize } from '../js/middleware/login.middleware.js';
import { SERVER_CONFIG } from '../js/config/serverEnv.js';
import { readConfigFile } from '../js/config/serverConfig.js';
import { ROLES } from '../js/components/authServer.js';

const router = express.Router();
const errorPage = path.join(SERVER_CONFIG.ROOT_DIR, 'pages', 'error404.html');

router.get('/', (req, res) => {
    res.redirect(301, `${SERVER_CONFIG.CONTEXT_ROOT}/`);
});

router.get('/favicon.ico', (req, res) => {
    res.redirect(301, `${SERVER_CONFIG.CONTEXT_ROOT}/images/favicon.png`);
});

router.get(`${SERVER_CONFIG.CONTEXT_ROOT}/{:page}`, authorize(ROLES.PUBLIC), async (req, res) => {
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
