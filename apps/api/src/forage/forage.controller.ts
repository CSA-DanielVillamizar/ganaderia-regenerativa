import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
}
