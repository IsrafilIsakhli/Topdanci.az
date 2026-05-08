import { Injectable } from '@nestjs/common';

const suggestions = [
  'Geyim topdan',
  'Insaat materiallari',
  'Elektronika',
  'Qida mehsullari',
  'Ayaqqabi',
];

@Injectable()
export class SearchService {
  suggestions(query: string) {
    const normalizedQuery = query.trim().toLocaleLowerCase('az-AZ');
    const data = normalizedQuery
      ? suggestions.filter((item) => item.toLocaleLowerCase('az-AZ').includes(normalizedQuery))
      : suggestions;

    return {
      data,
      meta: {
        total: data.length,
      },
    };
  }
}
