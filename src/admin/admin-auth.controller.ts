import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';

/**
 * Dedicated login endpoint for the separate Admin Dashboard app
 * (piqnex-admin) - intentionally its own controller, not nested under
 * AdminController (whose @UseGuards(JwtAuthGuard, AdminGuard) applies to
 * every route there, and you can't require a JWT in order to go get one),
 * and intentionally not reusing POST /auth/login.
 */
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }
}
