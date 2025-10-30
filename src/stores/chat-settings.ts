import { defineStore } from 'pinia';
import { databaseService } from '../services/data-service';
import type { ApiSetting } from '../../types/api-setting';

export const useChatSettingsStore = defineStore('chatSettings', {
  state: () => ({
    selectedApiId: null as number | null,
    streamingEnabled: false as boolean,
    systemPrompt: '你是一个细腻而真实的角色，请以第一人称、自然对话回复。' as string,
    isLoading: false as boolean,
    errorMessage: '' as string,
  }),
  actions: {
    async init() {
      if (this.isLoading) return;
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const list = await databaseService.getApiSettings();
        // 优先使用 is_default；否则选第一条；若没有配置，保持 null（调用时需检查）
        const def = list.find(s => (s as any).is_default === 1 || (s as any).is_default === true);
        const chosen = def || list[0];
        this.selectedApiId = chosen?.id ?? null;

        // 读取并应用持久化的聊天设置
        const cs = await databaseService.getChatSettings();
        this.systemPrompt = cs.system_prompt || this.systemPrompt;
        this.streamingEnabled = !!cs.streaming_enabled;
      } catch (e) {
        console.error('初始化聊天设置失败:', e);
        this.errorMessage = '初始化聊天设置失败';
      } finally {
        this.isLoading = false;
      }
    },
    async getSelectedApiSetting(): Promise<ApiSetting | null> {
      if (typeof this.selectedApiId === 'number') {
        return await databaseService.getApiSettingById(this.selectedApiId) as ApiSetting | null;
      }
      const list = await databaseService.getApiSettings();
      const def = list.find(s => (s as any).is_default === 1 || (s as any).is_default === true);
      return def || list[0] || null;
    },
    setSelectedApiId(id: number | null) {
      this.selectedApiId = id;
    },
    setStreamingEnabled(enabled: boolean) {
      this.streamingEnabled = !!enabled;
    },
    setSystemPrompt(text: string) {
      this.systemPrompt = text || '';
    },
    async save(): Promise<void> {
      try {
        await databaseService.saveChatSettings(this.systemPrompt, this.streamingEnabled);
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