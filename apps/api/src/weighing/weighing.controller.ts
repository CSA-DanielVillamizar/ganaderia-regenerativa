import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WeighingService } from './weighing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWeighingDto } from '@shared/index';

@ApiTags('Pesajes')
@Controller('weighings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WeighingController {
  constructor(private weighingService: WeighingService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar pesaje' })
  create(@Body() dto: CreateWeighingDto, @Request() req: any) {
    return this.weighingService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener pesajes de lote' })
  findByHerd(@Query('herdId') herdId: string, @Request() req: any) {
    return this.weighingService.findByHerd(herdId, req.user.id);
  }

  @Get('herd/:herdId/history')
  @ApiOperation({
    summary: 'P0.6 - Obtener historial de pesajes con paginación',
    description: `
      Retorna historial completo de pesajes del hato con:
      - Paginación (page, limit)
      - Filtros de fecha (from, to)
      - Cálculo de UA por pesaje
      - Estado actual del hato (currentWeight, currentUA)
    `,
  })
  getHistory(
    @Param('herdId') herdId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Request() req?: any,
  ) {
    return this.weighingService.getHistory(herdId, req.user.id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      from: from,
      to: to,
    });
  }
}
