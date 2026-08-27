/* eslint-disable @typescript-eslint/no-explicit-any */
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { PolicyService } from './policy.service';
import type { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(@Inject(PolicyService) private readonly policy: PolicyService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload; params?: any; query?: any; body?: any }>();
    const user = request.user;
    if (!user) return false;
    // cek divisionCode dari params/query/body (prioritas itu)
    const divisionCode = request.params?.divisionCode ?? request.query?.divisionCode ?? request.body?.divisionCode;
    if (divisionCode) {
      this.policy.assertDivisionScope(user, String(divisionCode));
    }
    return true;
  }
}
