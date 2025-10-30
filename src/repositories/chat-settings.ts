import { get as dbGet, execSQL as dbExecSQL } from '../services/db/core';

export type ChatSettings = { system_prompt: string; streaming_enabled: boolean; debug_mode: boolean; updated_at: string };

export async function getChatSettings(characterId: number): Promise<ChatSettings> {
  // 优先读每角色设定
  const row = await dbGet('SELECT system_prompt, streaming_enabled, debug_mode, updated_at FROM character_chat_settings WHERE character_id = ?', [characterId]);
  if (row) {
    return {
      system_prompt: row[0] || '',
      streaming_enabled: !!row[1],
      debug_mode: !!row[2],
      updated_at: row[3] || new Date().toISOString(),
    };
  }
  // 若不存在则使用默认值生成一条
  const now = new Date().toISOString();
  const systemPrompt = '你是一个细腻而真实的角色，请以第一人称、自然对话回复。';
  const streamingEnabled = 0;
  const debugMode = 0;
  await dbExecSQL('INSERT INTO character_chat_settings (character_id, system_prompt, streaming_enabled, debug_mode, updated_at) VALUES (?, ?, ?, ?, ?)', [
    characterId,
    systemPrompt,
    streamingEnabled,
    debugMode,
    now,
  ]);
  return { system_prompt: systemPrompt, streaming_enabled: !!streamingEnabled, debug_mode: !!debugMode, updated_at: now };
}

export async function saveChatSettings(characterId: number, systemPrompt: string, streamingEnabled: boolean, debugMode: boolean): Promise<void> {
  const now = new Date().toISOString();
  await dbExecSQL('UPDATE character_chat_settings SET system_prompt = ?, streaming_enabled = ?, debug_mode = ?, updated_at = ? WHERE character_id = ?', [
    systemPrompt || '',
    streamingEnabled ? 1 : 0,
    debugMode ? 1 : 0,
    now,
    characterId,
  ]);
}