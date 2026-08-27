import { Inject, Injectable } from '@nestjs/common';
import { ApiError } from '../common/api-error';
import { PrismaService } from '../prisma/prisma.service';

export interface AssignmentInput {
  employeeId: string;
  divisionId: string;
  outletId?: string | null;
  effectiveFrom: Date;
  effectiveTo?: Date | null;
}

@Injectable()
export class EmployeeService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  // Validasi tidak overlap untuk satu employee — historis valid
  async validateNoOverlap(employeeId: string, newFrom: Date, newTo: Date | null, excludeId?: string): Promise<void> {
    const existing = await this.prisma.employeeAssignment.findMany({
      where: { employeeId, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    });

    const newToTime = newTo ? newTo.getTime() : Infinity;
    const newFromTime = newFrom.getTime();

    for (const a of existing) {
      const existFrom = new Date(a.effectiveFrom).getTime();
      const existTo = a.effectiveTo ? new Date(a.effectiveTo).getTime() : Infinity;
      // overlap jika newFrom < existTo && newTo > existFrom
      const overlap = newFromTime < existTo && newToTime > existFrom;
      if (overlap) {
        throw new ApiError(
          'INVALID_STATE_TRANSITION',
          `Assignment overlap untuk employee ${employeeId}: ${newFrom.toISOString()} - ${newTo?.toISOString() ?? '∞'} bentrok dengan ${a.effectiveFrom.toISOString()} - ${a.effectiveTo?.toISOString() ?? '∞'}`,
        );
      }
    }
    // juga validasi effectiveFrom < effectiveTo jika keduanya ada
    if (newTo && newFromTime >= newToTime) {
      throw new ApiError('VALIDATION_ERROR', 'effectiveFrom harus sebelum effectiveTo');
    }
  }

  async createAssignment(input: AssignmentInput) {
    await this.validateNoOverlap(input.employeeId, input.effectiveFrom, input.effectiveTo ?? null);
    return this.prisma.employeeAssignment.create({
      data: {
        employeeId: input.employeeId,
        divisionId: input.divisionId,
        outletId: input.outletId ?? null,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo ?? null,
      },
    });
  }

  // Untuk test tanpa DB: pure function check
  static isOverlapping(
    existing: { effectiveFrom: Date; effectiveTo: Date | null }[],
    newFrom: Date,
    newTo: Date | null,
  ): boolean {
    const newToTime = newTo ? newTo.getTime() : Infinity;
    const newFromTime = newFrom.getTime();
    for (const a of existing) {
      const existFrom = new Date(a.effectiveFrom).getTime();
      const existTo = a.effectiveTo ? new Date(a.effectiveTo).getTime() : Infinity;
      if (newFromTime < existTo && newToTime > existFrom) return true;
    }
    return false;
  }
}
