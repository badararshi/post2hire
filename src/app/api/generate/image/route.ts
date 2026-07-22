import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai';
import { buildImagePrompt } from '@/lib/ai/prompts/post-prompt';
import { requireVerifiedUser, AuthError } from '@/lib/supabase/require-user';
import { QuotaError } from '@/lib/supabase/quota';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Generates the optional LinkedIn post image. Not subject to the same
 * daily-generation quota as text (images are opt-in per post, already
 * gated behind the text generation call), but still requires a verified
 * signed-in user.
 */
export async function POST(req: NextRequest) {
  try {
    await requireVerifiedUser();

    const body = await req.json();
    const subject: string = (body.subject || '').toString().slice(0, 500);

    if (!subject.trim()) {
      return NextResponse.json({ error: 'Subject is required to generate an image.' }, { status: 400 });
    }

    const ai = getAIProvider();
    const prompt = buildImagePrompt(subject);
    const image = await ai.generateImage({ prompt });

    // AI-written alt text, kept short and descriptive for accessibility.
    let altText = `Professional illustration related to ${subject}`;
    try {
      altText = await ai.generateText({
        system:
          'Write a single concise, descriptive alt-text sentence (under 20 words) for an image, for screen-reader accessibility. Return only the sentence, no quotes, no preamble.',
        prompt: `The image is a minimalistic professional illustration for a LinkedIn post about: "${subject}".`,
        temperature: 0.4,
        maxOutputTokens: 100,
      });
    } catch {
      // Fallback alt text above is fine if this call fails.
    }

    return NextResponse.json({
      imageBase64: image.base64,
      mimeType: image.mimeType,
      altText: altText.trim(),
    });
  } catch (err) {
    if (err instanceof AuthError || err instanceof QuotaError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Image generation error:', err);
    return NextResponse.json(
      { error: 'Could not generate an image right now. You can still use the post without one.' },
      { status: 500 }
    );
  }
}
