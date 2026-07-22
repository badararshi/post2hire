import 'server-only';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';

/**
 * Turns plain structured text (ALL CAPS section headings on their own
 * line, "- " bullets) into a clean, ATS-safe DOCX. Deliberately avoids
 * tables, columns, headers/footers, and text boxes per the spec's ATS
 * compatibility requirement.
 */
export function buildCvDocx(name: string, bodyText: string): Promise<Buffer> {
  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: name || 'Curriculum Vitae',
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  const lines = bodyText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ text: '' }));
      continue;
    }
    const isHeading = /^[A-Z0-9 &/\-]+$/.test(trimmed) && trimmed.length > 2 && trimmed.length < 60;
    const isBullet = trimmed.startsWith('- ');

    if (isHeading) {
      paragraphs.push(
        new Paragraph({
          text: trimmed,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (isBullet) {
      paragraphs.push(
        new Paragraph({
          text: trimmed.replace(/^-\s*/, ''),
          bullet: { level: 0 },
          spacing: { after: 60 },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          children: [new TextRun(trimmed)],
          spacing: { after: 100 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

/**
 * Cover letters are plain prose paragraphs — simpler structure than the CV.
 */
export function buildCoverLetterDocx(bodyText: string): Promise<Buffer> {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map(
      (block) =>
        new Paragraph({
          children: [new TextRun(block.trim())],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        })
    );

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1000, right: 1000 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return Packer.toBuffer(doc);
}

/**
 * Plain .txt download for the LinkedIn post (Unicode bold characters are
 * preserved as-is since they're just regular Unicode code points).
 */
export function buildPostTxt(post: string): Buffer {
  return Buffer.from(post, 'utf-8');
}
