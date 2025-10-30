import { up as initUp } from './001_init';
import { up as debugModeUp } from './002_debug_mode';
import { up as perCharacterChatSettingsUp } from './003_per_character_chat_settings';
import { up as dropGlobalChatSettingsUp } from './004_drop_global_chat_settings';

export async function runMigrations(): Promise<void> {
  // 目前仅一版初始化，后续可按版本顺序依次执行
  await initUp();
  await debugModeUp();
  await perCharacterChatSettingsUp();
  await dropGlobalChatSettingsUp();
}