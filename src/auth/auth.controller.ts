import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  LoginDto,
  PasswordChangeDto,
  RequestPasswordChangeDto,
  RequestWithUser,
  VerifyUserDto,
} from './dtos';
import { JwtAuthGuard } from './guards';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify')
  async verify(@Body() dto: VerifyUserDto) {
    return await this.authService.verify(dto);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() dto: RequestPasswordChangeDto) {
    return await this.authService.requestPasswordReset(dto);
  }

  @Post('password-reset')
  async passwordReset(@Body() dto: PasswordChangeDto) {
    return await this.authService.passwordReset(dto);
  }

  @ApiBearerAuth('AccessToken')
  @UseGuards(JwtAuthGuard)
  @Post('request-password-change')
  async requestPasswordChange(@Request() req: RequestWithUser) {
    return await this.authService.requestPasswordChange(req.user);
  }

  @Post('password-change')
  async passwordChange(@Body() dto: PasswordChangeDto) {
    return await this.authService.passwordChange(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }
}
