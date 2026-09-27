import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  /** Every category, in the order the homepage grid / filter dropdown should show them. */
  getCategories() {
    return this.prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Every brand, optionally narrowed to one category. An unknown slug just
   * comes back as an empty list rather than a 404 - "no brands for this
   * category yet" is a normal, valid state for a marketplace this new.
   */
  getBrands(categorySlug?: string) {
    return this.prisma.brand.findMany({
      where: categorySlug ? { category: { slug: categorySlug } } : undefined,
      orderBy: { name: 'asc' },
    });
  }
}
