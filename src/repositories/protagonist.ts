import { get as dbGet, execSQL as dbExecSQL } from '../services/db/core';
import type { Protagonist } from '../../types/protagonist';

function mapRowToProtagonist(row: any[]): Protagonist {
  return {
    id: row[0],
    base_attributes: JSON.parse(row[1] || '{}'),
    basic_description: JSON.parse(row[2] || '{}'),
  } as Protagonist;
}

function mapProtagonistToParams(p: Protagonist, includeId = false): any[] {
  const params: (string | number)[] = [
    JSON.stringify(p.base_attributes || {}),
    JSON.stringify(p.basic_description || {}),
  ];
  if (includeId) params.push(p.id);
  return params;
}

export async function getProtagonist(): Promise<Protagonist | null> {
  const row = await dbGet('SELECT * FROM protagonist WHERE id = 1');
  return row ? mapRowToProtagonist(row) : null;
}

export async function saveProtagonist(p: Protagonist): Promise<void> {
  const existing = await getProtagonist();
  if (existing && typeof existing.id === 'number') {
    const sql = `
      UPDATE protagonist SET base_attributes = ?, basic_description = ?
      WHERE id = ?;
    `;
    const params = mapProtagonistToParams(p, true);
    await dbExecSQL(sql, params);
  } else {
    const sql = `
      INSERT INTO protagonist (base_attributes, basic_description)
      VALUES (?, ?);
    `;
    const params = mapProtagonistToParams(p);
    await dbExecSQL(sql, params);
  }
}