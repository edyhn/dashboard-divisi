import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BodReadModelService } from './bod-read-model.service';
import { BodController } from './bod.controller';

@Module({
  imports: [AuthModule],
  providers: [BodReadModelService],
  controllers: [BodController],
  exports: [BodReadModelService],
})
export class BodModule {}
