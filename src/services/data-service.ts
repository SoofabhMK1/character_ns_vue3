import { knownFolders, File } from '@nativescript/core';
// 聊天角色联合类型（模块级别定义，供数据服务使用）
const VALID_CHAT_ROLES = ['user','assistant','system'] as const;
export type ChatRole = typeof VALID_CHAT_ROLES[number];
import CryptoJS from 'crypto-js';
import { Character } from '../../types/character'; // 引入我们之前定义的模型
import type { Protagonist } from '../../types/protagonist';
import type { ApiSetting } from '../../types/api-setting';
const Sqlite = require('nativescript-sqlite'); // 引入 sqlite 插件

/**
 * 这是一个数据服务类，采用单例模式。
 * 这意味着在整个应用中，我们只会创建这一个类的实例，
 * 从而保证我们始终通过同一个连接操作数据库。
 */
class DatabaseService {
  private static instance: DatabaseService;
  private database: any; // 用于存储数据库连接实例
  private initPromise: Promise<void> | null = null; // 防止并发初始化导致重复日志
  private static readonly SECRET_KEY = 'ns-app-secret-key';

  // 构造函数设为私有，防止外部通过 new() 创建新实例
  private constructor() {}

  // 获取单例实例的静态方法
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * 初始化数据库。
   * 这个方法会打开数据库连接，创建表（如果不存在），并从 db.json 植入初始数据。
   */
  public async init(): Promise<void> {
    // 已初始化直接返回
    if (this.database) return;

    // 并发调用时复用同一个初始化 Promise，避免重复日志与建表
    if (this.initPromise) {
      await this.initPromise;
      return;
    }

    this.initPromise = (async () => {
      try {
        // 打开（或创建）数据库
        this.database = await new Sqlite('app.db');
        console.log('数据库连接已打开');

        // 建 characters 表
        const createTableSql = `
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
        await this.database.execSQL(createTableSql);
        console.log('\'characters\' 表已准备就绪');

        // 建 protagonist 表
        const createProtagonistSql = `
          CREATE TABLE IF NOT EXISTS protagonist (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              base_attributes TEXT,
              basic_description TEXT
          );`;
        await this.database.execSQL(createProtagonistSql);
        console.log('\'protagonist\' 表已准备就绪');

        // 建 api_settings 表
        const createApiSettingsSql = `
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
        await this.database.execSQL(createApiSettingsSql);
        console.log('\'api_settings\' 表已准备就绪');

        // 确保唯一索引（名称唯一），若已存在则忽略错误
        try {
          await this.database.execSQL(`CREATE UNIQUE INDEX IF NOT EXISTS idx_api_settings_name ON api_settings(name);`);
          console.log('为 api_settings.name 创建唯一索引');
        } catch (e) {
          console.warn('创建唯一索引失败（可能已存在）:', e);
        }

        // 兼容升级：添加 is_default 列（如已存在则忽略错误）
        try {
          await this.database.execSQL(`ALTER TABLE api_settings ADD COLUMN is_default INTEGER DEFAULT 0;`);
          console.log('为 api_settings 添加 is_default 列');
        } catch (e) {
          // 如果列已存在会报错，忽略即可
        }

        // 建 chat_messages 表
        const createChatSql = `
          CREATE TABLE IF NOT EXISTS chat_messages (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              character_id INTEGER NOT NULL,
              role TEXT NOT NULL,
              content TEXT NOT NULL,
              created_at TEXT NOT NULL
          );`;
        await this.database.execSQL(createChatSql);
        console.log('\'chat_messages\' 表已准备就绪');

        // 建 chat_settings 表（全局设置，仅一条记录）
        const createChatSettingsSql = `
          CREATE TABLE IF NOT EXISTS chat_settings (
              id INTEGER PRIMARY KEY CHECK (id = 1),
              system_prompt TEXT NOT NULL DEFAULT '',
              streaming_enabled INTEGER NOT NULL DEFAULT 0,
              updated_at TEXT NOT NULL
          );`;
        await this.database.execSQL(createChatSettingsSql);
        // 若不存在记录则插入默认值
        const exists = await this.database.get('SELECT COUNT(*) as count FROM chat_settings WHERE id = 1');
        if (!exists || exists[0] === 0) {
          const now = new Date().toISOString();
          await this.database.execSQL('INSERT INTO chat_settings (id, system_prompt, streaming_enabled, updated_at) VALUES (1, ?, ?, ?)', [
            '你是一个细腻而真实的角色，请以第一人称、自然对话回复。',
            0,
            now,
          ]);
        }
        console.log('\'chat_settings\' 表已准备就绪');

        // 植入初始数据（仅当为空）
        await this.seedInitialData();
        await this.seedProtagonistInitialData();
      } catch (error) {
        console.error('数据库初始化失败:', error);
        throw error;
      } finally {
        // 初始化完成后清理 Promise 引用
        this.initPromise = null;
      }
    })();

    await this.initPromise;
  }

