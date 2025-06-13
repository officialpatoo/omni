export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  imageUrl?: string; // For user-uploaded images or camera captures
  isLoading?: boolean;
  error?: string;
  timestamp: Date;
}
