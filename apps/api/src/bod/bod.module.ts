import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BodReadModelService } from './bod-read-model.service';
import { BodOverviewService } from './bod-overview.service';
import { BodController } from './bod.controller';

@Module({
  imports: [AuthModule],
  providers: [BodReadModelService, BodOverviewService],
  controllers: [BodController],
  exports: [BodReadModelService, BodOverviewService],
})
export class BodModule {}
