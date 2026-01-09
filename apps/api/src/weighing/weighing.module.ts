import { Module } from '@nestjs/common';
import { WeighingService } from './weighing.service';
import { WeighingController } from './weighing.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WeighingService],
  controllers: [WeighingController],
})
export class WeighingModule {}
