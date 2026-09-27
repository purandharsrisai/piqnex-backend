import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PAGE_SIZE } from '../common/dto/pagination-query.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { MatchListingsQueryDto } from './dto/match-listings-query.dto';
import { SearchListingsQueryDto } from './dto/search-listings-query.dto';
import { ListingStatus } from './listing.constants';

const LISTING_IMAGES_ORDER = { orderBy: { sortOrder: 'asc' as const } };

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /listings - browse/search with filters + pagination.
   *
   * NOTE: the original Supabase schema had a generated `search_vector`
   * tsvector column + GIN index for `q` (see 0001_init_schema.sql). That's
   * intentionally not in prisma/schema.prisma yet (Prisma doesn't model
   * generated/stored columns declaratively) - `q` here does a plain
   * case-insensitive `contains` across the free-text fields instead. Good
   * enough for an early catalog, but swap this for a real Postgres
   * full-text (or `pg_trgm`) query before search volume gets large.
   */
  async search(query: SearchListingsQueryDto) {
    const page = query.page ?? 1;

    const where: Prisma.ListingWhereInput = {
      status: 'active',
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.brand ? { brand: { slug: query.brand } } : {}),
      ...(query.condition ? { condition: query.condition } : {}),
      ...(query.location
        ? { location: { contains: query.location, mode: 'insensitive' } }
        : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? {
            price: {
              ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
              ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
      ...(query.q
        ? {
            OR: (
              [
                'brandName',
                'productName',
                'modelLabel',
                'partName',
                'description',
              ] as const
            ).map((field) => ({
              [field]: { contains: query.q, mode: 'insensitive' as const },
            })),
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: { images: LISTING_IMAGES_ORDER },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return { items, total, page, pageSize: PAGE_SIZE };
  }

  /** GET /listings/featured - recently listed, for the homepage strip. */
  getFeatured(limit = 8) {
    return this.prisma.listing.findMany({
      where: { status: 'active' },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** GET /listings/match - exact match results for the "I Need" search. */
  getMatches(query: MatchListingsQueryDto) {
    return this.prisma.listing.findMany({
      where: {
        status: 'active',
        brandName: { equals: query.brandName, mode: 'insensitive' },
        productName: { equals: query.productName, mode: 'insensitive' },
        partName: { equals: query.partName, mode: 'insensitive' },
        ...(query.modelLabel
          ? { modelLabel: { equals: query.modelLabel, mode: 'insensitive' } }
          : {}),
      },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        images: LISTING_IMAGES_ORDER,
        seller: {
          select: {
            id: true,
            displayName: true,
            location: true,
            createdAt: true,
          },
        },
      },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    return listing;
  }

  create(sellerId: string, dto: CreateListingDto) {
    return this.prisma.listing.create({
      data: {
        sellerId,
        categoryId: dto.categoryId,
        brandId: dto.brandId,
        productId: dto.productId,
        modelId: dto.modelId,
        partId: dto.partId,
        brandName: dto.brandName,
        productName: dto.productName,
        modelLabel: dto.modelLabel,
        partName: dto.partName,
        condition: dto.condition,
        price: dto.price,
        currency: dto.currency ?? 'INR',
        description: dto.description ?? '',
        location: dto.location,
        images: dto.imagePaths?.length
          ? {
              create: dto.imagePaths.map((storagePath, index) => ({
                storagePath,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: { images: LISTING_IMAGES_ORDER },
    });
  }

  async updateStatus(id: string, sellerId: string, status: ListingStatus) {
    await this.assertOwner(id, sellerId);
    return this.prisma.listing.update({ where: { id }, data: { status } });
  }

  async remove(id: string, sellerId: string): Promise<void> {
    await this.assertOwner(id, sellerId);
    await this.prisma.listing.delete({ where: { id } });
  }

  private async assertOwner(id: string, sellerId: string): Promise<void> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { sellerId: true },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    if (listing.sellerId !== sellerId) {
      throw new ForbiddenException('You do not own this listing');
    }
  }
}
