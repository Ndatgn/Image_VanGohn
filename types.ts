export enum ProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum StyleIntensity {
  LOW = 'Textured Impasto',
  MEDIUM = 'Vibrant Arles',
  HIGH = 'Starry Night Swirls'
}

export interface AppState {
  originalImage: string | null; // Base64
  processedImage: string | null; // Base64
  status: ProcessingStatus;
  intensity: StyleIntensity;
  errorMessage: string | null;
}