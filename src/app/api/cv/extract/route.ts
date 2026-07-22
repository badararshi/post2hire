import { NextRequest, NextResponse } from 'next/server';
import { validateUploadedFile } from '@/lib/validation/file-validator';
import { extractCvText } from '@/lib/cv/extract-text';
import { requireVerifiedUser, AuthError } from '@/lib/supabase/require-user';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    await requireVerifiedUser();

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const bytes = new Uint8Array(buffer);

    const validation = validateUploadedFile(file.name, file.type, bytes, file.size);
    if (!validation.ok || !validation.kind) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const extraction = await extractCvText(validation.kind, buffer);
    if (!extraction.ok) {
      return NextResponse.json({ error: extraction.error }, { status: 422 });
    }

    return NextResponse.json({ text: extraction.text, filename: file.name });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('CV extract error:', err);
    return NextResponse.json(
      { error: 'Could not process this file. Please try again.' },
      { status: 500 }
    );
  }
}
