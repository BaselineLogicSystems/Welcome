
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

export const SurveySchema = z.object({
    customerName: z.string().max(8000).optional(),
    customerDate: z.string().max(8000).optional(),
    clarity: ratingEntry,
    knowledge: ratingEntry,
    safety: ratingEntry,
    patience: ratingEntry,
    overall: ratingEntry,
    strengths: z.string().max(8000).optional(),
    improvements: z.string().max(8000).optional(),
    clientId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    ipAddress: z.string().optional()
}).refine((data) => {
    // Ensure at least one field has a value (excluding undefined/empty strings)
    return Object.values(data).some(val => val !== undefined && val !== '');
}, {
    message: "At least one field must be completed to submit the survey"
});
