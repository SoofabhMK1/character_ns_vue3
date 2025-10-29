import { defineStore } from 'pinia';
import { databaseService } from '../services/data-service';
import type { Protagonist } from '../../types/protagonist';

export const useProtagonistStore = defineStore('protagonist', {
  state: () => ({
    protagonist: null as Protagonist | null,
    isLoading: false as boolean,
    errorMessage: '' as string,
    loadedOnce: false as boolean,
  }),
  actions: {
    async loadProtagonist() {
      this.isLoading = true;
      try {
        const p = await databaseService.getProtagonist();
        this.protagonist = p;
        this.loadedOnce = true;
      } catch (e) {
        console.error('加载主角信息失败:', e);
        this.errorMessage = '加载主角信息失败';
      } finally {
        this.isLoading = false;
      }
    },
    async saveProtagonist(p: Protagonist) {
      await databaseService.saveProtagonist(p);
      this.protagonist = p;
    },
    clearError() {
      this.errorMessage = '';
    }
  },
});