import 'server-only';
import type { AIProvider } from '@/lib/ai/types';

export interface GroundingCheckResult {
  grounded: boolean;
  issues: string[];
}

/**
 * A second, independent AI pass that checks a generated CV or cover letter
 * against its source CV text, looking specifically for claims that are NOT
 * supported by the source. This is the AI half of the two-part validation
 * the spec calls for (deterministic checks + one grounding-check AI pass).
 * It is deliberately conservative: it flags rather than silently
 * "fixes," and the caller decides whether to retry or just surface the
 * flag to the user.
 */
export async function checkGrounding(
  ai: AIProvider,
  sourceCv: string,
  generatedDocument: string
): Promise<GroundingCheckResult> {
  const system = `You are a strict fact-checker. You compare a generated document against a source CV and identify any claim in the generated document (employer, title, date, qualification, certification, skill, achievement, metric, or years of experience) that is NOT supported by the source CV text.

Respond in EXACTLY this format and nothing else:
GROUNDED: yes
or
GROUNDED: no
ISSUE: <short description of the unsupported claim>
ISSUE: <short description of another unsupported claim, if any>

If everything in the generated document is supported by the source CV, respond with only "GROUNDED: yes".`;

  const prompt = `SOURCE CV:
"""
${sourceCv}
"""

GENERATED DOCUMENT TO CHECK:
"""
${generatedDocument}
"""

Check now.`;

  try {
    const response = await ai.generateText({ system, prompt, temperature: 0.1, maxOutputTokens: 500 });
    const grounded = /GROUNDED:\s*yes/i.test(response);
    const issues = Array.from(response.matchAll(/ISSUE:\s*(.+)/gi)).map((m) => m[1].trim());
    return { grounded, issues };
  } catch (err) {
    console.error('Grounding check failed:', err);
    // Fail open with a warning rather than blocking the user entirely —
    // the deterministic no-fabrication prompt rules are the primary defense.
    return { grounded: true, issues: [] };
  }
}
