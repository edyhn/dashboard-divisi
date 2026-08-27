import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserScopeService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getScopesForUser(userId: string) {
    return this.prisma.userScope.findMany({
      where: { userId },
      include: { division: true },
    });
  }

  async hasScope(userId: string, divisionCode: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;
    // BOD lintas 7 divisi (divisionCode null) = all
    if (user.role === 'BOD' && !user.divisionCode) return true;
    const scopes = await this.prisma.userScope.findMany({ where: { userId } });
    if (scopes.length === 0) {
      // fallback to User.divisionCode for strict 1:1
      return user.divisionCode === divisionCode;
    }
    const divisions = await this.prisma.division.findMany({ where: { code: divisionCode } });
    if (divisions.length === 0) return false;
    const divisionId = divisions[0]!.id;
    return scopes.some((s) => s.divisionId === divisionId);
  }

  // For test without DB: in-memory check via User.divisionCode
  static hasScopeInMemory(user: { role: string; divisionCode: string | null }, divisionCode: string): boolean {
    if (user.role === 'BOD' && !user.divisionCode) return true;
    return user.divisionCode === divisionCode;
  }
}
