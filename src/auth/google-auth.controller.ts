import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Res } from '@nestjs/common';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import type { Response } from 'express';
import { GoogleAuthService } from './google-auth.service';

class ExchangeDto {
  @IsString()
  @MaxLength(2000)
  code!: string;
}

class StartQuery {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  redirectTo?: string;
}

@Controller('auth')
export class GoogleAuthController {
  constructor(private readonly google: GoogleAuthService) {}

  /** Lets the frontend hide the Google button until it's configured. */
  @Get('providers')
  providers() {
    return { google: this.google.enabled };
  }

  @Get('google')
  start(@Query() q: StartQuery, @Res() res: Response) {
    res.redirect(this.google.authorizeUrl(q.redirectTo));
  }

  @Get('google/callback')
  async callback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Res() res: Response,
  ) {
    res.redirect(await this.google.handleCallback(code, state, error));
  }

  @HttpCode(HttpStatus.OK)
  @Post('google/exchange')
  exchange(@Body() dto: ExchangeDto) {
    return this.google.exchange(dto.code);
  }
}
