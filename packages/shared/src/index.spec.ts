import { z } from 'zod';
import {
  CreateMovementDtoSchema,
  CloseMovementDtoSchema,
  CreateForageSampleDtoSchema,
  ForageMeasurementType,
  MovementType,
} from '@shared/index';

describe('DTO Schemas - Validations', () => {
  describe('CreateMovementDtoSchema', () => {
    const validMovement = {
      herdId: '550e8400-e29b-41d4-a716-446655440000',
      paddockId: '660e8400-e29b-41d4-a716-446655440000',
      type: MovementType.ENTRY,
      entryDate: '2025-01-10T10:00:00Z',
    };

    it('debe validar movimiento con datos válidos', () => {
      const result = CreateMovementDtoSchema.safeParse(validMovement);
      expect(result.success).toBe(true);
    });

    it('debe rechazar herdId que no es UUID', () => {
      const invalid = { ...validMovement, herdId: 'not-a-uuid' };
      const result = CreateMovementDtoSchema.safeParse(invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('herdId'))).toBe(
          true
        );
      }
    });

    it('debe rechazar paddockId que no es UUID', () => {
      const invalid = { ...validMovement, paddockId: '123' };
      const result = CreateMovementDtoSchema.safeParse(invalid);

      expect(result.success).toBe(false);
    });

    it('debe rechazar entryDate inválido', () => {
      const invalid = { ...validMovement, entryDate: 'not-a-date' };
      const result = CreateMovementDtoSchema.safeParse(invalid);

      expect(result.success).toBe(false);
    });

    it('debe rechazar entryDate en el futuro', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString(); // Mañana
      const invalid = { ...validMovement, entryDate: futureDate };
      const result = CreateMovementDtoSchema.safeParse(invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        const msg = result.error.issues[0]?.message || '';
        expect(msg).toContain('futuro');
      }
    });

    it('debe rechazar exitDate < entryDate', () => {
      const entry = new Date('2025-01-10T10:00:00Z');
      const exit = new Date('2025-01-09T10:00:00Z'); // Un día antes

      const invalid = {
        ...validMovement,
        entryDate: entry.toISOString(),
        exitDate: exit.toISOString(),
      };

      const result = CreateMovementDtoSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe aceptar exitDate >= entryDate', () => {
      const entry = '2025-01-10T10:00:00Z';
      const exit = '2025-01-10T15:00:00Z'; // 5 horas después

      const valid = {
        ...validMovement,
        entryDate: entry,
        exitDate: exit,
      };

      const result = CreateMovementDtoSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('debe validar notes máximo 500 caracteres', () => {
      const longNotes = 'a'.repeat(501);
      const invalid = { ...validMovement, notes: longNotes };
      const result = CreateMovementDtoSchema.safeParse(invalid);

      expect(result.success).toBe(false);
    });

    it('debe aceptar notes de 500 caracteres', () => {
      const notes500 = 'a'.repeat(500);
      const valid = { ...validMovement, notes: notes500 };
      const result = CreateMovementDtoSchema.safeParse(valid);

      expect(result.success).toBe(true);
    });

    it('debe hacer cycleId opcional pero validar UUID si existe', () => {
      const valid = {
        ...validMovement,
        cycleId: '770e8400-e29b-41d4-a716-446655440000',
      };
      const result = CreateMovementDtoSchema.safeParse(valid);
      expect(result.success).toBe(true);

      const invalid = { ...validMovement, cycleId: 'not-uuid' };
      const resultInvalid = CreateMovementDtoSchema.safeParse(invalid);
      expect(resultInvalid.success).toBe(false);
    });
  });

  describe('CloseMovementDtoSchema', () => {
    it('debe validar con exitDate válido', () => {
      const valid = {
        exitDate: '2025-01-15T14:30:00Z',
      };
      const result = CloseMovementDtoSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('debe rechazar exitDate inválido', () => {
      const invalid = { exitDate: 'invalid-date' };
      const result = CloseMovementDtoSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe aceptar notes opcionales', () => {
      const valid = {
        exitDate: '2025-01-15T14:30:00Z',
        notes: 'Movimiento finalizado sin incidentes',
      };
      const result = CloseMovementDtoSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });

  describe('CreateForageSampleDtoSchema', () => {
    const validForageSample = {
      paddockId: '880e8400-e29b-41d4-a716-446655440000',
      kgPerHectare: 2500,
      measurementType: ForageMeasurementType.GREEN,
      dryMatterPercent: 30,
      sampleDate: '2025-01-10T09:00:00Z',
    };

    it('debe validar aforo GREEN con dryMatterPercent', () => {
      const result = CreateForageSampleDtoSchema.safeParse(validForageSample);
      expect(result.success).toBe(true);
    });

    it('debe rechazar aforo GREEN sin dryMatterPercent', () => {
      const invalid = {
        ...validForageSample,
        dryMatterPercent: undefined,
      };
      const result = CreateForageSampleDtoSchema.safeParse(invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toContain('dryMatterPercent');
      }
    });

    it('debe validar aforo DRY_MATTER sin requerir dryMatterPercent', () => {
      const valid = {
        ...validForageSample,
        measurementType: ForageMeasurementType.DRY_MATTER,
        dryMatterPercent: undefined,
      };
      const result = CreateForageSampleDtoSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('debe validar dryMatterPercent entre 0-100', () => {
      const invalid1 = { ...validForageSample, dryMatterPercent: -1 };
      const result1 = CreateForageSampleDtoSchema.safeParse(invalid1);
      expect(result1.success).toBe(false);

      const invalid2 = { ...validForageSample, dryMatterPercent: 101 };
      const result2 = CreateForageSampleDtoSchema.safeParse(invalid2);
      expect(result2.success).toBe(false);

      const valid = { ...validForageSample, dryMatterPercent: 50 };
      const result3 = CreateForageSampleDtoSchema.safeParse(valid);
      expect(result3.success).toBe(true);
    });

    it('debe validar utilizationPercent entre 0-100', () => {
      const invalid = {
        ...validForageSample,
        utilizationPercent: 150,
      };
      const result = CreateForageSampleDtoSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe tener utilizationPercent por defecto 70', () => {
      const withoutUtilization = {
        paddockId: '880e8400-e29b-41d4-a716-446655440000',
        kgPerHectare: 2500,
        measurementType: ForageMeasurementType.GREEN,
        dryMatterPercent: 30,
        sampleDate: '2025-01-10T09:00:00Z',
      };
      const result = CreateForageSampleDtoSchema.safeParse(
        withoutUtilization
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.utilizationPercent).toBe(70);
      }
    });

    it('debe rechazar paddockId que no es UUID', () => {
      const invalid = { ...validForageSample, paddockId: 'not-uuid' };
      const result = CreateForageSampleDtoSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe rechazar kgPerHectare <= 0', () => {
      const invalid = { ...validForageSample, kgPerHectare: 0 };
      const result = CreateForageSampleDtoSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe validar sampleDate ISO datetime', () => {
      const invalid = { ...validForageSample, sampleDate: 'not-a-date' };
      const result = CreateForageSampleDtoSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('debe aceptar legacy fields opcionales', () => {
      const withLegacy = {
        ...validForageSample,
        frameAreaM2: 1,
        freshWeightKg: 2500,
        kgMSPerHa: 750,
      };
      const result = CreateForageSampleDtoSchema.safeParse(withLegacy);
      expect(result.success).toBe(true);
    });

    it('debe transformar string a number para campos numéricos', () => {
      const stringData = {
        paddockId: '880e8400-e29b-41d4-a716-446655440000',
        kgPerHectare: '2500', // String
        measurementType: ForageMeasurementType.GREEN,
        dryMatterPercent: '30', // String
        utilizationPercent: '75', // String
        sampleDate: '2025-01-10T09:00:00Z',
      };

      const result = CreateForageSampleDtoSchema.safeParse(stringData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.kgPerHectare).toBe('number');
        expect(typeof result.data.dryMatterPercent).toBe('number');
        expect(typeof result.data.utilizationPercent).toBe('number');
      }
    });
  });
});
