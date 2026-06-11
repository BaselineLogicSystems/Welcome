
import express from 'express';
import { body } from 'express-validator';

import { ROLES } from '../js/components/authServer.js';
import { SERVER_CONFIG } from '../js/config/serverEnv.js';
import { authorize } from '../js/middleware/login.middleware.js';

import * as contactController from '../js/controllers/contact.controller.js';
import * as emailController from '../js/controllers/subscribe.controller.js';

const router = express.Router();

router.get('/status', (req, res) => {
    res.json({ status: 'ok' });
});

router.post(`${SERVER_CONFIG.CONTEXT_ROOT}/api/contact`, [
    body('from').notEmpty(),
    body('sender_email').isEmail(),
    body('subject').notEmpty(),
    body('body').notEmpty(),
], contactController.submitContactForm);

router.get(`${SERVER_CONFIG.CONTEXT_ROOT}/api/emails`,
    authorize(ROLES.MANAGER),
    emailController.getEmails
);

router.post(`${SERVER_CONFIG.CONTEXT_ROOT}/api/emails`, [
    body('email').isEmail(),
    body('action').isIn(['add', 'remove']),
], emailController.manageEmails);

export default router;
