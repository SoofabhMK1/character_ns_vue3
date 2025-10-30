import { get as dbGet, execSQL as dbExecSQL } from '../services/db/core';

export type ChatSettings = { system_prompt: string; streaming_enabled: boolean; updated_at: string };

export async function getChatSettings(): Promise<ChatSettings> {
  const row = await dbGet('SELECT system_prompt, streaming_enabled, updated_at FROM chat_settings WHERE id = 1');
  if (!row) {
    const now = new Date().toISOString();
    await dbExecSQL('INSERT INTO chat_settings (id, system_prompt, streaming_enabled, updated_at) VALUES (1, ?, ?, ?)', [
      '', 0, now
    ]);
    return { system_prompt: '', streaming_enabled: false, updated_at: now };
  }
  return {
    system_prompt: row[0] || '',
    streaming_enabled: !!row[1],
    updated_at: row[2] || new Date().toISOString(),
  };
}

export async function saveChatSettings(systemPrompt: string, streamingEnabled: boolean): Promise<void> {
  const now = new Date().toISOString();
  await dbExecSQL('UPDATE chat_settings SET system_prompt = ?, streaming_enabled = ?, updated_at = ? WHERE id = 1', [
    systemPrompt || '',
    streamingEnabled ? 1 : 0,
    now,
  ]);
}