import { all as dbAll, execSQL as dbExecSQL } from '../services/db/core';
import type { ChatRole } from '../../types/chat';

export type ChatMessageRow = {
  id: number;
  character_id: number;
  role: ChatRole;
  content: string;
  created_at: string;
};

const VALID_ROLES = new Set<string>(['user','assistant','system']);

export async function getChatMessages(characterId: number): Promise<ChatMessageRow[]> {
  const rows = await dbAll(
    'SELECT id, character_id, role, content, created_at FROM chat_messages WHERE character_id = ? ORDER BY id ASC',
    [characterId]
  );
  return rows.map((r: any[]) => ({
    id: r[0],
    character_id: r[1],
    role: (VALID_ROLES.has(r[2]) ? r[2] : 'assistant') as ChatRole,
    content: r[3],
    created_at: r[4],
  }));
}

export async function addChatMessage(characterId: number, role: ChatRole, content: string, createdAt?: string): Promise<void> {
  const sql = `INSERT INTO chat_messages (character_id, role, content, created_at) VALUES (?, ?, ?, ?);`;
  const ts = createdAt || new Date().toISOString();
  await dbExecSQL(sql, [characterId, role, content, ts]);
}

export async function updateChatMessage(id: number, content: string): Promise<void> {
  const sql = `UPDATE chat_messages SET content = ? WHERE id = ?;`;
  await dbExecSQL(sql, [content, id]);
}

export async function deleteChatMessage(id: number): Promise<void> {
  const sql = `DELETE FROM chat_messages WHERE id = ?;`;
  await dbExecSQL(sql, [id]);
}

export async function deleteAllChatMessagesForCharacter(characterId: number): Promise<void> {
  const sql = `DELETE FROM chat_messages WHERE character_id = ?;`;
  await dbExecSQL(sql, [characterId]);
}