import { all as dbAll, get as dbGet, execSQL as dbExecSQL } from '../core';

export async function up(): Promise<void> {
  // 1) 新建每角色独立的聊天设定表
  const create = `
    CREATE TABLE IF NOT EXISTS character_chat_settings (
      character_id INTEGER PRIMARY KEY,
      system_prompt TEXT NOT NULL DEFAULT '',
      streaming_enabled INTEGER NOT NULL DEFAULT 0,
      debug_mode INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );`;
  await dbExecSQL(create);

  // 2) 读取全局默认设置（若存在），否则使用硬编码默认
  const global = await dbGet('SELECT system_prompt, streaming_enabled, debug_mode, updated_at FROM chat_settings WHERE id = 1');
  const defaultSystemPrompt = (global?.[0]) || '你是一个细腻而真实的角色，请以第一人称、自然对话回复。';
  const defaultStreaming = (global?.[1]) ? 1 : 0;
  const defaultDebug = (global?.[2]) ? 1 : 0;

  // 3) 为现有角色回填一条设定记录（若不存在）
  const characterIds = await dbAll('SELECT id FROM characters', []);
  const now = new Date().toISOString();
  for (const row of characterIds as any[]) {
    const cid = row?.[0];
    if (typeof cid !== 'number') continue;
    const exists = await dbGet('SELECT COUNT(*) FROM character_chat_settings WHERE character_id = ?', [cid]);
    const count = Array.isArray(exists) ? (exists[0] ?? 0) : 0;
    if (count === 0) {
      await dbExecSQL(
        'INSERT INTO character_chat_settings (character_id, system_prompt, streaming_enabled, debug_mode, updated_at) VALUES (?, ?, ?, ?, ?)',
        [cid, defaultSystemPrompt, defaultStreaming, defaultDebug, now]
      );
    }
  }
}