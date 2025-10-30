import { defineStore } from 'pinia';
import { databaseService } from '../services/data-service';

export type ChatMessage = {
  id: number;
  character_id: number;
  role: string;
  content: string;
  created_at: string;
};

export const useChatStore = defineStore('chat', {
  state: () => ({
    messagesByCharacter: {} as Record<number, ChatMessage[]>,
    isLoading: false as boolean,
    errorMessage: '' as string,
  }),
  actions: {
    async loadMessages(characterId: number) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const list = await databaseService.getChatMessages(characterId);
        this.messagesByCharacter[characterId] = list;
      } catch (e) {
        console.error('加载聊天记录失败:', e);
        this.errorMessage = '加载聊天记录失败';
      } finally {
        this.isLoading = false;
      }
    },
    async sendMessage(characterId: number, content: string) {
      try {
        const ts = new Date().toISOString();
        await databaseService.addChatMessage(characterId, 'user', content, ts);
        await this.loadMessages(characterId);
      } catch (e) {
        console.error('发送消息失败:', e);
        this.errorMessage = '发送消息失败';
        throw e;
      }
    },
    async updateMessage(id: number, characterId: number, content: string) {
      try {
        await databaseService.updateChatMessage(id, content);
        await this.loadMessages(characterId);
      } catch (e) {
        console.error('更新消息失败:', e);
        this.errorMessage = '更新消息失败';
        throw e;
      }
    },
    async deleteMessage(id: number, characterId: number) {
      try {
        await databaseService.deleteChatMessage(id);
        await this.loadMessages(characterId);
      } catch (e) {
        console.error('删除消息失败:', e);
        this.errorMessage = '删除消息失败';
        throw e;
      }
    },
    getMessages(characterId: number): ChatMessage[] {
      return this.messagesByCharacter[characterId] || [];
    },
    clearError() {
      this.errorMessage = '';
    }
  }
});