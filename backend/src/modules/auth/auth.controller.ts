import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { identity?: string; email?: string; password: string }) {
    const ident = body.identity || body.email || '';
    return this.authService.login(ident, body.password);
  }

  @Post('register')
  async register(@Body() body: { fullName: string; phone: string; email?: string; password: string }) {
    return this.authService.register(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { identity: string }) {
    return this.authService.forgotPassword(body.identity);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; otp: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.otp, body.newPassword);
  }

  @Post('google')
  async googleLogin(@Body() body: { email: string; name: string; avatarUrl?: string; sub?: string }) {
    return this.authService.googleLogin(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    return this.authService.getMe(req.user.sub || req.user.id);
  }
}
