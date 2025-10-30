import { all as dbAll, get as dbGet, execSQL as dbExecSQL } from '../services/db/core';
import type { Character } from '../../types/character';

function mapRowToCharacter(row: any[]): Character {
  return {
    id: row[0],
    core_identity: JSON.parse(row[5] || '{}'),
    psychological_profile: JSON.parse(row[6] || '{}'),
    physical_profile: JSON.parse(row[7] || '{}'),
    sexual_profile: JSON.parse(row[8] || '{}'),
    metrics: JSON.parse(row[9] || '{}'),
    wellbeing: JSON.parse(row[10] || '{}'),
    sexual_skill: JSON.parse(row[11] || '{}'),
    body_development: JSON.parse(row[12] || '{}'),
  } as Character;
}

function mapCharacterToParams(character: Character, includeId = false): any[] {
  const params = [
    character.core_identity.first_name,
    character.core_identity.last_name,
    character.core_identity.age,
    character.core_identity.occupation,
    JSON.stringify(character.core_identity || {}),
    JSON.stringify(character.psychological_profile || {}),
    JSON.stringify(character.physical_profile || {}),
    JSON.stringify(character.sexual_profile || {}),
    JSON.stringify(character.metrics || {}),
    JSON.stringify(character.wellbeing || {}),
    JSON.stringify(character.sexual_skill || {}),
    JSON.stringify(character.body_development || {}),
  ];
  if (includeId) params.push(character.id);
  return params;
}

export async function getCharacters(): Promise<Character[]> {
  const rows = await dbAll('SELECT * FROM characters');
  return rows.map(mapRowToCharacter);
}

export async function getCharacterById(id: number): Promise<Character | null> {
  const row = await dbGet('SELECT * FROM characters WHERE id = ?', [id]);
  return row ? mapRowToCharacter(row) : null;
}

export async function insertCharacter(character: Character): Promise<void> {
  const sql = `
    INSERT INTO characters (first_name, last_name, age, occupation, core_identity, psychological_profile, physical_profile, sexual_profile, metrics, wellbeing, sexual_skill, body_development)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;
  const params = mapCharacterToParams(character);
  await dbExecSQL(sql, params);
}

export async function updateCharacter(character: Character): Promise<void> {
  const sql = `
    UPDATE characters SET first_name = ?, last_name = ?, age = ?, occupation = ?, core_identity = ?, psychological_profile = ?, physical_profile = ?, sexual_profile = ?, metrics = ?, wellbeing = ?, sexual_skill = ?, body_development = ?
    WHERE id = ?;
  `;
  const params = mapCharacterToParams(character, true);
  await dbExecSQL(sql, params);
}

export async function saveCharacter(character: Character): Promise<void> {
  if (typeof character.id === 'number' && !isNaN(character.id)) {
    const exists = await getCharacterById(character.id);
    if (exists) return updateCharacter(character);
  }
  return insertCharacter(character);
}

export async function deleteCharacter(id: number): Promise<void> {
  await dbExecSQL('DELETE FROM characters WHERE id = ?;', [id]);
}