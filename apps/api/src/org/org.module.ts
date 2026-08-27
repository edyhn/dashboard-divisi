import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EmployeeService } from './employee.service';
import { UserScopeService } from './userscope.service';
import { OrgReadModelService } from './org-read-model.service';
import { OrgController } from './org.controller';

@Module({
  imports: [AuthModule],
  controllers: [OrgController],
  providers: [EmployeeService, UserScopeService, OrgReadModelService],
  exports: [EmployeeService, UserScopeService, OrgReadModelService],
})
export class OrgModule {}
