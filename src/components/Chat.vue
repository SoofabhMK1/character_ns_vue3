<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, computed, getCurrentInstance } from 'nativescript-vue';
import AppHeader from './AppHeader.vue';
import type { Character } from '../../types/character';
import { action, prompt, confirm } from '@nativescript/core';
import { useAppStore } from '../stores/app';
import { useChatStore } from '../stores/chat';
import { useChatSettingsStore } from '../stores/chat-settings';
import ChatSettings from './chat/ChatSettings.vue';
import DebugPreview from './chat/DebugPreview.vue';
import type { ChatMessage } from '../stores/chat';

const props = defineProps<{ character: Character }>();
const appStore = useAppStore();
const chatStore = useChatStore();
const chatSettingsStore = useChatSettingsStore();
const instance = getCurrentInstance();
const isLoading = computed(() => chatStore.isLoading);
const errorMessage = computed(() => chatStore.errorMessage);
// UI 层不显示系统提示消息
const messages = computed<ChatMessage[]>(() => chatStore.getMessages(props.character.id).filter(m => m.role !== 'system'));
const inputText = ref('');

const loadMessages = async () => {
  await chatStore.loadMessages(props.character.id);
};

const onSend = async () => {
  const text = inputText.value.trim();
  if (!text) return;
  try {
    if (chatSettingsStore.debugMode) {
      const context = await chatStore.buildPreviewContext(props.character, text);
      if (instance && instance.proxy) {
        instance.proxy.$navigateTo(DebugPreview, {
          props: {
            context,
            onContinue: async () => {
              try {
                await chatStore.sendMessage(props.character.id, text);
                inputText.value = '';
                await chatStore.sendAssistantReply(props.character);
              } catch (e) {
                console.error('发送消息失败:', e);
              }
            }
          }
        });
      }
    } else {
      await chatStore.sendMessage(props.character.id, text);
      inputText.value = '';
      await chatStore.sendAssistantReply(props.character);
    }
  } catch (e) {
    console.error('发送消息失败:', e);
  }
};

onMounted(async () => {
  if (appStore.dbReady) {
    await chatSettingsStore.init();
    await loadMessages();
  } else {
    const stop = watch(
      () => appStore.dbReady,
      async (ready) => {
        if (ready) {
          await chatSettingsStore.init();
          await loadMessages();
          stop();
        }
      }
    );
  }
});

onUnmounted(() => {
  // 组件销毁时，取消可能正在进行的流式回复，避免销毁后更新导致崩溃
  try { chatStore.cancelStreaming(); } catch {}
});

const titleText = `${props.character.core_identity.last_name}${props.character.core_identity.first_name}`;
const onSettingsTap = () => {
  try {
    if (instance && instance.proxy) {
      instance.proxy.$navigateTo(ChatSettings, { props: { characterId: props.character.id } });
    }
  } catch {}
};

const onMessageLongPress = async (msg: ChatMessage) => {
  try {
    const choice = await action({
      message: '选择操作',
      cancelButtonText: '取消',
      actions: ['修改', '删除']
    });
    if (choice === '修改') {
      const res = await prompt({
        title: '修改消息',
        message: '编辑该消息内容：',
        okButtonText: '保存',
        cancelButtonText: '取消',
        defaultText: msg.content
      });
      if (res.result && typeof msg.id === 'number') {
        await chatStore.updateMessage(msg.id, props.character.id, res.text || '');
      }
    } else if (choice === '删除') {
      const ok = await confirm({
        title: '删除消息',
        message: '确定删除该消息？',
        okButtonText: '删除',
        cancelButtonText: '取消'
      });
      if (ok && typeof msg.id === 'number') {
        await chatStore.deleteMessage(msg.id, props.character.id);
      }
    }
  } catch (e) {
    console.error('处理长按操作失败:', e);
  }
};
</script>

<template>
  <Page>
    <AppHeader :title="titleText" :showBackButton="true" :showSettingsButton="true" @settingsTap="onSettingsTap" />

    <GridLayout rows="*, auto" class="page">
      <!-- 聊天记录区域 -->
      <ScrollView row="0">
        <StackLayout class="p-4 space-y-2">
          <ActivityIndicator v-if="isLoading" busy="true" class="align-middle" />
          <Label v-else-if="errorMessage" :text="errorMessage" class="text-center text-red-500" textWrap="true" />
          <StackLayout v-for="m in messages" :key="m.id || m.created_at" :class="m.role === 'user' ? 'items-end' : 'items-start'" @longPress="onMessageLongPress(m)">
            <Label :text="m.content" class="px-3 py-2 bg-gray-100 rounded-lg text-base" textWrap="true" />
            <Label :text="new Date(m.created_at).toLocaleString()" class="text-xs text-gray-600 mt-1" />
          </StackLayout>
          <Label v-if="messages.length === 0" text="暂无聊天记录" class="text-center text-gray-600" />
        </StackLayout>
      </ScrollView>

      <!-- 输入区域 -->
      <GridLayout row="1" columns="*, auto" class="p-2 border-t border-gray-300">
        <TextField col="0" v-model="inputText" hint="输入消息..." returnKeyType="send" @returnPress="onSend" />
        <Button col="1" text="发送" class="btn btn-success ml-2" @tap="onSend" />
      </GridLayout>
    </GridLayout>
  </Page>
  
</template>

<style>
.space-y-2 { margin-top: 4; margin-bottom: 4; }
.page { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.rounded-lg { border-radius: 12; }
.text-center { text-align: center; }
.text-gray-600 { color: #4b5563; }
.text-base { font-size: 16; }
.text-xs { font-size: 12; }
.mt-1 { margin-top: 4; }
.px-3 { padding-left: 12; padding-right: 12; }
.py-2 { padding-top: 8; padding-bottom: 8; }
.btn-success { background-color: #07C160; color: #ffffff; }
.ml-2 { margin-left: 8; }
.border-t { border-top-width: 1; }
.border-gray-300 { border-color: #d1d5db; }
.items-end { horizontal-align: right; }
.items-start { horizontal-align: left; }
.text-red-500 { color: #ef4444; }
.align-middle { vertical-align: middle; }
</style>