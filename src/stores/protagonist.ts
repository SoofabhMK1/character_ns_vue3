import { defineStore } from 'pinia';
import * as protagonistRepo from '../repositories/protagonist';
import type { Protagonist } from '../../types/protagonist';

type ProtagonistState = {
  protagonist: Protagonist | null;
  isLoading: boolean;
  errorMessage: string;
  loadedOnce: boolean;
};

export const useProtagonistStore = defineStore('protagonist', {
  state: (): ProtagonistState => ({
    protagonist: null,
    isLoading: false,
    errorMessage: '',
    loadedOnce: false,
  }),
  actions: {
    async loadProtagonist(): Promise<void> {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const p = await protagonistRepo.getProtagonist();
        if (!p) {
          this.errorMessage = '未获取到主角数据';
          return;
        }
        this.protagonist = p;
        this.loadedOnce = true;
      } catch (e) {
        console.error('加载主角信息失败:', e);
        this.errorMessage = '加载主角信息失败';
      } finally {
        this.isLoading = false;
      }
    },
    async saveProtagonist(p: Protagonist): Promise<void> {
      try {
        await protagonistRepo.saveProtagonist(p);
        this.protagonist = p;
      } catch (e) {
        console.error('保存主角信息失败:', e);
        this.errorMessage = '保存主角信息失败';
      }
    },
    clearError(): void {
      this.errorMessage = '';
    }
  },
});