  /**
   * 植入初始数据 (仅当数据库为空时)
   */
  private async seedInitialData(): Promise<void> {
    const countResult = await this.database.get('SELECT COUNT(*) as count FROM characters');
    if (countResult && countResult[0] > 0) {
        console.log('数据库已有数据，跳过植入。');
        return;
    }

    console.log('数据库为空，开始从 db.json 植入初始数据...');
    try {
        const path = knownFolders.currentApp().path + '/assets/db.json';
        const file = File.fromPath(path);
        const content = await file.readText();
        const data = JSON.parse(content);
        const charactersToSeed: Character[] = data.characters;
        
        for (const character of charactersToSeed) {
            await this.insertCharacter(character);
        }
        console.log(`成功植入 ${charactersToSeed.length} 条人物数据。`);
    } catch(error) {
        console.error('从 db.json 植入数据失败:', error);
    }
  }

  /**
   * 植入主角的初始数据 (仅当数据库为空时)
   */
  private async seedProtagonistInitialData(): Promise<void> {
    const countResult = await this.database.get('SELECT COUNT(*) as count FROM protagonist');
    if (countResult && countResult[0] > 0) {
      console.log('主角表已有数据，跳过植入。');
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

    await this.insertProtagonist(initialProtagonist);
    console.log('已植入主角初始数据。');
  }
  
  // --- CRUD 方法 ---

  /**
   * 获取所有人物
   * @returns {Promise<Character[]>}
   */
  public async getCharacters(): Promise<Character[]> {
    const rows = await this.database.all('SELECT * FROM characters');
    // 将数据库行映射回我们定义的 Character 对象
    return rows.map((row: any[]) => this.mapRowToCharacter(row));
  }
  
  /**
   * 根据 ID 获取单个人物
   * @param {number} id
   * @returns {Promise<Character | null>}
   */
  public async getCharacterById(id: number): Promise<Character | null> {
    const row = await this.database.get('SELECT * FROM characters WHERE id = ?', [id]);
    return row ? this.mapRowToCharacter(row) : null;
  }

  /**
   * 保存一个人物（可以是新增或更新）
   * @param {Character} character
   * @returns {Promise<void>}
   */
  public async saveCharacter(character: Character): Promise<void> {
      // 如果未提供有效 id，则直接插入（让数据库自增）
      if (typeof character.id !== 'number' || isNaN(character.id)) {
          await this.insertCharacter(character);
          return;
      }
      const existing = await this.getCharacterById(character.id);
      if (existing) {
          await this.updateCharacter(character);
      } else {
          await this.insertCharacter(character);
      }
  }

  /**
   * 删除一个人物
   * @param {number} id
   * @returns {Promise<void>}
   */
  public async deleteCharacter(id: number): Promise<void> {
      await this.database.execSQL('DELETE FROM characters WHERE id = ?', [id]);
  }

  /**
   * 获取主角信息（目前仅一条记录，id=1）
   */
  public async getProtagonist(): Promise<Protagonist | null> {
    const row = await this.database.get('SELECT * FROM protagonist WHERE id = 1');
    return row ? this.mapRowToProtagonist(row) : null;
  }

  /**
   * 保存主角信息（更新基础属性与基础描述）
   */
  public async saveProtagonist(p: Protagonist): Promise<void> {
    const existing = await this.database.get('SELECT id FROM protagonist WHERE id = ?', [p.id]);
    if (existing) {
      await this.updateProtagonist(p);
    } else {
      await this.insertProtagonist(p);
    }
  }

  // ===== API Settings CRUD =====
  public async getApiSettings(): Promise<ApiSetting[]> {
    const rows = await this.database.all('SELECT * FROM api_settings');
    return rows.map((row: any[]) => this.mapRowToApiSetting(row));
  }

  public async getApiSettingById(id: number): Promise<ApiSetting | null> {
    const row = await this.database.get('SELECT * FROM api_settings WHERE id = ?', [id]);
    if (!row) return null;
    return this.mapRowToApiSetting(row);
  }

  public async saveApiSetting(setting: ApiSetting): Promise<void> {
    if (typeof setting.id !== 'number' || isNaN(setting.id)) {
      await this.insertApiSetting(setting);
      return;
    }
    const existing = await this.getApiSettingById(setting.id);
    if (existing) {
      await this.updateApiSetting(setting);
    } else {
      await this.insertApiSetting(setting);
    }
  }

  public async insertApiSetting(setting: ApiSetting): Promise<void> {
    const now = new Date().toISOString();
    const sql = `
      INSERT INTO api_settings (name, platform, base_url, api_key, model, created_at, updated_at, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const params = [
      setting.name,
      setting.platform,
      setting.base_url,
      this.encrypt(setting.api_key),
      setting.model,
      setting.created_at || now,
      setting.updated_at || now,
      setting.is_default ? 1 : 0,
    ];
    await this.database.execSQL(sql, params);
  }

  public async updateApiSetting(setting: ApiSetting): Promise<void> {
    const now = new Date().toISOString();
    const sql = `
      UPDATE api_settings SET name = ?, platform = ?, base_url = ?, api_key = ?, model = ?, updated_at = ?, is_default = ?
      WHERE id = ?;
    `;
    const params = [
      setting.name,
      setting.platform,
      setting.base_url,
      this.encrypt(setting.api_key),
      setting.model,
      setting.updated_at || now,
      setting.is_default ? 1 : 0,
      setting.id,
    ];
    await this.database.execSQL(sql, params);
  }

  public async deleteApiSetting(id: number): Promise<void> {
    const sql = `DELETE FROM api_settings WHERE id = ?;`;
    await this.database.execSQL(sql, [id]);
  }

  public async setDefaultApiSetting(id: number): Promise<void> {
    await this.database.execSQL(`UPDATE api_settings SET is_default = 0;`);
    await this.database.execSQL(`UPDATE api_settings SET is_default = 1 WHERE id = ?;`, [id]);
  }

  // ===== Chat Messages =====
  public async getChatMessages(characterId: number): Promise<{ id: number; character_id: number; role: ChatRole; content: string; created_at: string }[]> {
    // 确保数据库已初始化，防止未就绪导致 this.database 为 undefined
    await this.init();
    const rows = await this.database.all('SELECT id, character_id, role, content, created_at FROM chat_messages WHERE character_id = ? ORDER BY id ASC', [characterId]);
    const valid = new Set(VALID_CHAT_ROLES as readonly string[]);
    return rows.map((r: any[]) => ({
      id: r[0],
      character_id: r[1],
      role: (valid.has(r[2]) ? r[2] : 'assistant') as ChatRole,
      content: r[3],
      created_at: r[4]
    }));
  }

  public async addChatMessage(characterId: number, role: ChatRole, content: string, createdAt?: string): Promise<void> {
    await this.init();
    const sql = `INSERT INTO chat_messages (character_id, role, content, created_at) VALUES (?, ?, ?, ?);`;
    const ts = createdAt || new Date().toISOString();
    await this.database.execSQL(sql, [characterId, role, content, ts]);
  }

  public async updateChatMessage(id: number, content: string): Promise<void> {
    await this.init();
    const sql = `UPDATE chat_messages SET content = ? WHERE id = ?;`;
    await this.database.execSQL(sql, [content, id]);
  }

  public async deleteChatMessage(id: number): Promise<void> {
    await this.init();
    const sql = `DELETE FROM chat_messages WHERE id = ?;`;
    await this.database.execSQL(sql, [id]);
  }

  public async deleteAllChatMessagesForCharacter(characterId: number): Promise<void> {
    await this.init();
    const sql = `DELETE FROM chat_messages WHERE character_id = ?;`;
    await this.database.execSQL(sql, [characterId]);
  }

  // ===== Chat Settings (Global) =====
  public async getChatSettings(): Promise<{ system_prompt: string; streaming_enabled: boolean; updated_at: string }> {
    await this.init();
    const row = await this.database.get('SELECT system_prompt, streaming_enabled, updated_at FROM chat_settings WHERE id = 1');
    if (!row) {
      const now = new Date().toISOString();
      await this.database.execSQL('INSERT INTO chat_settings (id, system_prompt, streaming_enabled, updated_at) VALUES (1, ?, ?, ?)', [
        '', 0, now
      ]);
      return { system_prompt: '', streaming_enabled: false, updated_at: now };
    }
    return {
      system_prompt: row[0] || '',
      streaming_enabled: !!row[1],
      updated_at: row[2] || new Date().toISOString(),
    };
  }

  public async saveChatSettings(systemPrompt: string, streamingEnabled: boolean): Promise<void> {
    await this.init();
    const now = new Date().toISOString();
    await this.database.execSQL('UPDATE chat_settings SET system_prompt = ?, streaming_enabled = ?, updated_at = ? WHERE id = 1', [
      systemPrompt || '',
      streamingEnabled ? 1 : 0,
      now,
    ]);
  }


  // --- 私有辅助方法 ---

  private async insertCharacter(character: Character): Promise<void> {
      const sql = `
          INSERT INTO characters (first_name, last_name, age, occupation, core_identity, psychological_profile, physical_profile, sexual_profile, metrics, wellbeing, sexual_skill, body_development) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const params = this.mapCharacterToParams(character, false);
      await this.database.execSQL(sql, params);
  }

  private async updateCharacter(character: Character): Promise<void> {
      const sql = `
          UPDATE characters SET first_name = ?, last_name = ?, age = ?, occupation = ?, core_identity = ?, psychological_profile = ?, physical_profile = ?, sexual_profile = ?, metrics = ?, wellbeing = ?, sexual_skill = ?, body_development = ?
          WHERE id = ?;
      `;
      // 注意：UPDATE 语句的参数顺序不同，id 在最后
      const params = this.mapCharacterToParams(character, true);
      await this.database.execSQL(sql, params);
  }

  private async insertProtagonist(p: Protagonist): Promise<void> {
    const sql = `
      INSERT INTO protagonist (base_attributes, basic_description)
      VALUES (?, ?);
    `;
    const params = this.mapProtagonistToParams(p, false);
    await this.database.execSQL(sql, params);
  }

  private async updateProtagonist(p: Protagonist): Promise<void> {
    const sql = `
      UPDATE protagonist SET base_attributes = ?, basic_description = ?
      WHERE id = ?;
    `;
    const params = this.mapProtagonistToParams(p, true);
    await this.database.execSQL(sql, params);
  }
  
  /**
   * 辅助函数：将数据库的一行数据（包含 JSON 字符串）转换成一个完整的 Character 对象
   * @param row - 数据库查询结果的一行
   */
  private mapRowToCharacter(row: any[]): Character {
    // 数据库返回的 row 是一个数组，顺序与 CREATE TABLE 中的列顺序一致
    return {
      id: row[0],
      // 核心字段直接赋值
      // first_name: row[1],
      // last_name: row[2],
      // age: row[3],
      // occupation: row[4],
      // 将存储为 TEXT 的 JSON 字符串解析回对象
      core_identity: JSON.parse(row[5]),
      psychological_profile: JSON.parse(row[6]),
      physical_profile: JSON.parse(row[7]),
      sexual_profile: JSON.parse(row[8]),
      metrics: JSON.parse(row[9]),
      wellbeing: JSON.parse(row[10]),
      sexual_skill: JSON.parse(row[11]),
      body_development: JSON.parse(row[12]),
    };
  }

  private mapRowToProtagonist(row: any[]): Protagonist {
    return {
      id: row[0],
      base_attributes: JSON.parse(row[1]),
      basic_description: JSON.parse(row[2]),
    };
  }

  private mapRowToApiSetting(row: any[]): ApiSetting {
    // SELECT * 顺序: id, name, platform, base_url, api_key, model, created_at, updated_at, is_default
    return {
      id: row[0],
      name: row[1],
      platform: row[2],
      base_url: row[3],
      api_key: this.decryptSafe(row[4]),
      model: row[5],
      created_at: row[6],
      updated_at: row[7],
      is_default: !!row[8],
    };
  }

  private encrypt(plain: string): string {
    try {
      return CryptoJS.AES.encrypt(plain || '', DatabaseService.SECRET_KEY).toString();
    } catch (e) {
      console.warn('api_key 加密失败，降级为原文:', e);
      return plain || '';
    }
  }

  private decryptSafe(cipher: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(cipher || '', DatabaseService.SECRET_KEY);
      const text = bytes.toString(CryptoJS.enc.Utf8);
      // 如果不是有效的 UTF8，返回原文（可能是历史未加密数据）
      return text || cipher || '';
    } catch (e) {
      // 历史数据或者非加密字符串
      return cipher || '';
    }
  }

  /**
   * 辅助函数：将一个 Character 对象转换成用于 SQL 参数绑定的数组
   * @param character - 要转换的人物对象
   * @param forUpdate - 如果是为 UPDATE 语句准备，则将 id 放到数组末尾
   */
  private mapCharacterToParams(character: Character, forUpdate = false): any[] {
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
          JSON.stringify(character.body_development)
      ];

      if (forUpdate) {
          params.push(character.id); // for WHERE id = ?
      }
      return params;
  }

  private mapProtagonistToParams(p: Protagonist, forUpdate = false): any[] {
    const params: (string | number)[] = [
      JSON.stringify(p.base_attributes),
      JSON.stringify(p.basic_description),
    ];
    if (forUpdate) {
      params.push(p.id);
    }
    return params;
  }
}

// 导出服务的单例，供整个应用使用
export const databaseService = DatabaseService.getInstance();