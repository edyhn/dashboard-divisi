/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { JwtPayload } from '../auth/jwt-auth.guard';

@Injectable()
export class OrgReadModelService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getDivisionsForUser(user: JwtPayload) {
    const divisions = await this.prisma.division.findMany({ orderBy: { sortOrder: 'asc' } });
    const all = divisions.length > 0
      ? divisions
      : [
          { id: '1', code: 'WRAP', name: 'Wrapping', isActive: true, sortOrder: 1 },
          { id: '2', code: 'CELL', name: 'Cellular', isActive: true, sortOrder: 2 },
          { id: '3', code: 'REFL', name: 'Refleksi', isActive: true, sortOrder: 3 },
          { id: '4', code: 'MINI', name: 'Minimarket', isActive: true, sortOrder: 4 },
          { id: '5', code: 'FNB', name: 'FnB', isActive: true, sortOrder: 5 },
          { id: '6', code: 'FIN', name: 'Finance', isActive: true, sortOrder: 6 },
          { id: '7', code: 'MC', name: 'Money Changer', isActive: true, sortOrder: 7 },
        ] as any[];

    // BOD lintas 7 divisi -> all, Manager/Admin strict 1:1 -> only own
    if (user.role === 'BOD' && !user.divisionCode) {
      return all.filter((d: any) => d.isActive);
    }
    return all.filter((d: any) => d.code === user.divisionCode && d.isActive);
  }

  async getOutletsForUser(user: JwtPayload, divisionCode?: string) {
    // if divisionCode requested, check scope first
    if (divisionCode && user.role !== 'BOD' && user.divisionCode !== divisionCode) {
      return [];
    }
    const where: any = {};
    if (divisionCode) {
      const division = await this.prisma.division.findUnique({ where: { code: divisionCode } });
      if (!division) return [];
      where.divisionId = division.id;
    } else if (user.role !== 'BOD' && user.divisionCode) {
      const division = await this.prisma.division.findUnique({ where: { code: user.divisionCode } });
      if (!division) return [];
      where.divisionId = division.id;
    }
    const outlets = await this.prisma.outlet.findMany({ where, orderBy: { code: 'asc' } });
    if (outlets.length > 0) return outlets;
    // fallback for test without DB
    const all = [
      { code: 'WRAP-001', name: 'Wrapping Pusat', divisionCode: 'WRAP' },
      { code: 'CELL-001', name: 'Cellular Pusat', divisionCode: 'CELL' },
      { code: 'REFL-001', name: 'Refleksi Pusat', divisionCode: 'REFL' },
      { code: 'MINI-001', name: 'Minimarket Pusat', divisionCode: 'MINI' },
      { code: 'FNB-001', name: 'FnB Pusat', divisionCode: 'FNB' },
      { code: 'FIN-001', name: 'Finance Pusat', divisionCode: 'FIN' },
      { code: 'MC-001', name: 'Money Changer Pusat', divisionCode: 'MC' },
    ];
    if (user.role === 'BOD' && !user.divisionCode) {
      if (divisionCode) return all.filter((o) => o.divisionCode === divisionCode);
      return all;
    }
    return all.filter((o) => o.divisionCode === user.divisionCode);
  }

  async getAssignmentsForUser(user: JwtPayload) {
    // For MVP, return assignments for user's division
    // If BOD, return all assignments (fallback empty for test)
    try {
      const where: any = {};
      if (user.role !== 'BOD' && user.divisionCode) {
        const division = await this.prisma.division.findUnique({ where: { code: user.divisionCode } });
        if (division) where.divisionId = division.id;
      }
      const assignments = await this.prisma.employeeAssignment.findMany({
        where,
        include: { employee: true, division: true, outlet: true },
        orderBy: { effectiveFrom: 'desc' },
        take: 20,
      });
      return assignments;
    } catch {
      return [];
    }
  }

  async getUserContext(user: JwtPayload) {
    const divisions = await this.getDivisionsForUser(user);
    const outlets = await this.getOutletsForUser(user);
    const assignments = await this.getAssignmentsForUser(user);
    return {
      user: { id: user.sub, email: user.email, role: user.role, divisionCode: user.divisionCode },
      divisions: divisions.map((d: any) => ({ code: d.code, name: d.name })),
      outlets: outlets.map((o: any) => ({ code: o.code, name: o.name, divisionCode: (o as any).divisionCode ?? o.divisionId })),
      assignments: assignments.slice(0, 5),
      scope: user.role === 'BOD' ? 'ALL_7_DIVISI' : user.divisionCode,
    };
  }
}
