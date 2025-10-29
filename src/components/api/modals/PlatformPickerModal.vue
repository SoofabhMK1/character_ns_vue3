<script lang="ts" setup>
import { getCurrentInstance } from 'nativescript-vue';
const instance = getCurrentInstance();
const options = [{ label: '自定义（OpenAI 协议）', value: 'openai' }];
const close = (val?: string) => { if (instance && instance.proxy && instance.proxy.$closeModal) instance.proxy.$closeModal(val); };
</script>

<template>
  <Page>
    <ActionBar title="选择模型平台">
      <NavigationButton text="关闭" android.systemIcon="ic_menu_close_clear_cancel" @tap="close()" />
    </ActionBar>
    <StackLayout class="p-4">
      <GridLayout v-for="opt in options" :key="opt.value" rows="auto" columns="*" class="p-4 mb-2 bg-gray-100 rounded-lg" @tap="close(opt.value)">
        <Label :text="opt.label" class="text-base" />
      </GridLayout>
    </StackLayout>
  </Page>
</template>

<style>
</style>