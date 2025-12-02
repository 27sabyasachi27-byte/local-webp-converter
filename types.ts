
export interface ProcessedImage {
  id: string;
  originalFile: File;
  status: 'idle' | 'pending' | 'converting' | 'completed' | 'error';
  webpBlob?: Blob;
  webpUrl?: string;
  originalSize: number;
  newSize?: number;
  error?: string;
  progress?: number;
  delayDuration?: number;
  targetQuality?: number;
}

export interface ConversionSettings {
  quality: number;
}