import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FarmService } from './farm.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateFarmDto } from '@shared/index';

@ApiTags('Fincas')
@Controller('farms')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FarmController {
  constructor(private farmService: FarmService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva finca' })
  create(@Body() dto: CreateFarmDto, @Request() req: any) {
    return this.farmService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mis fincas' })
  findAll(@Request() req: any) {
    return this.farmService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener finca por ID' })
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.farmService.findOne(id, req.user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar finca' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateFarmDto>,
    @Request() req: any
  ) {
    return this.farmService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar finca' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.farmService.remove(id, req.user.id);
  }
}
