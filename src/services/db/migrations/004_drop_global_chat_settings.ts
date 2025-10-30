import { execSQL as dbExecSQL } from '../core';

export async function up(): Promise<void> {
  try {
    await dbExecSQL('DROP TABLE IF EXISTS chat_settings');
  } catch (e) {
    console.warn('删除旧的 chat_settings 表失败（可忽略）:', e);
  }
}