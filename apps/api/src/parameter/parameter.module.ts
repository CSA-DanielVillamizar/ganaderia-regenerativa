import { Module } from '@nestjs/common';
import { ParameterService } from './parameter.service';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ParameterService],
  exports: [ParameterService],
})
export class ParameterModule {}
