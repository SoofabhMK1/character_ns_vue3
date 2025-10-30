import { execSQL as dbExecSQL } from '../core';

export async function up(): Promise<void> {
  try {
    await dbExecSQL('ALTER TABLE chat_settings ADD COLUMN debug_mode INTEGER NOT NULL DEFAULT 0;');
  } catch (_) {
    // 列已存在时忽略
  }
}