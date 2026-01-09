import { Module } from '@nestjs/common';
import { ForageService } from './forage.service';
import { ForageController } from './forage.controller';
import { PrismaModule } from '../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ForageService],
  controllers: [ForageController],
})
export class ForageModule {}
