import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai';
import {
  buildPostSystemPrompt,
  buildPostUserPrompt,
  buildImprovePrompt,
} from '@/lib/ai/prompts/post-prompt';
import { validateAndRenderPost, validateSubject } from '@/lib/validation/post-validator';
import { requireVerifiedUser, AuthError } from '@/lib/supabase/require-user';
import { checkAndIncrementQuota, QuotaError } from '@/lib/supabase/quota';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser();

    const body = await req.json();
    const subject: string = (body.subject || '').toString().slice(0, 500);
    const mode: 'generate' | 'regenerate' | 'improve' | 'shorten' = body.mode || 'generate';
    const currentPost: string | undefined = body.currentPost;

    const subjectCheck = validateSubject(subject);
    if (!subjectCheck.ok) {
      return NextResponse.json({ error: subjectCheck.error }, { status: 400 });
    }

    await checkAndIncrementQuota(user.id);

    const ai = getAIProvider();
    const system = buildPostSystemPrompt();

    let prompt: string;
    if (mode === 'improve' && currentPost) {
      prompt = buildImprovePrompt(currentPost, 'Improve the clarity, flow, and impact of this post while keeping the same core message and structure.');
    } else if (mode === 'shorten' && currentPost) {
      prompt = buildImprovePrompt(currentPost, 'Make this post noticeably shorter and punchier while keeping the hook, the core solution, and the engagement question.');
    } else {
      prompt = buildPostUserPrompt(subject);
    }

    let raw = await ai.generateText({ system, prompt, temperature: 0.85 });
    let result = validateAndRenderPost(raw);

    // One corrective retry if hard validation fails (length or bold %).
    if (!result.ok) {
      const correctionPrompt = `${prompt}\n\nIMPORTANT CORRECTION NEEDED: Your previous attempt failed these checks: ${result.errors.join(
        ' '
      )} Regenerate the full post, fixing this. Stay well under 3000 characters and keep bold phrases to a small handful under the 20% limit.`;
      raw = await ai.generateText({ system, prompt: correctionPrompt, temperature: 0.7 });
      result = validateAndRenderPost(raw);
    }

    // Last-resort hard enforcement: if still over the character limit, trim
    // at the last sentence boundary before the limit rather than fail the user.
    if (!result.ok && result.charCount > 3000) {
      const chars = Array.from(result.renderedPost);
      const trimmedChars = chars.slice(0, 2950);
      let trimmed = trimmedChars.join('');
      const lastBreak = Math.max(trimmed.lastIndexOf('\n\n'), trimmed.lastIndexOf('. '));
      if (lastBreak > 1500) {
        trimmed = trimmed.slice(0, lastBreak + 1);
      }
      result = validateAndRenderPost(trimmed);
    }

    // Save to recent files (best-effort; do not fail the request if this errors).
    try {
      const supabase = createClient();
      await supabase.from('generated_items').insert({
        user_id: user.id,
        type: 'linkedin_post',
        title: subject.slice(0, 120),
        content: result.renderedPost,
        metadata: {
          charCount: result.charCount,
          boldPercent: result.boldPercent,
          emojiCount: result.emojiCount,
        },
      });
    } catch {
      // Non-fatal — the user still gets their post.
    }

    return NextResponse.json({
      post: result.renderedPost,
      charCount: result.charCount,
      boldPercent: result.boldPercent,
      emojiCount: result.emojiCount,
      warnings: result.warnings,
      maxChars: 3000,
    });
  } catch (err) {
    if (err instanceof AuthError || err instanceof QuotaError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Post generation error:', err);
    return NextResponse.json(
      { error: 'Something went wrong generating your post. Please try again.' },
      { status: 500 }
    );
  }
}
