import { Module } from '@nestjs/common';
import { HerdService } from './herd.service';
import { HerdController } from './herd.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ParameterModule } from '../parameter/parameter.module';

@Module({
  imports: [PrismaModule, ParameterModule],
  providers: [HerdService],
  controllers: [HerdController],
  exports: [HerdService],
})
export class HerdModule {}
