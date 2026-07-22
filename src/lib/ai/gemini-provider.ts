import 'server-only';
import type {
  AIProvider,
  GenerateImageOptions,
  GenerateImageResult,
  GenerateTextOptions,
} from './types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private textModel: string;
  private imageModel: string;

  constructor() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error(
        'GEMINI_API_KEY is not set. Add it to .env.local (see .env.example).'
      );
    }
    this.apiKey = key;
    this.textModel = process.env.GEMINI_TEXT_MODEL || 'gemini-2.5-flash';
    this.imageModel = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
  }

  async generateText({
    system,
    prompt,
    temperature = 0.8,
    maxOutputTokens = 4096,
  }: GenerateTextOptions): Promise<string> {
    const url = `${GEMINI_BASE}/${this.textModel}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { role: 'system', parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature, maxOutputTokens },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini text generation failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || '')
      .join('');

    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    return text.trim();
  }

  async generateImage({ prompt }: GenerateImageOptions): Promise<GenerateImageResult> {
    const url = `${GEMINI_BASE}/${this.imageModel}:generateContent?key=${this.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ['IMAGE'] },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini image generation failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find(
      (p: { inlineData?: { data: string; mimeType: string } }) => p.inlineData
    );

    if (!imagePart?.inlineData) {
      throw new Error('Gemini did not return image data.');
    }

    return {
      base64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || 'image/png',
    };
  }
}
