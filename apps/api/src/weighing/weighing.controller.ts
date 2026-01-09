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

  @Get(':herdId/history')
  @ApiOperation({ summary: 'Obtener historial de pesajes' })
  getHistory(@Param('herdId') herdId: string, @Request() req: any) {
    return this.weighingService.getHistory(herdId, req.user.id);
  }
}
