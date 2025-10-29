<script lang="ts" setup>
import { ItemEventData } from '@nativescript/core';
import type { Character } from '../../types/character';

const props = defineProps<{
  currentTab: number;
  isLoading: boolean;
  errorMessage: string;
  characters: Character[];
  onItemTap: (event: ItemEventData) => void;
}>();

const emit = defineEmits<{
  (e: 'update:currentTab', value: number): void;
}>();

const onSelectedIndexChanged = (args: any) => {
  try {
    const obj = args?.object as any;
    const idx = obj?.selectedIndex;
    if (typeof idx === 'number') {
      emit('update:currentTab', idx);
    }
  } catch (e) {
    // ignore
  }
};
</script>

<template>
  <TabView
    :selectedIndex="props.currentTab"
    @selectedIndexChanged="onSelectedIndexChanged"
    androidTabsPosition="bottom"
    tabsBackgroundColor="#ffffff"
    tabTextColor="#7a7a7a"
    selectedTabTextColor="#07C160"
    androidSelectedTabHighlightColor="#07C160"
  >
    <!-- Tab 0: 角色 -->
    <TabViewItem title="角色">
      <GridLayout rows="*">
        <ActivityIndicator v-if="props.isLoading" row="0" busy="true" class="align-middle" />
        <Label v-else-if="props.errorMessage" row="0" :text="props.errorMessage" class="text-center text-red-500 align-middle" textWrap="true" />
        <ListView v-else row="0" :items="props.characters" @itemTap="props.onItemTap">
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
</template>

<style>
</style>