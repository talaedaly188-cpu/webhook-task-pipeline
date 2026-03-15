import { z } from "zod";

export const createSubscriberSchema = z.object({
  targetUrl: z.string().url(),
  secret: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional().default(true)
});

export type CreateSubscriberInput = z.infer<typeof createSubscriberSchema>;
