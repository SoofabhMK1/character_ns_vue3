import { defineStore } from 'pinia';
import * as chatRepo from '../repositories/chat-messages';
import { useChatSettingsStore } from './chat-settings';
import { useProtagonistStore } from './protagonist';
import type { Character } from '../../types/character';
import type { ChatMessage, ChatRole } from '../../types/chat';
import { buildInitialSystemPrompt } from '../services/prompt-builder';
import { chatCompletion } from '../services/llm';
import { createAbortController } from '../services/abort-controller';

export type { ChatMessage, ChatRole } from '../../types/chat';

export const useChatStore = defineStore('chat', {
  state: () => ({
    messagesByCharacter: {} as Record<number, ChatMessage[]>,
    isLoading: false as boolean,
    errorMessage: '' as string,
    streamAbortController: null as any,
  }),
  actions: {
    async loadMessages(characterId: number) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const list = await chatRepo.getChatMessages(characterId);
        this.messagesByCharacter[characterId] = list;
      } catch (e) {
        console.error('加载聊天记录失败:', e);
        this.errorMessage = '加载聊天记录失败';
      } finally {
        this.isLoading = false;
      }
    },
    async buildPreviewContext(character: Character, incomingText: string): Promise<Array<{ role: ChatRole; content: string }>> {
      // 加载当前消息上下文
      await this.loadMessages(character.id);
      const existing = this.getMessages(character.id);
      const chatSettings = useChatSettingsStore();
      const protagonistStore = useProtagonistStore();
      if (!protagonistStore.protagonist) {
        try { await protagonistStore.loadProtagonist(); } catch {}
      }
      const sysExisting = existing.find(m => m.role === 'system');
      const sysContent = sysExisting?.content || buildInitialSystemPrompt(character, protagonistStore.protagonist, chatSettings.systemPrompt);
      const context: Array<{ role: ChatRole; content: string }> = [
        { role: 'system', content: sysContent },
        ...existing.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
      ];
      if (incomingText && incomingText.trim()) {
        context.push({ role: 'user', content: incomingText.trim() });
      }
      return context;
    },
    async sendMessage(characterId: number, content: string) {
      try {
        const ts = new Date().toISOString();
        await chatRepo.addChatMessage(characterId, 'user', content, ts);
        await this.loadMessages(characterId);
      } catch (e) {
        console.error('发送消息失败:', e);
        this.errorMessage = '发送消息失败';
        throw e;
      }
    },
    async updateMessage(id: number, characterId: number, content: string) {
      try {
        await chatRepo.updateChatMessage(id, content);
        await this.loadMessages(characterId);
      } catch (e) {
        console.error('更新消息失败:', e);
        this.errorMessage = '更新消息失败';
        throw e;
      }
    },
    async deleteMessage(id: number, characterId: number) {
      try {
        await chatRepo.deleteChatMessage(id);
        await this.loadMessages(characterId);
      } catch (e) {
        console.error('删除消息失败:', e);
        this.errorMessage = '删除消息失败';
        throw e;
      }
    },
    async sendAssistantReply(character: Character) {
      this.errorMessage = '';
      try {
        const chatSettings = useChatSettingsStore();
        // 确保有 API 设置
        const apiSetting = await chatSettings.getSelectedApiSetting();
        if (!apiSetting) throw new Error('未找到可用的 API 设置');

        // 确保有当前角色的消息上下文
        await this.loadMessages(character.id);
        const context = await chatRepo.getChatMessages(character.id);
        const protagonistStore = useProtagonistStore();
        if (!protagonistStore.protagonist) {
          try { await protagonistStore.loadProtagonist(); } catch {}
        }
        const sysExisting = context.find(m => m.role === 'system');
        const sysContent = sysExisting?.content || buildInitialSystemPrompt(character, protagonistStore.protagonist, chatSettings.systemPrompt);
        const contextForLLM: Array<{ role: ChatRole; content: string }> = [
          { role: 'system', content: sysContent },
          ...context.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }))
        ];
        const stream = chatSettings.streamingEnabled;
        if (stream) {
          // 在 UI 中追加一个待写入的临时 assistant 消息并增量更新其内容
          const pending: ChatMessage = {
            id: -1,
            character_id: character.id,
            role: 'assistant',
            content: '',
            created_at: new Date().toISOString(),
          };
          const arr = this.messagesByCharacter[character.id] || [];
          this.messagesByCharacter[character.id] = [...arr, pending];
          const controller = createAbortController();
          this.streamAbortController = controller;
          try {
            const finalContent = await chatCompletion(apiSetting, contextForLLM, true, (delta) => {
              if (this.streamAbortController?.signal?.aborted) return;
              pending.content += delta;
              // 触发响应性更新
              const cur = this.messagesByCharacter[character.id] || [];
              this.messagesByCharacter[character.id] = [...cur];
            }, controller.signal);
            if (!this.streamAbortController?.signal?.aborted) {
              // 审计：若系统提示尚未持久化，则补充写入
              if (!sysExisting) {
                await chatRepo.addChatMessage(character.id, 'system', sysContent, new Date().toISOString());
              }
              await chatRepo.addChatMessage(character.id, 'assistant', finalContent, new Date().toISOString());
              await this.loadMessages(character.id);
            }
          } finally {
            this.streamAbortController = null;
          }
        } else {
          const assistantContent = await chatCompletion(apiSetting, contextForLLM, false);
          // 审计：若系统提示尚未持久化，则补充写入
          if (!sysExisting) {
            await chatRepo.addChatMessage(character.id, 'system', sysContent, new Date().toISOString());
          }
          await chatRepo.addChatMessage(character.id, 'assistant', assistantContent, new Date().toISOString());
          await this.loadMessages(character.id);
        }
      } catch (e: any) {
        if (e && e.name === 'AbortError') {
          return;
        }
        console.error('生成 AI 回复失败:', e);
        this.errorMessage = '生成 AI 回复失败';
        throw e;
      }
    },
    cancelStreaming() {
      try {
        this.streamAbortController?.abort();
      } catch {}
      this.streamAbortController = null;
    },
    async clearConversation(characterId: number) {
      this.errorMessage = '';
      try {
        await chatRepo.deleteAllChatMessagesForCharacter(characterId);
        await this.loadMessages(characterId);
      } catch (e) {
        console.error('清空聊天记录失败:', e);
        this.errorMessage = '清空聊天记录失败';
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