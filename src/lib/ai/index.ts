import 'server-only';
import type { AIProvider } from './types';
import { GeminiProvider } from './gemini-provider';
import { AnthropicProvider } from './anthropic-provider';

let cachedProvider: AIProvider | null = null;

/**
 * Single entry point the rest of the app uses. Switches provider based on
 * AI_PROVIDER ("gemini" | "anthropic"). This is the only file that needs
 * to change if a new provider is ever added.
 */
export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

  if (providerName === 'anthropic') {
    cachedProvider = new AnthropicProvider();
  } else {
    cachedProvider = new GeminiProvider();
  }

  return cachedProvider;
}

export type { AIProvider, GenerateTextOptions, GenerateImageOptions, GenerateImageResult } from './types';
