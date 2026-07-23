import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai';
import {
  buildCvTailorSystemPrompt,
  buildCvTailorUserPrompt,
  buildCoverLetterSystemPrompt,
  buildCoverLetterUserPrompt,
  buildCvImprovePrompt,
} from '@/lib/ai/prompts/cv-prompt';
import { checkGrounding } from '@/lib/validation/grounding-check';
import { requireVerifiedUser, AuthError } from '@/lib/supabase/require-user';
import { checkQuota, recordUsage, QuotaError } from '@/lib/supabase/quota';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

function splitCvAndFlags(raw: string): { cv: string; flags: string[] } {
  const marker = '---FLAGS---';
  const idx = raw.indexOf(marker);
  if (idx === -1) return { cv: raw.trim(), flags: [] };
  const cv = raw.slice(0, idx).trim();
  const flagsText = raw.slice(idx + marker.length).trim();
  const flags = flagsText
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter((l) => l && !/no significant gaps/i.test(l));
  return { cv, flags };
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireVerifiedUser();

    const body = await req.json();
    const cvText: string = (body.cvText || '').toString();
    const jobDescription: string = (body.jobDescription || '').toString();
    const wantCv: boolean = !!body.wantCv;
    const wantCoverLetter: boolean = !!body.wantCoverLetter;
    const lengthMode: 'standard' | 'short' = body.lengthMode === 'short' ? 'short' : 'standard';
    const mode: 'generate' | 'improve' | 'concise' = body.mode || 'generate';
    const target: 'cv' | 'letter' | undefined = body.target;
    const currentText: string | undefined = body.currentText;

    if (!cvText.trim()) {
      return NextResponse.json({ error: 'CV text is required.' }, { status: 400 });
    }
    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      return NextResponse.json(
        { error: 'Please paste the job description (at least a few sentences).' },
        { status: 400 }
      );
    }
    if (!wantCv && !wantCoverLetter) {
      return NextResponse.json({ error: 'Select CV, cover letter, or both.' }, { status: 400 });
    }

    await checkQuota(user.id);
    const ai = getAIProvider();

    // Refinement mode for a single already-generated document.
    if (mode !== 'generate' && target && currentText) {
      const instruction =
        mode === 'improve' ? 'Improve the clarity and overall impact.' : 'Make it noticeably more concise.';
      const revised = await ai.generateText({
        system: target === 'cv' ? buildCvTailorSystemPrompt() : buildCoverLetterSystemPrompt(lengthMode),
        prompt: buildCvImprovePrompt(currentText, instruction, cvText),
        temperature: 0.5,
      });
      const clean = target === 'cv' ? splitCvAndFlags(revised).cv : revised.trim();
      await recordUsage(user.id);
      return NextResponse.json({ [target === 'cv' ? 'cv' : 'coverLetter']: clean });
    }

    const result: {
      cv?: string;
      coverLetter?: string;
      flags?: string[];
      groundingWarnings?: string[];
    } = {};

    if (wantCv) {
      const raw = await ai.generateText({
        system: buildCvTailorSystemPrompt(),
        prompt: buildCvTailorUserPrompt(cvText, jobDescription),
        temperature: 0.5,
      });
      const { cv, flags } = splitCvAndFlags(raw);
      result.cv = cv;
      result.flags = flags;

      const grounding = await checkGrounding(ai, cvText, cv);
      if (!grounding.grounded) {
        result.groundingWarnings = grounding.issues;
      }
    }

    if (wantCoverLetter) {
      const letter = await ai.generateText({
        system: buildCoverLetterSystemPrompt(lengthMode),
        prompt: buildCoverLetterUserPrompt(cvText, jobDescription),
        temperature: 0.6,
      });
      result.coverLetter = letter.trim();

      const grounding = await checkGrounding(ai, cvText, letter);
      if (!grounding.grounded) {
        result.groundingWarnings = [...(result.groundingWarnings || []), ...grounding.issues];
      }
    }

    await recordUsage(user.id);

    // Best-effort save to recent files.
    try {
      const supabase = createClient();
      if (result.cv) {
        await supabase.from('generated_items').insert({
          user_id: user.id,
          type: 'cv',
          title: 'Tailored CV',
          content: result.cv,
          metadata: { flags: result.flags || [] },
        });
      }
      if (result.coverLetter) {
        await supabase.from('generated_items').insert({
          user_id: user.id,
          type: 'cover_letter',
          title: 'Cover Letter',
          content: result.coverLetter,
          metadata: {},
        });
      }
    } catch {
      // Non-fatal.
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError || err instanceof QuotaError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('CV generate error:', err);
    return NextResponse.json(
      { error: 'Something went wrong generating your documents. Please try again.' },
      { status: 500 }
    );
  }
}
