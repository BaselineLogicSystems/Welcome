
import { logger } from '../middleware/logger.js';

import { ContactSchema } from '../schemas/surveySchema.js';
import { ContactService } from '../services/contact.service.js';
import { SubscribeSchema } from '../schemas/surveySchema.js';
import { SubscribeService } from '../services/subscribe.service.js';
import { SurveySchema } from '../schemas/surveySchema.js';
import { SurveyService } from '../services/survey.service.js';

import { EmailService } from '../middleware/nodemailer.service.js';

// --- Contact Controllers ---
export const submitContactForm = async (req, res) => {
    try {
        const validatedData = ContactSchema.parse(req.body);
        await ContactService.saveMessage(validatedData);
        res.status(201).json({ message: 'Message sent successfully' });
    } catch (err) {
        if (err.name === 'ZodError') {
            logger.warn({ errors: err.errors }, 'Contact form validation failed');
            return res.status(400).json({ error: 'Invalid contact form data' });
        }
        logger.error({ err }, 'Server error during contact submission');
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

// --- Subscribe Controllers ---
export const subscribeEmail = async (req, res) => {
    try {
        const validatedContact = SubscribeSchema.parse(req.body);
        await SubscribeService.subscribeNewsletter(validatedContact);
        res.status(201).json({ message: 'Newsletter signup successful' });
    } catch (err) {
        logger.warn({ error: err.errors }, 'Invalid email form data');
        res.status(400).json({ error: 'Invalid email form data' });
    }
};

export const getEmails = async (req, res) => {
    try {
        const emails = await SubscribeService.getEmailList();
        res.json(emails);
    } catch (err) {
        logger.error({ err: err, path: req.path, method: req.method }, 'Internal server error in get emails');
        res.status(500).json({ error: 'Failed to fetch email list' });
    }
};

export const manageEmails = async (req, res) => {
    try {
        logger.debug (`Processing email list management request`);
        const { email, action } = SubscribeSchema.parse(req.body);
        logger.debug (`Updating email list`);
        const updatedList = await SubscribeService.updateEmailList(email, action);
        res.json({ emails: updatedList });
    } catch (err) {
        if (err.name === 'ZodError') {
            logger.warn({ error: err.errors }, 'Validation failed for manage emails');
            return res.status(400).json({ error: 'Invalid request data' });
        }
        logger.error({ err: err, path: req.path, method: req.method }, 'Internal server error in manage emails');
        res.status(500).json({ error: 'Failed to update.  Please try again later.' });
    }
};

// --- Survey Controllers ---
export const submitSurvey = async (req, res) => {
    try {
        logger.info ("Received survey submission");
        const validatedData = SurveySchema.parse(req.body);

        const surveyPayload = {
            ...validatedData,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
        };
        surveyPayload.createdAt = new Date().toISOString();

        await SurveyService.submitSurvey(surveyPayload);

        await EmailService.sendSurveyAlert(surveyPayload);

        res.status(201).json({ message: 'Survey submitted successfully' });
    } catch (err) {
        if (err.name === 'ZodError') {
            logger.warn({ error: err.errors }, 'Invalid survey form data.');
            return res.status(400).json({ error: 'Invalid survey form data: Please complete all ratings fields to submit.', details: err.errors });
        }
        logger.error({ err, path: req.path }, 'Internal server error in submitSurvey');
        res.status(500).json({ error: 'Failed to submit survey' });
    }
};

export const getSurveys = async (req, res) => {
    try {
        const surveys = await SurveyService.getAllSurveys(req.query);
        res.json(surveys);
    } catch (err) {
        logger.error({ err, path: req.path }, 'Internal server error in getSurveys');
        res.status(500).json({ error: 'Failed to fetch surveys' });
    }
};
