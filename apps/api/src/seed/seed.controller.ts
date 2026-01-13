import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SeedService } from './seed.service';

/**
 * Controlador para seed data de prueba (solo desarrollo)
 */
@Controller('seed')
@UseGuards(JwtAuthGuard)
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  /**
   * POST /api/seed/demo-data
   * Crea datos de prueba: potreros, hatos y movimientos
   */
  @Post('demo-data')
  async seedDemoData(@Request() req: any) {
    return this.seedService.createDemoData(req.user.farmId);
  }
}
