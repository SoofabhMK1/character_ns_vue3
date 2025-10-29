<script lang="ts" setup>
const props = defineProps<{ currentTab: number }>();

const emit = defineEmits<{ (e: 'update:currentTab', value: number): void }>();

const onSelectedIndexChanged = (args: any) => {
  try {
    const obj = args?.object as any;
    const idx = obj?.selectedIndex;
    if (typeof idx === 'number') {
      emit('update:currentTab', idx);
    }
  } catch {
    // no-op
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
      <slot name="characters" />
    </TabViewItem>

    <!-- Tab 1: 主角 -->
    <TabViewItem title="主角">
      <slot name="attributes" />
    </TabViewItem>

    <!-- Tab 2: 背包 -->
    <TabViewItem title="背包">
      <slot name="inventory" />
    </TabViewItem>

    <!-- Tab 3: 设置 -->
    <TabViewItem title="设置">
      <slot name="settings" />
    </TabViewItem>
  </TabView>
</template>

<style>
</style>