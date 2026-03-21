import { z } from "zod";

export const actionTypeSchema = z.enum([
  "add_metadata",
  "pick_fields",
  "rename_fields"
]);

export const createPipelineSchema = z.object({
  name: z.string().min(1).max(100),
  actionType: actionTypeSchema,
  actionConfig: z.record(z.string(), z.any()).optional().default({}),
  isActive: z.boolean().optional().default(true),
  webhookSecret: z.string().optional()
});

export const updatePipelineSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  actionType: actionTypeSchema.optional(),
  actionConfig: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional()
});

export type CreatePipelineInput = z.infer<typeof createPipelineSchema>;
export type UpdatePipelineInput = z.infer<typeof updatePipelineSchema>;
