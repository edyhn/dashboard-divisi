/* eslint-disable @typescript-eslint/no-explicit-any */
import { Body, Controller, Get, HttpCode, Post, Res, UseGuards, Inject } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: any, @Res({ passthrough: true }) res: any) {
    if (!dto.email || !dto.password) {
      // Will be caught by filter as 400, but for envelope, throw
      throw new Error('Email dan password wajib');
    }
    const result = await this.authService.login(dto.email, dto.password);
    // Set httpOnly cookie for browser back-button test (UAT-ACC-08)
    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // set true in production with https
      maxAge: 8 * 60 * 60 * 1000,
      path: '/',
    });
    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async logout(@Res({ passthrough: true }) res: any) {
    res.clearCookie('access_token', { path: '/' });
    return { message: 'Logout berhasil' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: any) {
    const me = await this.authService.getMe(user);
    return me;
  }

  @Post('reset')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async reset(
    @CurrentUser() user: any,
    @Body() body: any,
  ) {
    const result = await this.authService.resetPassword(user.sub, body.oldPassword, body.newPassword);
    return result;
  }
}
