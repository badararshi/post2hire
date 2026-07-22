/**
 * Counts visible characters the way a human (and LinkedIn's own counter)
 * would — by grapheme cluster, not JS string length. This matters because
 * emojis, flags, and accented characters can be multiple UTF-16 code units
 * but a single visible character. Using .length would under- or
 * over-count against the 3,000-character limit.
 */
export function countGraphemes(text: string): number {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text)).length;
  }
  // Fallback: count Unicode code points (still better than .length).
  return Array.from(text).length;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Rough emoji counter — matches most emoji ranges including ZWJ sequences.
 * Used to enforce "minimal emojis, ≤3 unless genuinely needed."
 */
export function countEmojis(text: string): number {
  const emojiRegex =
    /(\p{Extended_Pictographic}(\u200D\p{Extended_Pictographic})*)/gu;
  const matches = text.match(emojiRegex);
  return matches ? matches.length : 0;
}

/**
 * Maps regular ASCII letters/digits to Unicode Mathematical Sans-Serif Bold
 * code points. This is the ONLY reliable way to produce "bold" text that
 * survives being pasted into a LinkedIn post, since LinkedIn strips normal
 * rich-text formatting from pasted content.
 *
 * Covers A-Z, a-z, 0-9. Punctuation and spaces pass through unchanged
 * (there is no bold-punctuation block, and bolding spaces would visually
 * break word boundaries).
 */
const BOLD_MAP: Record<string, number> = {};
(function buildBoldMap() {
  // Mathematical Sans-Serif Bold Capital A starts at U+1D5D4
  for (let i = 0; i < 26; i++) {
    BOLD_MAP[String.fromCharCode(65 + i)] = 0x1d5d4 + i; // A-Z
    BOLD_MAP[String.fromCharCode(97 + i)] = 0x1d5ee + i; // a-z
  }
  // Mathematical Sans-Serif Bold Digit Zero starts at U+1D7EC
  for (let i = 0; i < 10; i++) {
    BOLD_MAP[String.fromCharCode(48 + i)] = 0x1d7ec + i; // 0-9
  }
})();

export function toUnicodeBold(text: string): string {
  return Array.from(text)
    .map((ch) => {
      const code = BOLD_MAP[ch];
      return code ? String.fromCodePoint(code) : ch;
    })
    .join('');
}

/**
 * Detects text that is ALREADY in the Mathematical Sans-Serif Bold Unicode
 * range, so we can compute what percentage of the visible post is "bold"
 * for the <20% validation rule.
 */
export function isBoldCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 0x1d5d4 && codePoint <= 0x1d607) || // bold sans A-Z, a-z
    (codePoint >= 0x1d7ec && codePoint <= 0x1d7f5) // bold sans 0-9
  );
}

export function boldPercentage(text: string): number {
  const chars = Array.from(text);
  if (chars.length === 0) return 0;
  const boldCount = chars.filter((ch) => isBoldCodePoint(ch.codePointAt(0) ?? 0))
    .length;
  return Math.round((boldCount / chars.length) * 1000) / 10; // one decimal
}

/**
 * Strips filesystem-unsafe characters from a generated filename component.
 */
export function sanitizeFilename(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
}
