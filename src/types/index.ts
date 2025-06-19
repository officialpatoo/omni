
export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  imageUrl?: string;
  isLoading?: boolean;
  error?: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserProfile extends Partial<User> {
  bio?: string;
}

export interface AppSettings {
  aiModel?: string;
  theme?: 'light' | 'dark' | 'system';
  notificationsEnabled?: boolean;
}

// Represents the input to the content generation flow
export interface GenerateContentInput {
  query: string;
}

// Represents each chunk of content yielded by the streaming flow
export type GenerateContentOutput = string;
