import { Controller, Get } from '@nestjs/common';

/**
 * Controlador de Health Check
 * Proporciona endpoints para verificar el estado del API
 */
@Controller('health')
export class HealthController {
  /**
   * Health check básico
   * @returns Estado del servicio
   */
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Ganadería Regenerativa API',
      version: '1.0.0',
    };
  }

  /**
   * Health check detallado
   * @returns Estado detallado con información del sistema
   */
  @Get('detailed')
  detailed() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Ganadería Regenerativa API',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        unit: 'MB',
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
