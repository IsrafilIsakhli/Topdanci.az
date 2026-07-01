import defaultCategoryTree from './default-categories.json';

export type DefaultCategoryNode = {
  slug: string;
  name: string;
  icon?: string | undefined;
  children?: DefaultCategoryNode[] | undefined;
};

export const defaultCategories = defaultCategoryTree as DefaultCategoryNode[];

export * from './marketplace-enums';
export * from './pagination';
