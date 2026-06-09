import {z} from 'zod';

export const ContactSchema = z.object({
    from: z.string().min(1, "Name is required"),
    sender_email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Message body is required"),
});
