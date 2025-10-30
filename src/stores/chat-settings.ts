import { defineStore } from 'pinia';
import * as chatSettingsRepo from '../repositories/chat-settings';
import * as apiSettingsRepo from '../repositories/api-settings';
import type { ApiSetting } from '../../types/api-setting';

export const useChatSettingsStore = defineStore('chatSettings', {
  state: () => ({
    currentCharacterId: null as number | null,
    selectedApiId: null as number | null,
    streamingEnabled: false as boolean,
    debugMode: false as boolean,
    systemPrompt: '你是一个细腻而真实的角色，请以第一人称、自然对话回复。' as string,
    isLoading: false as boolean,
    errorMessage: '' as string,
  }),
  actions: {
    async initForCharacter(characterId: number) {
      if (this.isLoading) return;
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const list = await apiSettingsRepo.getApiSettings();
        // 优先使用 is_default；否则选第一条；若没有配置，保持 null（调用时需检查）
        const def = list.find(s => (s as any).is_default === 1 || (s as any).is_default === true || !!(s as any).is_default);
        const chosen = def || list[0];
        this.selectedApiId = chosen?.id ?? null;

        // 读取并应用持久化的聊天设置
        const cs = await chatSettingsRepo.getChatSettings(characterId);
        this.currentCharacterId = characterId;
        this.systemPrompt = cs.system_prompt || this.systemPrompt;
        this.streamingEnabled = !!cs.streaming_enabled;
        this.debugMode = !!cs.debug_mode;
      } catch (e) {
        console.error('初始化聊天设置失败:', e);
        this.errorMessage = '初始化聊天设置失败';
      } finally {
        this.isLoading = false;
      }
    },
    async getSelectedApiSetting(): Promise<ApiSetting | null> {
      if (typeof this.selectedApiId === 'number') {
        return await apiSettingsRepo.getApiSettingById(this.selectedApiId);
      }
      const list = await apiSettingsRepo.getApiSettings();
      const def = list.find(s => (s as any).is_default === 1 || (s as any).is_default === true || !!(s as any).is_default);
      return def || list[0] || null;
    },
    setSelectedApiId(id: number | null) {
      this.selectedApiId = id;
    },
    setStreamingEnabled(enabled: boolean) {
      this.streamingEnabled = !!enabled;
    },
    setDebugMode(enabled: boolean) {
      this.debugMode = !!enabled;
    },
    setSystemPrompt(text: string) {
      this.systemPrompt = text || '';
    },
    async save(): Promise<void> {
      try {
        if (this.currentCharacterId == null) throw new Error('未指定角色');
        await chatSettingsRepo.saveChatSettings(this.currentCharacterId, this.systemPrompt, this.streamingEnabled, this.debugMode);
      } catch (e) {
        console.error('保存聊天设置失败:', e);
        this.errorMessage = '保存聊天设置失败';
        throw e;
      }
    },
    clearError() {
      this.errorMessage = '';
    }
  }
});