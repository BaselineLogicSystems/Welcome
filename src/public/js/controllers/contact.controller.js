
import { ContactSchema } from '../../schemas/contact.schema.js';
import { ContactService } from '../services/contact.service.js';
import { logger } from '../middleware/logger.js';

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