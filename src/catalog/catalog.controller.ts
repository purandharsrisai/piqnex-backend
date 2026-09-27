import { Controller, Get, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ListBrandsQueryDto } from './dto/list-brands-query.dto';

@Controller()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('brands')
  getBrands(@Query() query: ListBrandsQueryDto) {
    return this.catalogService.getBrands(query.category);
  }
}
