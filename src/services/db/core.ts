const Sqlite = require('nativescript-sqlite');

let dbInstance: any | null = null;
let initPromise: Promise<any> | null = null;

/**
 * 打开（或复用）数据库连接并返回实例。
 * 仅负责连接，不做建表与数据迁移（由上层服务或迁移器负责）。
 */
export async function initDB(): Promise<any> {
  if (dbInstance) return dbInstance;
  if (initPromise) {
    dbInstance = await initPromise;
    return dbInstance;
  }
  initPromise = (async () => {
    const db = await new Sqlite('app.db');
    return db;
  })();
  dbInstance = await initPromise;
  initPromise = null;
  return dbInstance;
}

/** 获取数据库连接（必要时初始化）。 */
export async function getDB(): Promise<any> {
  return await initDB();
}

/** 执行无返回的 SQL。 */
export async function execSQL(sql: string, params?: any[]): Promise<void> {
  const db = await getDB();
  await db.execSQL(sql, params);
}

/** 查询单行（nativescript-sqlite 的 get 返回数组）。 */
export async function get(sql: string, params?: any[]): Promise<any[]> {
  const db = await getDB();
  return await db.get(sql, params);
}

/** 查询多行。 */
export async function all(sql: string, params?: any[]): Promise<any[][]> {
  const db = await getDB();
  return await db.all(sql, params);
}