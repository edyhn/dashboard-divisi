import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { UserScopeService } from './userscope.service';

@Module({
  providers: [EmployeeService, UserScopeService],
  exports: [EmployeeService, UserScopeService],
})
export class OrgModule {}
