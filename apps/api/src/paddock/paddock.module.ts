import { Module } from '@nestjs/common';
import { PaddockService } from './paddock.service';
import { PaddockController } from './paddock.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PaddockService],
  controllers: [PaddockController],
  exports: [PaddockService],
})
export class PaddockModule {}
