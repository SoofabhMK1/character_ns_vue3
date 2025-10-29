<script lang="ts" setup>
import { getCurrentInstance, onMounted, computed, watch } from 'nativescript-vue';
import ApiSettingsList from './api/ApiSettingsList.vue';
import { useApiSettingsStore } from '../stores/api-settings';
import { useAppStore } from '../stores/app';

const instance = getCurrentInstance();
const store = useApiSettingsStore();
const appStore = useAppStore();

onMounted(() => {
  // 等待数据库初始化完成再加载 API 列表，避免 this.database 未准备好
  if (appStore.dbReady) {
    store.loadAll();
  } else {
    const stop = watch(
      () => appStore.dbReady,
      (ready) => {
        if (ready) {
          store.loadAll();
          stop();
        }
      },
      { immediate: false }
    );
  }
});

const openApiSettings = () => {
  if (instance && instance.proxy) {
    instance.proxy.$navigateTo(ApiSettingsList, { props: {} });
  }
};

// 计算默认 API 名称显示文案
const defaultApiLabel = computed(() => {
  const def = store.list.find(s => s.is_default);
  return def ? `默认：${def.name}` : '无默认';
});
</script>

<template>
  <ScrollView>
    <StackLayout class="p-4 space-y-4">
      <GridLayout rows="auto" columns="*, auto" class="p-4 bg-gray-100 rounded-lg" @tap="openApiSettings">
        <Label col="0" text="API设置" class="text-lg font-bold" />
        <Label col="1" :text="defaultApiLabel" class="text-sm text-gray-600" />
      </GridLayout>
    </StackLayout>
  </ScrollView>
</template>

<style>
</style>