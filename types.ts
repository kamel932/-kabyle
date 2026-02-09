
export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  role: MessageRole;
  text: string;
  image?: string;
  isProcessing?: boolean;
}

export interface TransformationParams {
  baseImage: string;
  prompt?: string;
}
