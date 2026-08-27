import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireCapability } from '../auth/require-capability.decorator';
import { CapabilityGuard } from '../auth/capability.guard';
import { BodReadModelService } from './bod-read-model.service';

@Controller('bod')
@UseGuards(JwtAuthGuard, CapabilityGuard)
export class BodController {
  constructor(private readonly bodReadModel: BodReadModelService) {}

  @Get('executive-read-model')
  @RequireCapability('view:report') // BOD dan Manager yang punya view:report
  async getExecutiveReadModel() {
    const data = await this.bodReadModel.getExecutiveReadModel();
    return data;
  }

  @Get('kpi-compatibility')
  async checkCompatibility(
    @Query('a') a: string,
    @Query('b') b: string,
    @Query('kpi') kpi: string,
  ) {
    const compatible = this.bodReadModel.isComparable(a, b, kpi);
    return { divisionA: a, divisionB: b, kpiCode: kpi, compatible };
  }
}
