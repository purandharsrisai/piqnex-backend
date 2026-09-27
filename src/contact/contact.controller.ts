import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContactService } from './contact.service';
import { CreateContactRequestDto } from './dto/create-contact-request.dto';

// Lives under /listings/:id/contact (see API_SPEC.md's "Contact" section),
// in its own module/controller so ContactService stays self-contained -
// ListingsController doesn't need to know contact requests exist.
@Controller('listings')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':id/contact')
  create(
    @Param('id', ParseUUIDPipe) listingId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateContactRequestDto,
  ) {
    return this.contactService.create(listingId, user.id, dto);
  }
}
