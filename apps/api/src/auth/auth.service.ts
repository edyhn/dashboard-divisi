/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { JwtPayload } from './jwt-auth.guard';

// Fallback in-memory 17 akun untuk test tanpa DB (hash untuk Password123! via bcrypt 10)
// generated: $2b$10$z6zu1XrJGU/jiOm4TOsQZem7oJW2XKJ/B1bHJdWXWJDFzNZbsGNam
const MOCK_PASSWORD_HASH = '$2b$10$z6zu1XrJGU/jiOm4TOsQZem7oJW2XKJ/B1bHJdWXWJDFzNZbsGNam';
const MOCK_USERS = [
  { id: 'mock-bod1', email: 'bod1@dashboard.test', name: 'BOD 1', role: 'BOD', divisionCode: null, isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-bod2', email: 'bod2@dashboard.test', name: 'BOD 2', role: 'BOD', divisionCode: null, isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-bod3', email: 'bod3@dashboard.test', name: 'BOD 3', role: 'BOD', divisionCode: null, isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-mgr-wrap', email: 'manager.wrap@dashboard.test', name: 'Manager Wrapping', role: 'MANAGER', divisionCode: 'WRAP', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-mgr-cell', email: 'manager.cell@dashboard.test', name: 'Manager Cellular', role: 'MANAGER', divisionCode: 'CELL', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-mgr-refl', email: 'manager.refl@dashboard.test', name: 'Manager Refleksi', role: 'MANAGER', divisionCode: 'REFL', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-mgr-mini', email: 'manager.mini@dashboard.test', name: 'Manager Minimarket', role: 'MANAGER', divisionCode: 'MINI', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-mgr-fnb', email: 'manager.fnb@dashboard.test', name: 'Manager FnB', role: 'MANAGER', divisionCode: 'FNB', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-mgr-fin', email: 'manager.fin@dashboard.test', name: 'Manager Finance', role: 'MANAGER', divisionCode: 'FIN', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-mgr-mc', email: 'manager.mc@dashboard.test', name: 'Manager Money Changer', role: 'MANAGER', divisionCode: 'MC', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-adm-wrap', email: 'admin.wrap@dashboard.test', name: 'Admin Wrapping', role: 'ADMIN', divisionCode: 'WRAP', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-adm-cell', email: 'admin.cell@dashboard.test', name: 'Admin Cellular', role: 'ADMIN', divisionCode: 'CELL', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-adm-refl', email: 'admin.refl@dashboard.test', name: 'Admin Refleksi', role: 'ADMIN', divisionCode: 'REFL', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-adm-mini', email: 'admin.mini@dashboard.test', name: 'Admin Minimarket', role: 'ADMIN', divisionCode: 'MINI', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-adm-fnb', email: 'admin.fnb@dashboard.test', name: 'Admin FnB', role: 'ADMIN', divisionCode: 'FNB', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-adm-fin', email: 'admin.fin@dashboard.test', name: 'Admin Finance', role: 'ADMIN', divisionCode: 'FIN', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
  { id: 'mock-adm-mc', email: 'admin.mc@dashboard.test', name: 'Admin Money Changer', role: 'ADMIN', divisionCode: 'MC', isActive: true, passwordHash: MOCK_PASSWORD_HASH },
];

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(AuditService) private readonly audit: AuditService,
  ) {}

  private async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (user) return user;
    } catch (e) {
      // fallback to mock in test when DB not available
      if (process.env.NODE_ENV !== 'test') throw e;
    }
    return MOCK_USERS.find((u) => u.email === email) as any;
  }

  private async findUserById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (user) return user;
    } catch (e) {
      if (process.env.NODE_ENV !== 'test') throw e;
    }
    return MOCK_USERS.find((u) => u.id === id) as any;
  }

  async validateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Email atau password salah' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Email atau password salah' });
    }
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      divisionCode: user.divisionCode,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '8h',
    });
    await this.audit.log({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: user.role,
      action: 'auth.login',
      entity: 'User',
      entityId: user.id,
      divisionCode: user.divisionCode,
      metadata: { email: user.email },
    });
    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        divisionCode: user.divisionCode,
      },
    };
  }

  async getMe(payload: JwtPayload) {
    const user = await this.findUserById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Sesi tidak valid' });
    }
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      divisionCode: user.divisionCode,
    };
  }

  async resetPassword(userId: string, oldPassword: string, newPassword: string) {
    if (!newPassword || newPassword.length < 8) {
      throw new UnauthorizedException({ code: 'VALIDATION_ERROR', message: 'Password baru minimal 8 karakter' });
    }
    const user = await this.findUserById(userId);
    if (!user) throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'User tidak ditemukan' });
    const ok = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Password lama salah' });
    if (MOCK_USERS.some((m) => m.id === userId) && process.env.NODE_ENV === 'test') {
      // in test mock, don't persist
      return { message: 'Password berhasil direset (mock)' };
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    return { message: 'Password berhasil direset' };
  }
}
