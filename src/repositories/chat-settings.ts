import { get as dbGet, execSQL as dbExecSQL } from '../services/db/core';

export type ChatSettings = { system_prompt: string; streaming_enabled: boolean; debug_mode: boolean; updated_at: string };

export async function getChatSettings(): Promise<ChatSettings> {
  const row = await dbGet('SELECT system_prompt, streaming_enabled, debug_mode, updated_at FROM chat_settings WHERE id = 1');
  if (!row) {
    const now = new Date().toISOString();
    await dbExecSQL('INSERT INTO chat_settings (id, system_prompt, streaming_enabled, debug_mode, updated_at) VALUES (1, ?, ?, ?, ?)', [
      '', 0, 0, now
    ]);
    return { system_prompt: '', streaming_enabled: false, debug_mode: false, updated_at: now };
  }
  return {
    system_prompt: row[0] || '',
    streaming_enabled: !!row[1],
    debug_mode: !!row[2],
    updated_at: row[3] || new Date().toISOString(),
  };
}

export async function saveChatSettings(systemPrompt: string, streamingEnabled: boolean, debugMode: boolean): Promise<void> {
  const now = new Date().toISOString();
  await dbExecSQL('UPDATE chat_settings SET system_prompt = ?, streaming_enabled = ?, debug_mode = ?, updated_at = ? WHERE id = 1', [
    systemPrompt || '',
    streamingEnabled ? 1 : 0,
    debugMode ? 1 : 0,
    now,
  ]);
}