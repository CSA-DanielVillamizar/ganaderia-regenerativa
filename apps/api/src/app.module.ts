import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { FarmModule } from './farm/farm.module';
import { PaddockModule } from './paddock/paddock.module';
import { HerdModule } from './herd/herd.module';
import { WeighingModule } from './weighing/weighing.module';
import { MovementModule } from './movement/movement.module';
import { ForageModule } from './forage/forage.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ParameterModule } from './parameter/parameter.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

import { CalibrationModule } from './calibration/calibration.module';
import { CycleModule } from './cycle/cycle.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { ExportModule } from './export/export.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ParameterModule,
    AuthModule,
    FarmModule,
    PaddockModule,
    HerdModule,
    WeighingModule,
    MovementModule,
    ForageModule,
    DashboardModule,
    CalibrationModule,
    CycleModule,
    IndicatorsModule,
    ExportModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
