type CategoryLink = { id: string; parentId: string | null };

export function wouldCreateCategoryCycle(
  categoryId: string,
  parentId: string,
  categories: readonly CategoryLink[],
): boolean {
  const parents = new Map(categories.map((category) => [category.id, category.parentId]));
  const visited = new Set<string>();
  let current: string | null | undefined = parentId;

  while (current) {
    if (current === categoryId || visited.has(current)) return true;
    visited.add(current);
    current = parents.get(current);
  }

  return false;
}
