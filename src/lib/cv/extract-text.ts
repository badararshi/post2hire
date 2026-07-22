import 'server-only';
import mammoth from 'mammoth';

export interface ExtractionResult {
  ok: boolean;
  text: string;
  error?: string;
}

/**
 * Extracts plain text from an uploaded DOCX buffer.
 */
export async function extractDocxText(buffer: Buffer): Promise<ExtractionResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    if (!text || text.length < 40) {
      return { ok: false, text: '', error: 'Could not find readable text in this DOCX file.' };
    }
    return { ok: true, text };
  } catch (err) {
    console.error('DOCX extraction error:', err);
    return { ok: false, text: '', error: 'This DOCX file could not be read. It may be corrupted.' };
  }
}

/**
 * Extracts plain text from an uploaded PDF buffer. Only works for
 * text-based PDFs (by design — the spec explicitly removes OCR from the
 * free stack). If the PDF is image-only/scanned, pdf-parse will return
 * little or no text, and we surface that honestly rather than guessing.
 */
export async function extractPdfText(buffer: Buffer): Promise<ExtractionResult> {
  try {
    // Lazy require to avoid pdf-parse's debug-mode file probe running at
    // module-eval time in some build environments.
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    const text = (result.text || '').trim();

    if (!text || text.length < 40) {
      return {
        ok: false,
        text: '',
        error:
          'This PDF appears to be a scanned image rather than text. Please upload a DOCX file or a text-based PDF (exported directly from Word or a similar app).',
      };
    }
    return { ok: true, text };
  } catch (err) {
    console.error('PDF extraction error:', err);
    return {
      ok: false,
      text: '',
      error: 'This PDF file could not be read. It may be corrupted or password-protected.',
    };
  }
}

export async function extractCvText(
  kind: 'docx' | 'pdf',
  buffer: Buffer
): Promise<ExtractionResult> {
  return kind === 'docx' ? extractDocxText(buffer) : extractPdfText(buffer);
}
