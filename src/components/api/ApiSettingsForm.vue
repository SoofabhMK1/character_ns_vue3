<script lang="ts" setup>
import { ref, getCurrentInstance } from 'nativescript-vue';
import { Dialogs } from '@nativescript/core';
import PlatformPickerModal from './modals/PlatformPickerModal.vue';
import OptionsPickerModal from './modals/OptionsPickerModal.vue';
import { useApiSettingsStore } from '../../stores/api-settings';
import type { ApiSetting } from '../../../types/api-setting';

const props = defineProps<{ mode: 'create' | 'edit'; initial?: ApiSetting }>();
const store = useApiSettingsStore();
const instance = getCurrentInstance();

// 表单字段
const name = ref(props.initial?.name || 'API连接 1');
const platformLabel = ref('自定义（OpenAI 协议）');
const platformValue = ref<'openai'>('openai');
const baseUrl = ref(props.initial?.base_url || 'https://api.openai.com/v1');
const apiKey = ref(props.initial?.api_key || '');
const modelOptions = ref<string[]>(['gpt-4o-mini', 'gpt-4o']);
const selectedModel = ref<string>(props.initial?.model || modelOptions.value[0]);

const saving = ref(false);
const error = ref('');

const save = async () => {
  try {
    saving.value = true;
    error.value = '';
    const payload: ApiSetting = {
      id: props.initial?.id,
      name: name.value,
      platform: platformValue.value,
      base_url: baseUrl.value,
      api_key: apiKey.value,
      model: selectedModel.value || 'gpt-4o-mini',
    };
    await store.save(payload);
    if (instance && instance.proxy) {
      instance.proxy.$navigateBack();
    }
  } catch (e) {
    error.value = store.errorMessage || '保存失败，请稍后重试';
  } finally {
    saving.value = false;
  }
};

const pickPlatform = async () => {
  if (!instance || !instance.proxy) return;
  const result = await instance.proxy.$showModal(PlatformPickerModal, { fullscreen: false });
  if (result) {
    platformValue.value = 'openai';
    platformLabel.value = '自定义（OpenAI 协议）';
  }
};

const pickModel = async () => {
  try {
    const list = await store.fetchModels({
      name: name.value,
      platform: platformValue.value,
      base_url: baseUrl.value,
      api_key: apiKey.value,
      model: selectedModel.value,
    });
    modelOptions.value = list;
    if (!instance || !instance.proxy) return;
    const res = await instance.proxy.$showModal(OptionsPickerModal, {
      fullscreen: false,
      props: { title: '选择模型', options: modelOptions.value }
    });
    if (typeof res === 'string' && res) {
      selectedModel.value = res;
    }
  } catch (e) {
    console.warn('选择模型失败:', e);
  }
};

const testConn = async () => {
  const { ok, message } = await store.testConnection({
    name: name.value,
    platform: platformValue.value,
    base_url: baseUrl.value,
    api_key: apiKey.value,
    model: selectedModel.value,
  });
  error.value = ok ? '' : message;
  await Dialogs.alert({ title: ok ? '测试结果' : '连接失败', message: ok ? '连接正常' : message, okButtonText: '好的' });
};
</script>

<template>
  <Page>
    <ActionBar :title="props.mode === 'create' ? '新建API连接' : '编辑API连接'">
      <NavigationButton text="返回" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    </ActionBar>

    <ScrollView>
      <StackLayout class="p-4 space-y-3">
        <Label text="名称" class="text-sm text-gray-600" />
        <TextField v-model="name" class="p-2 border rounded" hint="如：API连接 1" />

        <Label text="模型平台" class="mt-2 text-sm text-gray-600" />
        <GridLayout rows="auto" columns="*" class="p-3 bg-purple-600 text-white rounded-lg" @tap="pickPlatform">
          <Label :text="platformLabel" class="text-white" />
        </GridLayout>

        <Label text="API 接口地址" class="mt-2 text-sm text-gray-600" />
        <TextField v-model="baseUrl" class="p-2 border rounded" hint="https://api.openai.com/v1" />

        <Label text="API 密钥" class="mt-2 text-sm text-gray-600" />
        <TextField v-model="apiKey" class="p-2 border rounded" secure="true" hint="sk-..." />

        <Label text="模型" class="mt-2 text-sm text-gray-600" />
        <GridLayout rows="auto" columns="*" class="p-3 bg-gray-100 rounded-lg" @tap="pickModel">
          <Label :text="selectedModel" />
        </GridLayout>

        <Button text="测试连通性" class="mt-2" @tap="testConn" />

        <Label v-if="error" :text="error" class="text-red-500" textWrap="true" />

        <Button :isEnabled="!saving" text="保存" class="mt-4" @tap="save" />
      </StackLayout>
    </ScrollView>
  </Page>
</template>

<style>
</style>