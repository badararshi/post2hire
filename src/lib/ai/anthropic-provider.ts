import 'server-only';
import type { AIProvider, GenerateImageOptions, GenerateImageResult, GenerateTextOptions } from './types';
import { GeminiProvider } from './gemini-provider';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Anthropic handles text generation. Anthropic's API does not do image
 * generation, so this provider delegates image requests to Gemini — the
 * spec allows this (image generation always uses GEMINI_API_KEY regardless
 * of AI_PROVIDER). If GEMINI_API_KEY is missing in this mode, the image
 * checkbox will surface a clear error rather than fail silently.
 */
export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private fallbackImageProvider: GeminiProvider | null = null;

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error(
        'ANTHROPIC_API_KEY is not set but AI_PROVIDER=anthropic. Add it to .env.local.'
      );
    }
    this.apiKey = key;
    this.model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
  }

  async generateText({
    system,
    prompt,
    temperature = 0.8,
    maxOutputTokens = 4096,
  }: GenerateTextOptions): Promise<string> {
    const res = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: maxOutputTokens,
        temperature,
        system,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic text generation failed (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const text = data?.content
      ?.filter((block: { type: string }) => block.type === 'text')
      ?.map((block: { text: string }) => block.text)
      ?.join('');

    if (!text) {
      throw new Error('Anthropic returned an empty response.');
    }

    return text.trim();
  }

  async generateImage(options: GenerateImageOptions): Promise<GenerateImageResult> {
    if (!this.fallbackImageProvider) {
      this.fallbackImageProvider = new GeminiProvider();
    }
    return this.fallbackImageProvider.generateImage(options);
  }
}
