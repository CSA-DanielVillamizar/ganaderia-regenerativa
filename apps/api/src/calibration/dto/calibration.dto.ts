import { z } from 'zod';

/**
 * DTOs de Calibración
 */

export const CreateCalibrationDtoSchema = z.object({
  divisor: z
    .number()
    .min(10000)
    .max(13000)
    .describe('Divisor para fórmula de tape: (girth² × length) / divisor'),
  notes: z
    .string()
    .optional()
    .describe('Notas sobre la calibración'),
});

export type CreateCalibrationDto = z.infer<typeof CreateCalibrationDtoSchema>;

export const UpdateCalibrationDtoSchema = CreateCalibrationDtoSchema.partial();

export type UpdateCalibrationDto = z.infer<typeof UpdateCalibrationDtoSchema>;
