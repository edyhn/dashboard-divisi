/* eslint-disable @typescript-eslint/no-explicit-any */
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  divisionCode: string | null;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Token tidak ditemukan' });
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      (request as any).user = payload;
      return true;
    } catch {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: 'Token tidak valid atau kadaluarsa' });
    }
  }

  private extractToken(request: Request): string | undefined {
    // 1) Authorization Bearer
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    // 2) httpOnly cookie access_token
    const cookies = (request as any).cookies as Record<string, string> | undefined;
    if (cookies?.access_token) {
      return cookies.access_token;
    }
    // 3) x-access-token header fallback
    const xToken = request.headers['x-access-token'] as string | undefined;
    if (xToken) return xToken;
    return undefined;
  }
}
