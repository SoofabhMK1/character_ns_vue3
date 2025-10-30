import { defineStore } from 'pinia';
import * as charactersRepo from '../repositories/characters';
import type { Character } from '../../types/character';

export const useCharactersStore = defineStore('characters', {
  state: () => ({
    characters: [] as Character[],
    isLoading: false as boolean,
    errorMessage: '' as string,
  }),
  actions: {
    async loadCharacters() {
      this.isLoading = true;
      try {
        const data = await charactersRepo.getCharacters();
        this.characters = data;
      } catch (e) {
        console.error('加载角色列表失败:', e);
        this.errorMessage = '加载角色列表失败';
      } finally {
        this.isLoading = false;
      }
    },
    async reloadCharacters() {
      await this.loadCharacters();
    },
    clearError() {
      this.errorMessage = '';
    }
  },
});