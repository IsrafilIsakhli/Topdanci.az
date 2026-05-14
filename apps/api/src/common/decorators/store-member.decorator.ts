import { SetMetadata } from '@nestjs/common';

export const STORE_MEMBER_REQUIREMENT = 'storeMemberRequirement';

export type StoreMemberRequirement = {
  source: 'params' | 'query' | 'body';
  key: string;
  allowAdmin?: boolean;
};

export const RequireStoreMember = (
  requirement: StoreMemberRequirement = {
    source: 'params',
    key: 'storeId',
    allowAdmin: true,
  },
) => SetMetadata(STORE_MEMBER_REQUIREMENT, requirement);
