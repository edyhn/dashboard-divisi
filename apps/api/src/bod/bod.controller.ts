import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireCapability } from '../auth/require-capability.decorator';
import { CapabilityGuard } from '../auth/capability.guard';
import { BodReadModelService } from './bod-read-model.service';
import { BodOverviewService } from './bod-overview.service';

@Controller('bod')
@UseGuards(JwtAuthGuard, CapabilityGuard)
export class BodController {
  constructor(
    @Inject(BodReadModelService) private readonly bodReadModel: BodReadModelService,
    @Inject(BodOverviewService) private readonly bodOverview: BodOverviewService,
  ) {}

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

  @Get('overview')
  @RequireCapability('view:report')
  async getOverview(@Query('from') from?: string, @Query('to') to?: string) {
    const data = await this.bodOverview.getOverview(from, to);
    return data;
  }
}
