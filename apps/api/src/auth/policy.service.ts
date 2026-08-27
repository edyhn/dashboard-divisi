import { Inject, Injectable, Optional } from '@nestjs/common';
import { ApiError } from '../common/api-error';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from './jwt-auth.guard';

// Capability map untuk 7 divisi MVP — BOD all, Manager/Admin strict 1:1
const ROLE_CAPABILITIES: Record<string, string[]> = {
  BOD: ['*'], // all
  MANAGER: ['view:division', 'manage:division', 'view:report', 'write:target', 'write:assessment'],
  ADMIN: ['view:division', 'write:revenue', 'write:target', 'view:report'],
};

@Injectable()
export class PolicyService {
  constructor(@Optional() @Inject(AuditService) private readonly audit?: AuditService) {}

  hasCapability(user: JwtPayload, capability: string): boolean {
    const caps = ROLE_CAPABILITIES[user.role] ?? [];
    return caps.includes('*') || caps.includes(capability);
  }

  assertCapability(user: JwtPayload, capability: string): void {
    if (!this.hasCapability(user, capability)) {
      this.audit?.log({
        actorId: user.sub ?? null,
        actorEmail: user.email ?? null,
        actorRole: user.role,
        action: 'policy.forbidden_capability',
        entity: 'Policy',
        divisionCode: user.divisionCode ?? null,
        metadata: { capability, role: user.role },
      }).catch(() => {});
      throw new ApiError('FORBIDDEN_CAPABILITY', `Role ${user.role} tidak memiliki capability ${capability}`);
    }
  }

  canAccessDivision(user: JwtPayload, divisionCode: string | null | undefined): boolean {
    if (!divisionCode) return true; // no scope filter
    // BOD lintas 7 divisi (divisionCode null = all)
    if (user.role === 'BOD' && (user.divisionCode === null || user.divisionCode === undefined)) {
      return true;
    }
    // Manager/Admin strict 1:1
    return user.divisionCode === divisionCode;
  }

  assertDivisionScope(user: JwtPayload, divisionCode: string | null | undefined): void {
    if (!this.canAccessDivision(user, divisionCode)) {
      this.audit?.log({
        actorId: user.sub ?? null,
        actorEmail: user.email ?? null,
        actorRole: user.role,
        action: 'policy.scope_violation',
        entity: 'Division',
        divisionCode: divisionCode ?? null,
        metadata: { requested: divisionCode, userDivision: user.divisionCode },
      }).catch(() => {});
      throw new ApiError('SCOPE_VIOLATION', `Akses ditolak untuk divisi ${divisionCode} (user ${user.role}/${user.divisionCode ?? 'ALL'})`);
    }
  }

  // Untuk endpoint yang menerima divisionCode via params/query/body
  assertScopeForRequest(user: JwtPayload, requestedDivisionCode?: string | null): void {
    if (requestedDivisionCode) {
      this.assertDivisionScope(user, requestedDivisionCode);
    }
    // jika tidak ada filter divisi, BOD boleh, Manager/Admin tetap terbatas pada divisi own (handled di service layer via where clause)
  }
}
