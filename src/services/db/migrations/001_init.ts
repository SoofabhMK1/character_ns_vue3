import { execSQL as dbExecSQL, get as dbGet } from '../core';

export async function up(): Promise<void> {
  // characters 表
  const createCharacters = `
    CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        age INTEGER NOT NULL,
        occupation TEXT,
        core_identity TEXT,
        psychological_profile TEXT,
        physical_profile TEXT,
        sexual_profile TEXT,
        metrics TEXT,
        wellbeing TEXT,
        sexual_skill TEXT,
        body_development TEXT
    );`;
  await dbExecSQL(createCharacters);

  // protagonist 表
  const createProtagonist = `
    CREATE TABLE IF NOT EXISTS protagonist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        base_attributes TEXT,
        basic_description TEXT
    );`;
  await dbExecSQL(createProtagonist);

  // api_settings 表
  const createApiSettings = `
    CREATE TABLE IF NOT EXISTS api_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        platform TEXT NOT NULL,
        base_url TEXT NOT NULL,
        api_key TEXT NOT NULL,
        model TEXT NOT NULL,
        created_at TEXT,
        updated_at TEXT
    );`;
  await dbExecSQL(createApiSettings);

  // 唯一索引与兼容列
  try {
    await dbExecSQL('CREATE UNIQUE INDEX IF NOT EXISTS idx_api_settings_name ON api_settings(name);');
  } catch (_) {
    // ignore
  }
  try {
    await dbExecSQL('ALTER TABLE api_settings ADD COLUMN is_default INTEGER DEFAULT 0;');
  } catch (_) {
    // 如果列已存在会报错，忽略即可
  }

  // chat_messages 表
  const createChatMessages = `
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        character_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
    );`;
  await dbExecSQL(createChatMessages);

  // chat_settings 表（全局设置，仅一条记录）
  const createChatSettings = `
    CREATE TABLE IF NOT EXISTS chat_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        system_prompt TEXT NOT NULL DEFAULT '',
        streaming_enabled INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
    );`;
  await dbExecSQL(createChatSettings);

  // chat_settings 默认记录
  const exists = await dbGet('SELECT COUNT(*) as count FROM chat_settings WHERE id = 1');
  if (!exists || exists[0] === 0) {
    const now = new Date().toISOString();
    await dbExecSQL('INSERT INTO chat_settings (id, system_prompt, streaming_enabled, updated_at) VALUES (1, ?, ?, ?)', [
      '你是一个细腻而真实的角色，请以第一人称、自然对话回复。',
      0,
      now,
    ]);
  }
}