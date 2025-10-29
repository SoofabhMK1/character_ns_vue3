<script lang="ts" setup>
import { getCurrentInstance } from 'nativescript-vue';
const props = defineProps<{ title: string; options: string[] }>();
const instance = getCurrentInstance();
const close = (val?: string) => { if (instance && instance.proxy && instance.proxy.$closeModal) instance.proxy.$closeModal(val); };
const onItemTap = (args: any) => {
  try {
    const idx = args?.index ?? 0;
    const opt = props.options[idx];
    close(opt);
  } catch {
    // no-op
  }
};
</script>

<template>
  <Page>
    <ActionBar :title="props.title">
      <NavigationButton text="关闭" android.systemIcon="ic_menu_close_clear_cancel" @tap="close()" />
    </ActionBar>
    <GridLayout rows="*" class="p-4">
      <!-- 使用 ListView 以启用原生滚动，在大量选项时更流畅 -->
      <ListView row="0" :items="props.options" @itemTap="onItemTap">
        <template #default="{ item }">
          <GridLayout rows="auto" columns="*" class="p-4 mb-2 bg-gray-100 rounded-lg">
            <Label :text="item" class="text-base" />
          </GridLayout>
        </template>
      </ListView>
    </GridLayout>
  </Page>
</template>

<style>
</style>