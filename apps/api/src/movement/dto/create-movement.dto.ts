import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MovementType } from '@shared/index';
import {
  IsISO8601,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const MOVEMENT_TYPES = [...Object.values(MovementType), 'ROTATION'] as const;
export type MovementTypeValue = (typeof MOVEMENT_TYPES)[number];

/**
 * DTO para registrar movimiento de entrada o salida.
 * Aplica validaciones de formato para IDs, fechas ISO y enums.
 */
export class CreateMovementDto {
  @ApiProperty({ description: 'Identificador del lote' })
  @IsString({ message: 'herdId debe ser texto' })
  @MinLength(1, { message: 'herdId es requerido' })
  herdId!: string;

  @ApiProperty({ description: 'Identificador del potrero' })
  @IsString({ message: 'paddockId debe ser texto' })
  @MinLength(1, { message: 'paddockId es requerido' })
  paddockId!: string;

  @ApiPropertyOptional({ description: 'Identificador del ciclo' })
  @IsOptional()
  @IsString({ message: 'cycleId debe ser texto' })
  @MinLength(1, { message: 'cycleId es requerido si se proporciona' })
  cycleId?: string;

  @ApiProperty({ description: 'Tipo de movimiento', enum: MOVEMENT_TYPES })
  @IsIn(MOVEMENT_TYPES, { message: 'type debe ser ENTRY, EXIT o ROTATION' })
  type!: MovementTypeValue;

  @ApiProperty({ description: 'Fecha de entrada ISO 8601', format: 'date-time' })
  @IsISO8601({ strict: true }, { message: 'entryDate debe ser una fecha ISO válida' })
  entryDate!: string;

  @ApiPropertyOptional({ description: 'Fecha de salida ISO 8601', format: 'date-time' })
  @IsOptional()
  @IsISO8601({ strict: true }, { message: 'exitDate debe ser una fecha ISO válida' })
  exitDate?: string;

  @ApiPropertyOptional({ description: 'Notas del movimiento', maxLength: 500 })
  @IsOptional()
  @IsString({ message: 'notes debe ser texto' })
  @MaxLength(500, { message: 'notes no debe exceder 500 caracteres' })
  notes?: string;
}
