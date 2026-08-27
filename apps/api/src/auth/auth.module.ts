import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PolicyService } from './policy.service';
import { CapabilityGuard } from './capability.guard';
import { ScopeGuard } from './scope.guard';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, PolicyService, CapabilityGuard, ScopeGuard],
  exports: [AuthService, JwtAuthGuard, PolicyService, CapabilityGuard, ScopeGuard, JwtModule],
})
export class AuthModule {}
