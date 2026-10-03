import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  // AuthModule exports JwtModule (the configured JwtService, same
  // JWT_SECRET/expiry as the rest of the app) - AdminAuthService needs that
  // to mint tokens. It does NOT import/use AuthService itself: admin login
  // has its own independent logic, see admin-auth.service.ts.
  imports: [AuthModule],
  controllers: [AdminController, AdminAuthController],
  providers: [AdminService, AdminAuthService],
})
export class AdminModule {}
