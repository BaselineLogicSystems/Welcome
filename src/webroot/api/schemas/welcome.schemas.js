
import { z } from 'zod';

export const ContactSchema = z.object({
    from: z.string().min(1, "Name is required"),
    sender_email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Message body is required"),
});

export const SubscribeSchema = z.object({
    email: z.string().email("Invalid email address"),
    action: z.enum(['add', 'remove']),
});


// Helper to treat empty strings as undefined for optional numeric fields
const ratingEntry = z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce.number().int().min(1).max(5)
);

/**
 * Sanitizes string input by removing any characters that are not
 * alpha-numeric, simple punctuation (.,_-), or spaces.
 * @param {string} input - The raw string to sanitize.
 * @returns {string} - The sanitized string.
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') return input;

    // Regular expression:
    // [^ ... ] matches any character NOT in the set
    // a-zA-Z0-9 : Alpha-numeric
    // .,_-      : Simple punctuation requested
    // \s        : Including whitespace (essential for survey text readability)
    return input.replace(/[^a-zA-Z0-9.,_\-\s]/g, '_');
};

export const SurveySchema = z.object({
    surveyLocation: z.string().max(80).optional().transform(sanitizeString),
    surveyDate: z.string().max(20).optional().transform(sanitizeString),
    clarity: ratingEntry,
    knowledge: ratingEntry,
    safety: ratingEntry,
    patience: ratingEntry,
    overall: ratingEntry,
    strengths: z.string().max(1200).optional().transform(sanitizeString),
    improvements: z.string().max(1200).optional().transform(sanitizeString),
    clientId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    ipAddress: z.string().optional()
}).refine((data) => {
    // Ensure at least one field has a value (excluding undefined/empty strings)
    return Object.values(data).some(val => val !== undefined && val !== '');
}, {
    message: "At least one field must be completed to submit the survey"
});
