import { Module } from '@nestjs/common';
import { ParameterService } from './parameter.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { ParameterController } from './parameter.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ParameterController],
  providers: [ParameterService],
  exports: [ParameterService],
})
export class ParameterModule {}
