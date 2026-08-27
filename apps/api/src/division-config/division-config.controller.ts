/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireCapability } from '../auth/require-capability.decorator';
import { CapabilityGuard } from '../auth/capability.guard';
import { DivisionConfigService } from './division-config.service';

@Controller('division-configs')
@UseGuards(JwtAuthGuard, CapabilityGuard)
export class DivisionConfigController {
  constructor(private readonly configService: DivisionConfigService) {}

  @Get()
  @RequireCapability('view:report')
  async getAll() {
    return this.configService.getAllConfigs();
  }

  @Get(':divisionCode')
  async getOne(@Param('divisionCode') code: string) {
    const cfg = await this.configService.getConfig(code);
    if (!cfg) return { error: { code: 'RESOURCE_NOT_FOUND', message: `Division ${code} not found` } } as any;
    return cfg;
  }

  @Post(':divisionCode')
  @RequireCapability('manage:division')
  async upsert(
    @Param('divisionCode') code: string,
    @Body() body: { enabledModules: string[]; enabledKpis: string[] },
  ) {
    const result = await this.configService.upsertConfig(code, body.enabledModules, body.enabledKpis);
    return result;
  }
}
