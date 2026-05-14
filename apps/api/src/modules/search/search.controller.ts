import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { SearchService } from './search.service';

@ApiTags('search')
@Public()
@Controller({
  path: 'search',
  version: '1',
})
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query('q') query = '') {
    return this.searchService.search(query);
  }

  @Get('suggestions')
  suggestions(@Query('q') query = '') {
    return this.searchService.suggestions(query);
  }
}
