import { all as dbAll, get as dbGet, execSQL as dbExecSQL } from '../services/db/core';
import CryptoJS from 'crypto-js';
import type { ApiSetting } from '../../types/api-setting';

const SECRET_KEY = 'ns-app-secret-key';

function encrypt(plain: string): string {
  try { return CryptoJS.AES.encrypt(plain || '', SECRET_KEY).toString(); }
  catch { return plain || ''; }
}

function decryptSafe(cipher: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher || '', SECRET_KEY);
    const text = bytes.toString(CryptoJS.enc.Utf8);
    return text || cipher || '';
  } catch {
    return cipher || '';
  }
}

function mapRowToApiSetting(row: any[]): ApiSetting {
  return {
    id: row[0],
    name: row[1],
    platform: row[2],
    base_url: row[3],
    api_key: decryptSafe(row[4]),
    model: row[5],
    created_at: row[6],
    updated_at: row[7],
    is_default: !!row[8],
  } as ApiSetting;
}

export async function getApiSettings(): Promise<ApiSetting[]> {
  const rows = await dbAll('SELECT * FROM api_settings');
  return rows.map(mapRowToApiSetting);
}

export async function getApiSettingById(id: number): Promise<ApiSetting | null> {
  const row = await dbGet('SELECT * FROM api_settings WHERE id = ?', [id]);
  return row ? mapRowToApiSetting(row) : null;
}

export async function insertApiSetting(setting: ApiSetting): Promise<void> {
  const now = new Date().toISOString();
  const sql = `
    INSERT INTO api_settings (name, platform, base_url, api_key, model, created_at, updated_at, is_default)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const params = [
    setting.name,
    setting.platform,
    setting.base_url,
    encrypt(setting.api_key),
    setting.model,
    setting.created_at || now,
    setting.updated_at || now,
    setting.is_default ? 1 : 0,
  ];
  await dbExecSQL(sql, params);
}

export async function updateApiSetting(setting: ApiSetting): Promise<void> {
  const now = new Date().toISOString();
  const sql = `
    UPDATE api_settings SET name = ?, platform = ?, base_url = ?, api_key = ?, model = ?, updated_at = ?, is_default = ?
    WHERE id = ?;
  `;
  const params = [
    setting.name,
    setting.platform,
    setting.base_url,
    encrypt(setting.api_key),
    setting.model,
    setting.updated_at || now,
    setting.is_default ? 1 : 0,
    setting.id,
  ];
  await dbExecSQL(sql, params);
}

export async function saveApiSetting(setting: ApiSetting): Promise<void> {
  if (typeof setting.id === 'number' && !isNaN(setting.id)) {
    const existing = await getApiSettingById(setting.id);
    if (existing) return updateApiSetting(setting);
  }
  return insertApiSetting(setting);
}

export async function deleteApiSetting(id: number): Promise<void> {
  await dbExecSQL('DELETE FROM api_settings WHERE id = ?;', [id]);
}

export async function setDefaultApiSetting(id: number): Promise<void> {
  await dbExecSQL('UPDATE api_settings SET is_default = 0;');
  await dbExecSQL('UPDATE api_settings SET is_default = 1 WHERE id = ?;', [id]);
}