<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance, computed } from 'nativescript-vue';
import { ItemEventData } from '@nativescript/core';
import CharacterDetail from './CharacterDetail.vue';
import AppHeader from './AppHeader.vue';
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

// 底栏索引变化时同步到 currentTab（原生 BottomNavigation 事件）
const onTabChanged = (args: any) => {
  try {
    const obj = args?.object as any;
    const idx = obj?.selectedIndex;
    if (typeof idx === 'number') {
      currentTab.value = idx;
    }
  } catch (e) {
    // 安全兜底：保持不抛错
  }
};
</script>

<template>
  <Frame>
    <Page iosOverflowSafeArea="true" class="page">
      <AppHeader :title="headerTitle" :showBackButton="false" />

      <!-- 使用 TabView，安卓将 tabs 固定在底部，并统一样式 -->
      <TabView
        :selectedIndex="currentTab"
        @selectedIndexChanged="onTabChanged"
        androidTabsPosition="bottom"
        tabsBackgroundColor="#ffffff"
        tabTextColor="#7a7a7a"
        selectedTabTextColor="#07C160"
        androidSelectedTabHighlightColor="#07C160"
      >
        <!-- Tab 0: 微信 -->
        <TabViewItem title="角色">
          <GridLayout rows="*">
            <ActivityIndicator v-if="isLoading" row="0" busy="true" class="align-middle" />
            <Label v-else-if="errorMessage" row="0" :text="errorMessage" class="text-center text-red-500 align-middle" textWrap="true" />
            <ListView v-else row="0" :items="characters" @itemTap="onItemTap">
              <template #default="{ item }">
                <GridLayout rows="auto, auto" columns="*" class="p-4 mb-2 bg-gray-100 rounded-lg">
                  <Label row="0" class="text-lg font-bold">
                    <FormattedString>
                      <Span :text="item.core_identity.last_name" />
                      <Span :text="item.core_identity.first_name" />
                    </FormattedString>
                  </Label>
                  <Label row="1" class="text-gray-600">
                    <FormattedString>
                      <Span :text="item.core_identity.age + '岁, '" />
                      <Span :text="item.core_identity.occupation" />
                    </FormattedString>
                  </Label>
                </GridLayout>
              </template>
            </ListView>
          </GridLayout>
        </TabViewItem>

        <!-- Tab 1: 属性 -->
        <TabViewItem title="属性">
          <StackLayout class="p-4">
            <Label text="这里是通讯录（待实现）" class="text-center text-gray-600" />
          </StackLayout>
        </TabViewItem>

        <!-- Tab 2: 背包 -->
        <TabViewItem title="背包">
          <StackLayout class="p-4">
            <Label text="这里是发现（待实现）" class="text-center text-gray-600" />
          </StackLayout>
        </TabViewItem>

        <!-- Tab 3: 设置 -->
        <TabViewItem title="设置">
          <StackLayout class="p-4">
            <Label text="这里是我（待实现）" class="text-center text-gray-600" />
          </StackLayout>
        </TabViewItem>
      </TabView>

    </Page>
  </Frame>
</template>

<style>
/* 页面背景与底部 tabs 背景一致，避免底部安全区出现色差或空白感 */
.page { background-color: #ffffff; }
</style>
