import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DivisionConfigService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getConfig(divisionCode: string) {
    const division = await this.prisma.division.findUnique({ where: { code: divisionCode } });
    if (!division) return null;
    const config = await this.prisma.divisionConfig.findUnique({ where: { divisionId: division.id } });
    if (!config) {
      return {
        divisionCode,
        divisionName: division.name,
        enabledModules: [],
        enabledKpis: [],
        isActive: division.isActive,
      };
    }
    return {
      divisionCode,
      divisionName: division.name,
      enabledModules: config.enabledModules,
      enabledKpis: config.enabledKpis,
      isActive: config.isActive && division.isActive,
    };
  }

  async getAllConfigs() {
    const configs = await this.prisma.divisionConfig.findMany({ include: { division: true } });
    if (configs.length === 0) {
      // fallback to 7 const for test without DB
      return [
        { divisionCode: 'WRAP', enabledModules: ['dashboard', 'revenue'], enabledKpis: ['revenue.gross'] },
        { divisionCode: 'CELL', enabledModules: ['dashboard', 'revenue'], enabledKpis: ['revenue.gross'] },
        { divisionCode: 'REFL', enabledModules: ['dashboard', 'revenue'], enabledKpis: ['revenue.gross'] },
        { divisionCode: 'MINI', enabledModules: ['dashboard', 'revenue'], enabledKpis: ['revenue.gross'] },
        { divisionCode: 'FNB', enabledModules: ['dashboard', 'revenue'], enabledKpis: ['revenue.gross'] },
        { divisionCode: 'FIN', enabledModules: ['dashboard', 'revenue'], enabledKpis: ['revenue.gross'] },
        { divisionCode: 'MC', enabledModules: ['dashboard', 'forex'], enabledKpis: ['forex.volume'] },
      ];
    }
    return configs.map((c) => ({
      divisionCode: c.division.code,
      divisionName: c.division.name,
      enabledModules: c.enabledModules,
      enabledKpis: c.enabledKpis,
      isActive: c.isActive && c.division.isActive,
    }));
  }

  async upsertConfig(divisionCode: string, enabledModules: string[], enabledKpis: string[]) {
    const division = await this.prisma.division.findUnique({ where: { code: divisionCode } });
    if (!division) throw new Error(`Division ${divisionCode} not found`);
    return this.prisma.divisionConfig.upsert({
      where: { divisionId: division.id },
      update: { enabledModules, enabledKpis },
      create: { divisionId: division.id, enabledModules, enabledKpis },
    });
  }

  // Untuk BOD-05: tambah divisi baru tanpa deploy — cukup insert Division + DivisionConfig via DB, shell tetap sama
  async createDivisionWithConfig(code: string, name: string, modules: string[], kpis: string[]) {
    const division = await this.prisma.division.create({ data: { code, name, isActive: true, sortOrder: 99 } });
    const config = await this.prisma.divisionConfig.create({
      data: { divisionId: division.id, enabledModules: modules, enabledKpis: kpis },
    });
    return { division, config };
  }
}
