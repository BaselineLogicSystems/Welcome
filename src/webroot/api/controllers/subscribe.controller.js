
import { SubscribeSchema } from '../schemas/subscribe.schema.js';
import { SubscribeService } from '../services/subscribe.service.js';
import { logger } from '../middleware/logger.js';

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