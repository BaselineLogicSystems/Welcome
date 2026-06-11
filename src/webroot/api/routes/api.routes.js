
import express from 'express';
import { body } from 'express-validator';

import { ROLES } from '../config/authServer.js';
import { authorize } from '../middleware/login.middleware.js';

import * as contactController from '../controllers/contact.controller.js';
import * as emailController from '../controllers/subscribe.controller.js';

const router = express.Router();

router.get('/status', (req, res) => {
    res.json({ status: 'ok' });
});

router.post(`/api/contact`, [
    body('from').notEmpty(),
    body('sender_email').isEmail(),
    body('subject').notEmpty(),
    body('body').notEmpty(),
], contactController.submitContactForm);

router.get(`/api/emails`,
    authorize(ROLES.MANAGER),
    emailController.getEmails
);

router.post(`/api/emails`, [
    body('email').isEmail(),
    body('action').isIn(['add', 'remove']),
], emailController.manageEmails);

export default router;
