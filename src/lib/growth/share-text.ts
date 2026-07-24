const TWEET_MAX = 280;
// X's counter treats any URL as a fixed-width t.co link (23 chars) plus the
// leading space before it, regardless of the URL's real length.
const URL_COST = 24;
const SAFETY_MARGIN = 4;

/**
 * Builds a share caption from a fixed prefix/suffix around one variable
 * chunk (a post subject or CV role title). Returns the full, untruncated
 * text (for LinkedIn, which has no hard limit and is copy/pasted manually)
 * and a version with the variable chunk truncated with "…" so the whole
 * thing plus a trailing URL fits X's 280-character limit.
 */
export function buildShareTexts(
  prefix: string,
  variable: string,
  suffix: string
): { full: string; tweetSafe: string } {
  const full = `${prefix}${variable}${suffix}`;

  const fixedLen = prefix.length + suffix.length + URL_COST + SAFETY_MARGIN;
  const budget = TWEET_MAX - fixedLen;

  if (variable.length <= budget) {
    return { full, tweetSafe: full };
  }

  const truncated = variable.slice(0, Math.max(0, budget - 1)).trimEnd() + '…';
  return { full, tweetSafe: `${prefix}${truncated}${suffix}` };
}
