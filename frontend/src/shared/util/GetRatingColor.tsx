export function getRatingColor(rating: number): string {
  if (rating < 4) return 'text-red-500';
  if (rating <= 6) return 'text-orange-500';
  return 'text-green-600';
}
