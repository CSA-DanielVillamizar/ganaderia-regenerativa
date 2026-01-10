import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam } from '@nestjs/swagger';
import { ForageService } from './forage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateForageSampleDto } from '@shared/index';

@ApiTags('Aforos')
@Controller('forage-samples')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ForageController {
  constructor(private forageService: ForageService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar aforo' })
  create(@Body() dto: CreateForageSampleDto, @Request() req: any) {
    return this.forageService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener aforos de potrero' })
  findByPaddock(@Query('paddockId') paddockId: string, @Request() req: any) {
    return this.forageService.findByPaddock(paddockId, req.user.id);
  }

  @Get('farm/:farmId')
  @ApiOperation({ summary: 'Obtener aforos recientes de finca' })
  findRecentByFarm(
    @Query('farmId') farmId: string,
    @Query('days') days?: string,
    @Request() req?: any
  ) {
    return this.forageService.findRecentByFarm(farmId, req.user.id, days ? parseInt(days) : 30);
  }

  @Get('paddock/:paddockId/available')
  @ApiOperation({ 
    summary: 'P0.3 - Obtener forraje disponible (en kg MS) para un potrero',
    description: 'Retorna el último aforo con cálculos de materia seca total disponible'
  })
  @ApiParam({ name: 'paddockId', description: 'UUID del potrero', type: 'string' })
  getAvailableForage(
    @Param('paddockId') paddockId: string,
    @Request() req: any
  ) {
    return this.forageService.getAvailableForage(paddockId, req.user.id);
  }
}
