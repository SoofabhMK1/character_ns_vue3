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
      <StackLayout>
        <slot name="characters" />
      </StackLayout>
    </TabViewItem>

    <!-- Tab 1: 主角 -->
    <TabViewItem title="主角">
      <StackLayout>
        <slot name="protagonist" />
      </StackLayout>
    </TabViewItem>

    <!-- Tab 2: 发现 -->
    <TabViewItem title="发现">
      <StackLayout>
        <slot name="discover" />
      </StackLayout>
    </TabViewItem>

    <!-- Tab 3: 设置 -->
    <TabViewItem title="设置">
      <StackLayout>
        <slot name="settings" />
      </StackLayout>
    </TabViewItem>
  </TabView>
</template>

<style>
</style>