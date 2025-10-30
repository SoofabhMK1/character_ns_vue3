export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: number;
  character_id: number;
  role: ChatRole;
  content: string;
  created_at: string;
};

export type ChatMessagePayload = { role: ChatRole; content: string };