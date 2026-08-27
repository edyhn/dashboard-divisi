import { Module } from '@nestjs/common';
import { DivisionConfigService } from './division-config.service';
import { DivisionConfigController } from './division-config.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [DivisionConfigService],
  controllers: [DivisionConfigController],
  exports: [DivisionConfigService],
})
export class DivisionConfigModule {}
