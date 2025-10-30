import { defineStore } from 'pinia';
import { initializeDatabase } from '../services/db/init';

export const useAppStore = defineStore('app', {
  state: () => ({
    dbReady: false as boolean,
    isInitializing: false as boolean,
    errorMessage: '' as string,
  }),
  actions: {
    async initApp() {
      if (this.dbReady || this.isInitializing) return;
      this.isInitializing = true;
      try {
        await initializeDatabase();
        this.dbReady = true;
      } catch (e) {
        console.error('应用初始化失败:', e);
        this.errorMessage = '应用数据初始化失败，请重启应用。';
      } finally {
        this.isInitializing = false;
      }
    },
    clearError() {
      this.errorMessage = '';
    }
  },
});