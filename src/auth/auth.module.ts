import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          // @nestjs/jwt's type wants a `ms`-style literal ("7d", "1h", ...)
          // rather than plain `string`, which an env var can never satisfy
          // statically - hence the cast.
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '7d') as never,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  // AuthService (to hash/verify passwords) and JwtModule's JwtService (to
  // mint tokens for a newly-created user right after signup) are the parts
  // other modules will want; JwtAuthGuard/AdminGuard are imported directly
  // from auth/guards/ wherever they're used, they don't need DI.
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
