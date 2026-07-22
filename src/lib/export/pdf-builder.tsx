import 'server-only';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 48, fontSize: 11, fontFamily: 'Helvetica', color: '#1E2A5A' },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 16 },
  heading: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 6, color: '#1E2A5A' },
  paragraph: { fontSize: 11, marginBottom: 8, lineHeight: 1.5, textAlign: 'justify', color: '#22304f' },
  bullet: { fontSize: 11, marginBottom: 4, lineHeight: 1.4, color: '#22304f', paddingLeft: 12 },
});

/**
 * Mirrors the DOCX structure closely, as required by the spec: same
 * heading detection (ALL CAPS lines), same bullet detection ("- " prefix),
 * same body font choice family (Helvetica here — the closest built-in
 * PDF-safe match to Calibri's proportions).
 */
function CvPdfDocument({ name, bodyText }: { name: string; bodyText: string }) {
  const lines = bodyText.split('\n');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{name || 'Curriculum Vitae'}</Text>
        {lines.map((line, i) => {
          const trimmed = line.trim();
          if (!trimmed) return <View key={i} style={{ height: 6 }} />;
          const isHeading = /^[A-Z0-9 &/\-]+$/.test(trimmed) && trimmed.length > 2 && trimmed.length < 60;
          const isBullet = trimmed.startsWith('- ');

          if (isHeading) {
            return (
              <Text key={i} style={styles.heading}>
                {trimmed}
              </Text>
            );
          }
          if (isBullet) {
            return (
              <Text key={i} style={styles.bullet}>
                {'\u2022 ' + trimmed.replace(/^-\s*/, '')}
              </Text>
            );
          }
          return (
            <Text key={i} style={styles.paragraph}>
              {trimmed}
            </Text>
          );
        })}
      </Page>
    </Document>
  );
}

function CoverLetterPdfDocument({ bodyText }: { bodyText: string }) {
  const blocks = bodyText.split(/\n{2,}/);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {blocks.map((block, i) => (
          <Text key={i} style={styles.paragraph}>
            {block.trim()}
          </Text>
        ))}
      </Page>
    </Document>
  );
}

export async function buildCvPdf(name: string, bodyText: string): Promise<Buffer> {
  return renderToBuffer(<CvPdfDocument name={name} bodyText={bodyText} />);
}

export async function buildCoverLetterPdf(bodyText: string): Promise<Buffer> {
  return renderToBuffer(<CoverLetterPdfDocument bodyText={bodyText} />);
}
