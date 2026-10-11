import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthThrottlerGuard } from '../common/auth-throttler.guard';
import { ContactFormDto } from './dto/contact-form.dto';
import { SupportService } from './support.service';

@Controller('support')
export class SupportController {
  constructor(private readonly support: SupportService) {}

  /** Public "Contact us" form. Limited to 5 messages per 10 minutes per sender. */
  @UseGuards(AuthThrottlerGuard)
  @Throttle({ default: { ttl: 600_000, limit: 5 } })
  @HttpCode(HttpStatus.OK)
  @Post('contact')
  contact(@Body() dto: ContactFormDto) {
    return this.support.submitContactForm(dto);
  }
}
