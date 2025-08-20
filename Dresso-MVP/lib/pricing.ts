export function bulkListingFeeSEK(n: number): number {
  if (n <= 0) return 0;
  if (n === 1) return 99;
  if (n === 2) return 139;
  if (n === 3) return 169;
  if (n === 4) return 189;
  return 189 + 10*(n-4);
}
