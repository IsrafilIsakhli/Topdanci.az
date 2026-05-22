import { IsIn, IsOptional } from 'class-validator';

export class AdminAnalyticsQueryDto {
  @IsIn(['7d', '30d', '90d'])
  @IsOptional()
  range: '7d' | '30d' | '90d' = '30d';
}
