import {z} from 'zod';

export const SubscribeSchema = z.object({
    email: z.string().email("Invalid email address"),
    action: z.enum(['add', 'remove']),
});
