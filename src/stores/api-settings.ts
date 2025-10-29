import { defineStore } from 'pinia';
import { databaseService } from '../services/data-service';
import type { ApiSetting } from '../../types/api-setting';

export const useApiSettingsStore = defineStore('apiSettings', {
  state: () => ({
    list: [] as ApiSetting[],
    isLoading: false as boolean,
    errorMessage: '' as string,
  }),
  actions: {
    async loadAll() {
      try {
        this.isLoading = true;
        this.errorMessage = '';
        const rows = await databaseService.getApiSettings();
        this.list = rows;
      } catch (e) {
        console.error('加载 API 设置失败:', e);
        this.errorMessage = '加载 API 设置失败';
      } finally {
        this.isLoading = false;
      }
    },
    async save(setting: ApiSetting) {
      try {
        // 唯一名称校验（忽略自身 id）
        const existingSameName = this.list.find(s => s.name.trim() === setting.name.trim() && s.id !== setting.id);
        if (existingSameName) {
          throw new Error('名称已存在');
        }
        await databaseService.saveApiSetting(setting);
        await this.loadAll();
      } catch (e) {
        console.error('保存 API 设置失败:', e);
        this.errorMessage = (e as Error)?.message === '名称已存在' ? '同名 API 已存在，请更换名称' : '保存失败';
        throw e;
      }
    },
    async remove(id: number) {
      try {
        await databaseService.deleteApiSetting(id);
        await this.loadAll();
      } catch (e) {
        console.error('删除 API 设置失败:', e);
        this.errorMessage = '删除失败';
        throw e;
      }
    },
    async setDefault(id: number) {
      try {
        await databaseService.setDefaultApiSetting(id);
        await this.loadAll();
      } catch (e) {
        console.error('设置默认连接失败:', e);
        this.errorMessage = '设置默认连接失败';
      }
    },
    async testConnection(setting: ApiSetting): Promise<{ ok: boolean; message: string }> {
      try {
        const url = `${setting.base_url.replace(/\/$/, '')}/models`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${setting.api_key}`,
            'Content-Type': 'application/json',
          }
        });
        if (!res.ok) {
          const text = await res.text();
          return { ok: false, message: `HTTP ${res.status}: ${text}` };
        }
        return { ok: true, message: '连接正常' };
      } catch (e) {
        return { ok: false, message: (e as Error).message };
      }
    },
    async fetchModels(setting: ApiSetting): Promise<string[]> {
      try {
        const url = `${setting.base_url.replace(/\/$/, '')}/models`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${setting.api_key}`,
            'Content-Type': 'application/json',
          }
        });
        const data = await res.json();
        const list: string[] = Array.isArray(data?.data)
          ? data.data.map((m: any) => m.id).filter((x: any) => typeof x === 'string')
          : [];
        return list.length ? list : ['gpt-4o-mini', 'gpt-4o'];
      } catch (e) {
        console.warn('获取模型失败，使用默认备选:', e);
        return ['gpt-4o-mini', 'gpt-4o'];
      }
    }
  }
});