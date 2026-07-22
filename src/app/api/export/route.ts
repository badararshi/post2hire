import { NextRequest, NextResponse } from 'next/server';
import { requireVerifiedUser, AuthError } from '@/lib/supabase/require-user';
import { buildCvDocx, buildCoverLetterDocx, buildPostTxt } from '@/lib/export/docx-builder';
import { buildCvPdf, buildCoverLetterPdf } from '@/lib/export/pdf-builder';
import { sanitizeFilename } from '@/lib/text/unicode';

export const runtime = 'nodejs';
export const maxDuration = 30;

type ExportKind = 'post-txt' | 'post-docx' | 'cv-docx' | 'cv-pdf' | 'letter-docx' | 'letter-pdf';

export async function POST(req: NextRequest) {
  try {
    await requireVerifiedUser();

    const body = await req.json();
    const kind: ExportKind = body.kind;
    const content: string = (body.content || '').toString();
    const name: string = (body.name || 'Candidate').toString();
    const role: string = (body.role || 'Role').toString();

    if (!content.trim()) {
      return NextResponse.json({ error: 'Nothing to export.' }, { status: 400 });
    }

    const safeName = sanitizeFilename(name) || 'Candidate';
    const safeRole = sanitizeFilename(role) || 'Role';

    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    switch (kind) {
      case 'post-txt':
        buffer = buildPostTxt(content);
        filename = 'LinkedIn_Post.txt';
        contentType = 'text/plain; charset=utf-8';
        break;
      case 'post-docx':
        buffer = await buildCvDocx('', content); // reuse simple paragraph renderer
        filename = 'LinkedIn_Post.docx';
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'cv-docx':
        buffer = await buildCvDocx(name, content);
        filename = `${safeName}_${safeRole}_CV.docx`;
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'cv-pdf':
        buffer = await buildCvPdf(name, content);
        filename = `${safeName}_${safeRole}_CV.pdf`;
        contentType = 'application/pdf';
        break;
      case 'letter-docx':
        buffer = await buildCoverLetterDocx(content);
        filename = `${safeName}_${safeRole}_Cover_Letter.docx`;
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case 'letter-pdf':
        buffer = await buildCoverLetterPdf(content);
        filename = `${safeName}_${safeRole}_Cover_Letter.pdf`;
        contentType = 'application/pdf';
        break;
      default:
        return NextResponse.json({ error: 'Unknown export type.' }, { status: 400 });
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Export error:', err);
    return NextResponse.json({ error: 'Could not generate the file. Please try again.' }, { status: 500 });
  }
}
