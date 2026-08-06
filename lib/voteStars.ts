/** Vote-derived 0–5 star rating from upvotes / downvotes. */

export function voteStarRating(upvotes = 0, downvotes = 0): {
  rating: number | null;
  votes: number;
  ratio: number;
} {
  const up = Math.max(0, upvotes || 0);
  const down = Math.max(0, downvotes || 0);
  const votes = up + down;
  if (votes === 0) {
    return { rating: null, votes: 0, ratio: 0 };
  }
  const ratio = up / votes;
  const rating = Math.round(ratio * 5 * 10) / 10;
  return { rating, votes, ratio };
}

export function formatStarRating(rating: number | null): string {
  if (rating == null) return '—';
  return rating.toFixed(1);
}
