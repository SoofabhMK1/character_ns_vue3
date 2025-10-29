<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance, computed } from 'nativescript-vue';
import { ItemEventData } from '@nativescript/core';
import CharacterDetail from './CharacterDetail.vue';
import AppHeader from './AppHeader.vue';
import MainTabs from './MainTabs.vue';
import { databaseService } from '../services/data-service'; // 导入本地数据服务
import { Character } from '../../types/character'; // 导入类型定义

const instance = getCurrentInstance();

// 1. 初始化响应式变量
const characters = ref<Character[]>([]);
const isLoading = ref(true); // 用于控制加载指示器的显示
const errorMessage = ref(''); // 用于在出错时显示信息
const currentTab = ref(0); // 0: 微信, 1: 通讯录, 2: 发现, 3: 我
const headerTitle = computed(() => {
  return ['角色', '属性', '背包', '设置'][currentTab.value] || '角色';
});

// onMounted 现在是一个 async 函数，因为它需要执行异步的数据库操作
onMounted(async () => {
  try {
    // 关键改动：在组件挂载后，首先初始化数据库服务。
    // 这会在后台发生，此时用户看到的是加载动画。
    await databaseService.init();
    console.log('数据库服务已在 Home.vue 中成功初始化。');

    // 数据库准备就绪后，再加载数据。
    const data = await databaseService.getCharacters();
    characters.value = data;
    console.log('成功从本地 SQLite 数据库加载人物数据。');

  } catch (error) {
    console.error('在 Home.vue 中初始化或加载数据失败:', error);
    errorMessage.value = '应用数据初始化失败，请重启应用。';
  } finally {
    // 无论成功或失败，最后都结束加载状态
    isLoading.value = false;
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

// Tab 变更由 MainTabs 子组件通过 emits 更新 currentTab
</script>

<template>
  <Frame>
    <Page iosOverflowSafeArea="true" class="page">
      <AppHeader :title="headerTitle" :showBackButton="false" />

      <MainTabs
        v-model:currentTab="currentTab"
        :isLoading="isLoading"
        :errorMessage="errorMessage"
        :characters="characters"
        :onItemTap="onItemTap"
      />

    </Page>
  </Frame>
</template>

<style>
/* 页面背景与底部 tabs 背景一致，避免底部安全区出现色差或空白感 */
.page { background-color: #ffffff; }
</style>
