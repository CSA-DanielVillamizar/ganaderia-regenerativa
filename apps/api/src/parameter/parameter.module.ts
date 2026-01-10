import { Module } from '@nestjs/common';
import { ParameterService } from './parameter.service';
import { ParameterController } from './parameter.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParameterController],
  providers: [ParameterService],
  exports: [ParameterService],
})
export class ParameterModule {}
