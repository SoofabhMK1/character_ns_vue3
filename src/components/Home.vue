<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance, computed } from 'nativescript-vue';
import { ItemEventData } from '@nativescript/core';
import CharacterDetail from './CharacterDetail.vue';
import AddCharacter from './AddCharacter.vue';
import AppHeader from './AppHeader.vue';
import MainTabs from './MainTabs.vue';
import TabsCharacters from './TabsCharacters.vue';
import TabsProtagonist from './TabsProtagonist.vue';
import TabsDiscover from './TabsDiscover.vue';
import TabsSettings from './TabsSettings.vue';
import { useAppStore } from '../stores/app';
import { useCharactersStore } from '../stores/characters';
import { Character } from '../../types/character'; // 导入类型定义

const instance = getCurrentInstance();

// 1. 初始化响应式变量
const appStore = useAppStore();
const charactersStore = useCharactersStore();

const characters = computed(() => charactersStore.characters);
const isLoading = computed(() => appStore.isInitializing || charactersStore.isLoading);
const errorMessage = computed(() => appStore.errorMessage || charactersStore.errorMessage);
const currentTab = ref(0); //
const dbReady = computed(() => appStore.dbReady);
const headerTitle = computed(() => {
  return ['角色', '主角', '发现', '设置'][currentTab.value] || '角色';
});

// onMounted 现在是一个 async 函数，因为它需要执行异步的数据库操作
onMounted(async () => {
  try {
    await appStore.initApp();
    console.log('数据库服务已在 Home.vue 中成功初始化。');

    await charactersStore.loadCharacters();
    console.log('成功从本地 SQLite 数据库加载人物数据。');

  } catch (error) {
    console.error('在 Home.vue 中初始化或加载数据失败:', error);
    // 错误消息由 store 管理
  } finally {
    // 无论成功或失败，最后都结束加载状态
    // 加载状态由 store 计算
  }
});

const onItemTap = (event: ItemEventData) => {
  if (instance && instance.proxy) {
    const character = characters.value[event.index];
    instance.proxy.$navigateTo(CharacterDetail, {
      props: {
        character: character
      }
    });
  }
};

// 进入页面时刷新角色列表，以便新增后返回能看到更新
const reloadCharacters = async () => {
  try {
    await charactersStore.reloadCharacters();
  } catch (e) {
    console.error('刷新角色列表失败:', e);
  }
};

// 打开新增角色页面
const openAddCharacter = () => {
  if (instance && instance.proxy) {
    instance.proxy.$navigateTo(AddCharacter, {
      props: {},
    });
  }
};

// Tab 变更由 MainTabs 子组件通过 emits 更新 currentTab
</script>

<template>
  <Frame>
    <Page iosOverflowSafeArea="true" class="page" @navigatedTo="reloadCharacters">
      <AppHeader :title="headerTitle" :showBackButton="false" :showAddButton="currentTab === 0" @addTap="openAddCharacter" />

      <MainTabs v-model:currentTab="currentTab">
        <template #characters>
          <TabsCharacters
            :isLoading="isLoading"
            :errorMessage="errorMessage"
            :characters="characters"
            @itemTap="onItemTap"
          />
        </template>

        <template #protagonist>
          <TabsProtagonist />
        </template>

        <template #discover>
          <TabsDiscover />
        </template>

        <template #settings>
          <TabsSettings />
        </template>
      </MainTabs>

    </Page>
  </Frame>
</template>

<style>
/* 页面背景与底部 tabs 背景一致，避免底部安全区出现色差或空白感 */
.page { background-color: #ffffff; }
</style>
