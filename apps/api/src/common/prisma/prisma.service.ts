import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger('PrismaService');

  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('✅ Conectado a la base de datos');

    // Optimizar SQLite para pruebas concurrentes y evitar bloqueos
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.toLowerCase().startsWith('file:') || dbUrl.toLowerCase().includes('sqlite')) {
      try {
        await this.$queryRawUnsafe('PRAGMA journal_mode = WAL;');
        await this.$queryRawUnsafe('PRAGMA synchronous = NORMAL;');
        await this.$queryRawUnsafe('PRAGMA busy_timeout = 10000;');
        this.logger.log('🛠️ PRAGMAs SQLite aplicados (WAL, busy_timeout=10000ms)');
      } catch (e) {
        this.logger.warn(`No se pudieron aplicar PRAGMAs SQLite: ${e}`);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('❌ Desconectado de la base de datos');
  }
}
