import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogService } from './catalog.service';

// Same caveat as auth.service.spec.ts: needs `npm run prisma:generate` run
// first (see README.md) - it can't compile in the sandbox this project was
// originally scaffolded in, only because that sandbox can't reach
// Prisma's engine-download host.

describe('CatalogService', () => {
  const prismaMock = {
    category: { findMany: jest.fn() },
    brand: { findMany: jest.fn() },
  };

  let catalogService: CatalogService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    catalogService = moduleRef.get(CatalogService);
  });

  describe('getCategories', () => {
    it('orders categories by sortOrder', async () => {
      prismaMock.category.findMany.mockResolvedValue([]);

      await catalogService.getCategories();

      expect(prismaMock.category.findMany).toHaveBeenCalledWith({
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('getBrands', () => {
    it('lists every brand when no category is given', async () => {
      prismaMock.brand.findMany.mockResolvedValue([]);

      await catalogService.getBrands(undefined);

      expect(prismaMock.brand.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { name: 'asc' },
      });
    });

    it('filters by category slug when given', async () => {
      prismaMock.brand.findMany.mockResolvedValue([]);

      await catalogService.getBrands('mobiles');

      expect(prismaMock.brand.findMany).toHaveBeenCalledWith({
        where: { category: { slug: 'mobiles' } },
        orderBy: { name: 'asc' },
      });
    });
  });
});
