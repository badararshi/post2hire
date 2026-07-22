import { countGraphemes, countEmojis, toUnicodeBold } from '@/lib/text/unicode';

export interface PostValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  charCount: number;
  boldPercent: number;
  emojiCount: number;
  /** Post with **markdown bold** converted to real Unicode bold characters. */
  renderedPost: string;
}

const MAX_CHARS = 3000;
const MAX_BOLD_PERCENT = 20;
const MAX_EMOJIS_SOFT_LIMIT = 3;

/**
 * Converts the model's **phrase** markers into actual Unicode bold
 * characters (the form that survives pasting into LinkedIn), and returns
 * both the rendered text and a full validation report.
 */
export function validateAndRenderPost(rawPost: string): PostValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Convert **bold** markers to Unicode bold, stripping the asterisks.
  const rendered = rawPost.replace(/\*\*(.+?)\*\*/g, (_match, phrase: string) =>
    toUnicodeBold(phrase)
  );

  const charCount = countGraphemes(rendered);
  const emojiCount = countEmojis(rendered);

  // Bold percentage computed on the RENDERED text (real Unicode bold chars).
  const chars = Array.from(rendered);
  const boldChars = chars.filter((ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    return (cp >= 0x1d5d4 && cp <= 0x1d607) || (cp >= 0x1d7ec && cp <= 0x1d7f5);
  });
  const boldPercent =
    chars.length > 0 ? Math.round((boldChars.length / chars.length) * 1000) / 10 : 0;

  if (charCount > MAX_CHARS) {
    errors.push(`Post is ${charCount} characters, which exceeds the ${MAX_CHARS} limit.`);
  }
  if (boldPercent >= MAX_BOLD_PERCENT) {
    errors.push(`Bold text is ${boldPercent}% of the post, which meets or exceeds the ${MAX_BOLD_PERCENT}% limit.`);
  }
  if (emojiCount > MAX_EMOJIS_SOFT_LIMIT) {
    warnings.push(`Post uses ${emojiCount} emojis; ${MAX_EMOJIS_SOFT_LIMIT} or fewer is recommended.`);
  }

  const hasQuestion = /\?/.test(rendered);
  if (!hasQuestion) {
    warnings.push('No engagement question detected.');
  }

  const hashtagCount = (rendered.match(/#[A-Za-z0-9_]+/g) || []).length;
  if (hashtagCount < 3 || hashtagCount > 5) {
    warnings.push(`Post has ${hashtagCount} hashtags; 3-5 is expected.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    charCount,
    boldPercent,
    emojiCount,
    renderedPost: rendered,
  };
}

export function validateSubject(subject: string): { ok: boolean; error?: string } {
  const trimmed = subject.trim();
  if (!trimmed) {
    return { ok: false, error: 'Please enter a subject.' };
  }
  const wordCount = trimmed.split(/\s+/).length;
  if (wordCount > 32) {
    return { ok: false, error: `Subject is ${wordCount} words; the limit is 32 words.` };
  }
  return { ok: true };
}
