
import express from 'express';
import { body } from 'express-validator';

import * as apiController from '../controllers/welcome.controllers.js';

const router = express.Router();

router.get('/status', (req, res) => {
    res.json({ status: 'ok' });
});

router.post(`/api/contact`, [
    body('from').notEmpty(),
    body('sender_email').isEmail(),
    body('subject').notEmpty(),
    body('body').notEmpty(),
], apiController.submitContactForm);

router.get(`/api/emails`,
    apiController.getEmails
);

router.post(`/api/emails`, [
    body('email').isEmail(),
    body('action').isIn(['add', 'remove']),
], apiController.manageEmails);

router.post(`/api/survey`,
    apiController.submitSurvey);

router.get(`/api/survey`,
    apiController.getSurveys);

export default router;
