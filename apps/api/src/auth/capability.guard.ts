import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyService } from './policy.service';
import { REQUIRE_CAPABILITY_KEY } from './require-capability.decorator';
import type { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class CapabilityGuard implements CanActivate {
  constructor(
    @Inject(PolicyService) private readonly policy: PolicyService,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const capability = this.reflector.getAllAndOverride<string>(REQUIRE_CAPABILITY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!capability) return true; // no capability required
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user) return false;
    this.policy.assertCapability(user, capability);
    return true;
  }
}
