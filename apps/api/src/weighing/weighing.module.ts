import { Module } from '@nestjs/common';
import { WeighingService } from './weighing.service';
import { WeighingController } from './weighing.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ParameterModule } from '../parameter/parameter.module';

@Module({
  imports: [PrismaModule, ParameterModule],
  providers: [WeighingService],
  controllers: [WeighingController],
})
export class WeighingModule {}
