export interface GenerateTextOptions {
  system: string;
  prompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  /** Overrides the default per-request timeout (ms). See fetch-with-timeout.ts. */
  timeoutMs?: number;
}

export interface GenerateImageOptions {
  prompt: string;
}

export interface GenerateImageResult {
  /** Raw image bytes, base64-encoded. */
  base64: string;
  mimeType: string;
}

export interface AIProvider {
  generateText(options: GenerateTextOptions): Promise<string>;
  generateImage(options: GenerateImageOptions): Promise<GenerateImageResult>;
}
