<script lang="ts" setup>
import { ref, onMounted, getCurrentInstance } from 'nativescript-vue';
import { useChatSettingsStore } from '../../stores/chat-settings';
import { useChatStore } from '../../stores/chat';
import { confirm } from '@nativescript/core';

const props = defineProps<{ characterId?: number }>();
const store = useChatSettingsStore();
const chatStore = useChatStore();
const instance = getCurrentInstance();

const systemPrompt = ref<string>(store.systemPrompt);
const streamingEnabled = ref<boolean>(store.streamingEnabled);
const isLoading = ref(false);
const errorMessage = ref('');

onMounted(async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    await store.init();
    systemPrompt.value = store.systemPrompt;
    streamingEnabled.value = store.streamingEnabled;
  } catch (e) {
    console.error('加载聊天设置失败:', e);
    errorMessage.value = '加载聊天设置失败';
  } finally {
    isLoading.value = false;
  }
});

const save = async () => {
  try {
    store.setSystemPrompt(systemPrompt.value);
    store.setStreamingEnabled(streamingEnabled.value);
    if (instance && instance.proxy) instance.proxy.$navigateBack();
  } catch (e) {
    console.error('保存聊天设置失败:', e);
    errorMessage.value = '保存聊天设置失败';
  }
};

const cancel = () => {
  if (instance && instance.proxy) instance.proxy.$navigateBack();
};
</script>

<template>
  <Page>
    <ActionBar title="聊天设置">
      <NavigationButton text="返回" android.systemIcon="ic_menu_back" @tap="cancel" />
      <ActionItem text="保存" @tap="save" />
    </ActionBar>

    <ScrollView>
      <StackLayout class="p-4 space-y-4">
        <ActivityIndicator v-if="isLoading" busy="true" />
        <Label v-else-if="errorMessage" :text="errorMessage" class="text-center text-red-500" textWrap="true" />

        <StackLayout v-else class="space-y-3">
          <Label text="System Prompt" class="text-sm text-gray-600" />
          <TextView v-model="systemPrompt" class="p-2 border rounded" rows="8" textWrap="true" />

          <StackLayout class="mt-2" orientation="horizontal">
            <Label text="启用流式输出" class="text-sm text-gray-600 mr-2" />
            <Switch v-model="streamingEnabled" />
          </StackLayout>

          <StackLayout class="mt-4">
            <Button v-if="props.characterId != null" text="删除当前角色聊天记录" class="btn-danger" @tap="async () => {
              const ok = await confirm({ title: '删除确认', message: '确定删除该角色的全部聊天记录？该操作不可撤销。', okButtonText: '删除', cancelButtonText: '取消' });
              if (ok && typeof props.characterId === 'number') {
                try { await chatStore.clearConversation(props.characterId); } catch {}
              }
            }" />
          </StackLayout>
        </StackLayout>
      </StackLayout>
    </ScrollView>
  </Page>
  
</template>

<style>
.space-y-4 { margin-top: 8; margin-bottom: 8; }
.space-y-3 { margin-top: 6; margin-bottom: 6; }
.text-center { text-align: center; }
.text-red-500 { color: #ef4444; }
.text-sm { font-size: 14; }
.text-gray-600 { color: #4b5563; }
.p-2 { padding: 8; }
.p-4 { padding: 16; }
.border { border-width: 1; border-color: #d1d5db; }
.rounded { border-radius: 8; }
.mr-2 { margin-right: 8; }
.mt-4 { margin-top: 16; }
.btn-danger { background-color: #ef4444; color: #ffffff; }
</style>