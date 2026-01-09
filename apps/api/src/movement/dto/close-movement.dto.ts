import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601 } from 'class-validator';

/**
 * DTO para cerrar un movimiento registrando la salida.
 */
export class CloseMovementDto {
  @ApiProperty({ description: 'Fecha de salida ISO 8601', format: 'date-time' })
  @IsISO8601({ strict: true }, { message: 'exitDate debe ser una fecha ISO válida' })
  exitDate!: string;
}
