import { knownFolders, File } from '@nativescript/core';
import { initDB, execSQL as dbExecSQL, get as dbGet } from './core';
import { runMigrations } from './migrations';
import type { Character } from '../../../types/character';
import type { Protagonist } from '../../../types/protagonist';

export async function initializeDatabase(): Promise<void> {
  // 打开数据库连接
  await initDB();
  // 执行迁移（建表与默认记录）
  await runMigrations();
  // 植入初始数据（仅当为空）
  await seedInitialCharacters();
  await seedProtagonistInitialData();
}

async function seedInitialCharacters(): Promise<void> {
  const countResult = await dbGet('SELECT COUNT(*) as count FROM characters');
  if (countResult && countResult[0] > 0) {
    return;
  }
  try {
    const path = knownFolders.currentApp().path + '/assets/db.json';
    const file = File.fromPath(path);
    const content = await file.readText();
    const data = JSON.parse(content);
    const charactersToSeed: Character[] = data.characters || [];
    for (const character of charactersToSeed) {
      const params = mapCharacterToParams(character, false);
      const sql = `
        INSERT INTO characters (
          first_name, last_name, age, occupation,
          core_identity, psychological_profile, physical_profile,
          sexual_profile, metrics, wellbeing, sexual_skill, body_development
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      await dbExecSQL(sql, params);
    }
  } catch (error) {
    console.error('从 db.json 植入数据失败:', error);
  }
}

async function seedProtagonistInitialData(): Promise<void> {
  const countResult = await dbGet('SELECT COUNT(*) as count FROM protagonist');
  if (countResult && countResult[0] > 0) {
    return;
  }
  const initialProtagonist: Protagonist = {
    id: 1,
    base_attributes: {
      level: 1,
      experience: 100,
      experience_to_next_level: 1000,
      attribute_points_available: 50,
      physique: 60,
      dexterity: 55,
      stamina: 65,
      intellect: 85,
      insight: 90,
      charisma: 75,
      oral_skill: 40,
      manual_skill: 50,
      endurance_control: 60,
      anatomy_knowledge: 70,
      rhythm_mastery: 45,
      virility_level: 60,
    },
    basic_description: {
      last_name: '储',
      first_name: '进',
      occupation: '医疗集团运营专员',
      is_married: false,
      has_children: false,
      physical_profile: {
        general: {
          body_type: '中等偏瘦',
          height_cm: 182,
        },
        sexual_anatomy: {
          penis: {
            girth_cm_erect: 13.5,
            is_circumcised: false,
            appearance_tags: ['标准型', '成熟色泽'],
            length_cm_erect: 17,
          },
        },
      },
      sexual_profile: {
        personal_kinks: {
          BDSM: { role: 'Dominant', active: true },
          age_play: { role: 'daddy', active: true },
          praise_kink: { active: true },
        },
        attraction_profile: {
          physical_types: ['娇小纤细', '萝莉'],
          personality_archetypes: ['清纯学妹', '元气笨蛋', '邻家女孩'],
        },
      },
    },
  };

  const sql = `INSERT INTO protagonist (base_attributes, basic_description) VALUES (?, ?);`;
  const params = [
    JSON.stringify(initialProtagonist.base_attributes),
    JSON.stringify(initialProtagonist.basic_description),
  ];
  await dbExecSQL(sql, params);
}

function mapCharacterToParams(character: Character, forUpdate = false): any[] {
  const params = [
    character.core_identity.first_name,
    character.core_identity.last_name,
    character.core_identity.age,
    character.core_identity.occupation,
    JSON.stringify(character.core_identity),
    JSON.stringify(character.psychological_profile),
    JSON.stringify(character.physical_profile),
    JSON.stringify(character.sexual_profile),
    JSON.stringify(character.metrics),
    JSON.stringify(character.wellbeing),
    JSON.stringify(character.sexual_skill),
    JSON.stringify(character.body_development),
  ];
  if (forUpdate) {
    params.push((character as any).id);
  }
  return params;
}