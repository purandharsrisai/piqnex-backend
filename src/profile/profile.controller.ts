import { Body, Controller, Delete, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.getMe(user.id);
  }

  @Patch('me')
  updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateMe(user.id, dto);
  }

  @Delete('me')
  deleteMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DeleteAccountDto,
  ) {
    return this.profileService.deleteMe(user.id, dto.password);
  }

  @Get('me/listings')
  getMyListings(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.getMyListings(user.id);
  }

  @Get('me/need-requests')
  getMyNeedRequests(@CurrentUser() user: AuthenticatedUser) {
    return this.profileService.getMyNeedRequests(user.id);
  }
}
