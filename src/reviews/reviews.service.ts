import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Can this user review this listing's seller, and have they already? */
  async eligibility(listingId: string, userId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId === userId) {
      return { canReview: false, hasReviewed: false, reason: 'own-listing' };
    }
    const [convo, existing] = await Promise.all([
      this.prisma.conversation.findUnique({
        where: { listingId_buyerId: { listingId, buyerId: userId } },
        select: { id: true },
      }),
      this.prisma.review.findUnique({
        where: { listingId_reviewerId: { listingId, reviewerId: userId } },
        select: { id: true },
      }),
    ]);
    return {
      canReview: !!convo && !existing,
      hasReviewed: !!existing,
      reason: convo ? null : 'no-conversation',
    };
  }

  async create(listingId: string, userId: string, dto: CreateReviewDto) {
    const e = await this.eligibility(listingId, userId);
    if (e.hasReviewed) throw new BadRequestException('You already reviewed this seller for this listing');
    if (!e.canReview) {
      throw new ForbiddenException(
        e.reason === 'own-listing'
          ? 'You cannot review yourself'
          : 'Message the seller about this listing before reviewing',
      );
    }
    const listing = await this.prisma.listing.findUniqueOrThrow({
      where: { id: listingId },
      select: { sellerId: true },
    });
    return this.prisma.review.create({
      data: {
        listingId,
        reviewerId: userId,
        sellerId: listing.sellerId,
        rating: dto.rating,
        comment: dto.comment?.trim() ?? '',
      },
    });
  }

  /** Public seller page data. */
  async sellerProfile(sellerId: string) {
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
      select: { id: true, displayName: true, location: true, avatarUrl: true, createdAt: true },
    });
    if (!seller) throw new NotFoundException('Seller not found');

    const [agg, reviews, listings, soldCount] = await Promise.all([
      this.prisma.review.aggregate({
        where: { sellerId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
      this.prisma.review.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          reviewer: { select: { id: true, displayName: true } },
          listing: { select: { id: true, partName: true } },
        },
      }),
      this.prisma.listing.findMany({
        where: { sellerId, status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 24,
        include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      }),
      this.prisma.listing.count({ where: { sellerId, status: 'sold' } }),
    ]);

    return {
      seller,
      rating: {
        average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
        count: agg._count.rating,
      },
      soldCount,
      reviews,
      listings,
    };
  }

  async ratingSummary(sellerId: string) {
    const agg = await this.prisma.review.aggregate({
      where: { sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return {
      average: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
      count: agg._count.rating,
    };
  }
}
