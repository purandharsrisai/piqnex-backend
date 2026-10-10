import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get('sellers/:id')
  seller(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviews.sellerProfile(id);
  }

  @Get('sellers/:id/rating')
  rating(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviews.ratingSummary(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('listings/:id/review-eligibility')
  eligibility(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviews.eligibility(id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('listings/:id/reviews')
  create(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviews.create(id, user.id, dto);
  }
}
