
import crypto from 'crypto';

import {connectDB} from "../middleware/db.service.js";
import { logger } from '../middleware/logger.js';

import { ContactSchema } from '../schemas/welcome.schemas.js';
import { ContactService, SubscribeService, SurveyService } from '../services/welcome.service.js';
import { SubscribeSchema } from '../schemas/welcome.schemas.js';
import { SurveySchema } from '../schemas/welcome.schemas.js';
import { EmailService } from '../middleware/nodemailer.service.js';

/**
 * Anonymizes an IP address using SHA-256 and a secret salt.
 * @param {string} ip - The raw IP address.
 * @returns {string|null} - The salted hash of the IP or null if no IP provided.
 */
export const anonymizeIp = (ip) => {
    if (!ip) return null;

    // Use a salt from environment variables for security.
    // Ensure IP_SALT is defined in your .env file.
    const salt = process.env.IP_SALT || 'emergency-fallback-salt-please-set-in-env';

    return crypto
        .createHmac('sha256', salt)
        .update(ip)
        .digest('hex');  // Only include 20 characters for brevity.
};

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

        // Capture and anonymize the IP address from the request object
        const rawIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const hashedIp = anonymizeIp(rawIp);

        // Capture the IP address from the request object
        const surveyPayload = {
            ...validatedData,
            createdAt: new Date().toISOString(),
            ipAddress: hashedIp
        };

        await connectDB();

        // Persist survey data to DB or filesystem.
        await SurveyService.submitSurvey(surveyPayload);

        // Separate from persistence, mail the survey when configured.
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

        await connectDB();

        const surveys = await SurveyService.getSurveys(req.query);
        res.json(surveys);
    } catch (err) {
        logger.error({ err, path: req.path }, 'Internal server error in getSurveys');
        res.status(500).json({ error: 'Failed to fetch surveys' });
    }
};
