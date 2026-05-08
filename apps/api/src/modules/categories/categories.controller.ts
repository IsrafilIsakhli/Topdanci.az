import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { CategoriesService } from './categories.service';

@ApiTags('categories')
@Controller({
  path: 'categories',
  version: '1',
})
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  list(@Query() query: ListCategoriesQueryDto) {
    return this.categoriesService.listPublicCategories(query);
  }

  @Get(':slug')
  getBySlug(@Param('slug') slug: string) {
    return this.categoriesService.getPublicCategory(slug);
  }
}
