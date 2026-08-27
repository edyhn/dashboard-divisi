import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-auth.guard';
import { OrgReadModelService } from './org-read-model.service';

@Controller('org')
@UseGuards(JwtAuthGuard)
export class OrgController {
  constructor(@Inject(OrgReadModelService) private readonly orgReadModel: OrgReadModelService) {}

  @Get('divisions')
  async getDivisions(@CurrentUser() user: JwtPayload) {
    const data = await this.orgReadModel.getDivisionsForUser(user);
    return data;
  }

  @Get('outlets')
  async getOutlets(@CurrentUser() user: JwtPayload, @Query('divisionCode') divisionCode?: string) {
    const data = await this.orgReadModel.getOutletsForUser(user, divisionCode);
    return data;
  }

  @Get('assignments')
  async getAssignments(@CurrentUser() user: JwtPayload) {
    const data = await this.orgReadModel.getAssignmentsForUser(user);
    return data;
  }

  @Get('me/context')
  async getContext(@CurrentUser() user: JwtPayload) {
    const data = await this.orgReadModel.getUserContext(user);
    return data;
  }
}
