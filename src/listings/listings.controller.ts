import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateListingDto } from './dto/create-listing.dto';
import { MatchListingsQueryDto } from './dto/match-listings-query.dto';
import { SearchListingsQueryDto } from './dto/search-listings-query.dto';
import { UpdateListingStatusDto } from './dto/update-listing-status.dto';
import { ListingsService } from './listings.service';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  search(@Query() query: SearchListingsQueryDto) {
    return this.listingsService.search(query);
  }

  @Get('featured')
  featured(@Query('limit') limit?: string) {
    return this.listingsService.getFeatured(limit ? Number(limit) : undefined);
  }

  @Get('match')
  match(@Query() query: MatchListingsQueryDto) {
    return this.listingsService.getMatches(query);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.listingsService.getById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateListingDto,
  ) {
    return this.listingsService.create(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateListingStatusDto,
  ) {
    return this.listingsService.updateStatus(id, user.id, dto.status);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.listingsService.remove(id, user.id);
  }
}
