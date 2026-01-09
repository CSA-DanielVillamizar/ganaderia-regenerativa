import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../common/prisma/prisma.module';
import { MovementModule } from '../movement/movement.module';

@Module({
  imports: [PrismaModule, MovementModule],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
