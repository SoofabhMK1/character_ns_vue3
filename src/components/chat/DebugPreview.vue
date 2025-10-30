<script lang="ts" setup>
import { getCurrentInstance } from 'nativescript-vue';
import type { ChatRole } from '../../types/chat';

const props = defineProps<{ context: Array<{ role: ChatRole; content: string }>, onContinue?: () => void }>();
const instance = getCurrentInstance();

const onCancel = () => {
  if (instance && instance.proxy) instance.proxy.$navigateBack();
};

const onProceed = () => {
  try {
    if (typeof props.onContinue === 'function') props.onContinue();
  } finally {
    if (instance && instance.proxy) instance.proxy.$navigateBack();
  }
};
</script>

<template>
  <Page>
    <ActionBar title="发送前预览">
      <NavigationButton text="返回" android.systemIcon="ic_menu_back" @tap="onCancel" />
      <ActionItem text="继续" @tap="onProceed" />
    </ActionBar>

    <ScrollView>
      <StackLayout class="p-4 space-y-3">
        <Label text="以下内容将发送给 AI：" class="text-sm text-gray-600" />
        <StackLayout v-for="(item, idx) in props.context" :key="idx" class="p-3 bg-gray-100 rounded">
          <Label :text="item.role === 'system' ? '系统提示' : (item.role === 'user' ? '用户' : '助手')" class="text-xs text-gray-600" />
          <Label :text="item.content" class="text-base" textWrap="true" />
        </StackLayout>

        <GridLayout rows="auto" columns="*, *" class="mt-4">
          <Button col="0" text="取消" class="btn" @tap="onCancel" />
          <Button col="1" text="继续" class="btn-success ml-2" @tap="onProceed" />
        </GridLayout>
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<style>
.space-y-3 { margin-top: 6; margin-bottom: 6; }
.text-sm { font-size: 14; }
.text-base { font-size: 16; }
.text-xs { font-size: 12; }
.text-gray-600 { color: #4b5563; }
.bg-gray-100 { background-color: #f3f4f6; }
.rounded { border-radius: 8; }
.p-3 { padding: 12; }
.p-4 { padding: 16; }
.btn-success { background-color: #07C160; color: #ffffff; }
.ml-2 { margin-left: 8; }
.mt-4 { margin-top: 16; }
</style>