import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SavedService } from './saved.service';

@UseGuards(JwtAuthGuard)
@Controller('saved')
export class SavedController {
  constructor(private readonly saved: SavedService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.saved.list(user.id);
  }

  @Get('ids')
  ids(@CurrentUser() user: AuthenticatedUser) {
    return this.saved.ids(user.id);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':listingId')
  save(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listingId', ParseUUIDPipe) listingId: string,
  ) {
    return this.saved.save(user.id, listingId);
  }

  @Delete(':listingId')
  unsave(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listingId', ParseUUIDPipe) listingId: string,
  ) {
    return this.saved.unsave(user.id, listingId);
  }
}
