import 'server-only';

export interface FileValidationResult {
  ok: boolean;
  error?: string;
  kind?: 'docx' | 'pdf';
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB, per spec

// Magic bytes:
// DOCX (and other OOXML/ZIP formats) start with the ZIP local file header: 50 4B 03 04
const DOCX_MAGIC = [0x50, 0x4b, 0x03, 0x04];
// PDF files start with the ASCII bytes "%PDF"
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46];

function bytesMatch(buffer: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, i) => buffer[i] === byte);
}

/**
 * Validates an uploaded CV file at three independent layers, per the
 * locked decision to replace antivirus scanning with strict structural
 * validation: (1) declared file extension, (2) declared MIME type, and
 * (3) actual magic bytes read from the file content. A file must pass all
 * three to be accepted — this catches a renamed .exe far more reliably
 * than extension-checking alone, without needing a scanning service.
 */
export function validateUploadedFile(
  filename: string,
  mimeType: string,
  buffer: Uint8Array,
  sizeBytes: number
): FileValidationResult {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: 'File is larger than the 5 MB limit.' };
  }
  if (sizeBytes === 0) {
    return { ok: false, error: 'File appears to be empty.' };
  }

  const lowerName = filename.toLowerCase();
  const isDocxExt = lowerName.endsWith('.docx');
  const isPdfExt = lowerName.endsWith('.pdf');

  if (!isDocxExt && !isPdfExt) {
    return { ok: false, error: 'Only DOCX and PDF files are accepted.' };
  }

  const docxMimes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const pdfMimes = ['application/pdf'];

  if (isDocxExt) {
    if (!docxMimes.includes(mimeType) && mimeType !== 'application/octet-stream') {
      return { ok: false, error: 'File extension is .docx but the file type does not match.' };
    }
    if (!bytesMatch(buffer, DOCX_MAGIC)) {
      return { ok: false, error: 'File does not appear to be a genuine DOCX file.' };
    }
    return { ok: true, kind: 'docx' };
  }

  if (isPdfExt) {
    if (!pdfMimes.includes(mimeType) && mimeType !== 'application/octet-stream') {
      return { ok: false, error: 'File extension is .pdf but the file type does not match.' };
    }
    if (!bytesMatch(buffer, PDF_MAGIC)) {
      return { ok: false, error: 'File does not appear to be a genuine PDF file.' };
    }
    return { ok: true, kind: 'pdf' };
  }

  return { ok: false, error: 'Unsupported file.' };
}
