import { up as initUp } from './001_init';
import { up as debugModeUp } from './002_debug_mode';

export async function runMigrations(): Promise<void> {
  // 目前仅一版初始化，后续可按版本顺序依次执行
  await initUp();
  await debugModeUp();
}