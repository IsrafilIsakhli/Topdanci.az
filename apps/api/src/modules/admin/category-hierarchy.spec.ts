import { describe, expect, it } from 'vitest';
import { wouldCreateCategoryCycle } from './category-hierarchy';

const categories = [
  { id: 'root', parentId: null },
  { id: 'child', parentId: 'root' },
  { id: 'grandchild', parentId: 'child' },
  { id: 'other', parentId: null },
];

describe('category hierarchy', () => {
  it('rejects self-parenting and descendant parents', () => {
    expect(wouldCreateCategoryCycle('root', 'root', categories)).toBe(true);
    expect(wouldCreateCategoryCycle('root', 'grandchild', categories)).toBe(true);
  });

  it('allows moving a category outside its subtree', () => {
    expect(wouldCreateCategoryCycle('child', 'other', categories)).toBe(false);
  });

  it('rejects an already cyclic parent chain', () => {
    expect(wouldCreateCategoryCycle('other', 'a', [
      ...categories,
      { id: 'a', parentId: 'b' },
      { id: 'b', parentId: 'a' },
    ])).toBe(true);
  });
});
