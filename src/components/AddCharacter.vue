<script lang="ts" setup>
import { ref } from 'nativescript-vue';
import AppHeader from './AppHeader.vue';
import { databaseService } from '../services/data-service';
import type { Character } from '../../types/character';

const jsonInput = ref<string>('');
const errorMessage = ref<string>('');
const isSaving = ref<boolean>(false);

const validatePayload = (obj: any): string[] => {
  const errors: string[] = [];
  if (!obj || typeof obj !== 'object') {
    errors.push('JSON 不是一个对象');
    return errors;
  }
  const ci = obj.core_identity || {};
  if (!ci.first_name) errors.push('缺少 core_identity.first_name');
  if (!ci.last_name) errors.push('缺少 core_identity.last_name');
  if (typeof ci.age !== 'number') errors.push('缺少或错误的 core_identity.age');
  if (!('occupation' in ci)) errors.push('缺少 core_identity.occupation');
  // 顶层必需字段
  const requiredTop = ['psychological_profile','physical_profile','sexual_profile','metrics','wellbeing','sexual_skill','body_development'];
  for (const key of requiredTop) {
    if (!(key in obj)) errors.push(`缺少 ${key}`);
  }
  return errors;
};

const onSave = async () => {
  errorMessage.value = '';
  isSaving.value = true;
  try {
    const parsed = JSON.parse(jsonInput.value || '{}');
    // 不允许用户提供 id，改为数据库自增
    if ('id' in parsed) delete parsed.id;
    const errs = validatePayload(parsed);
    if (errs.length) {
      errorMessage.value = '格式错误:\n' + errs.join('\n');
      return;
    }
    await databaseService.saveCharacter(parsed as Character);
    // 保存成功后返回
    (global as any).__ax || null; // no-op to satisfy bundlers
    (require('@nativescript/core').Frame as any).topmost().goBack();
  } catch (e: any) {
    errorMessage.value = '保存失败: ' + (e?.message || e);
  } finally {
    isSaving.value = false;
  }
};

const onCancel = () => {
  (require('@nativescript/core').Frame as any).topmost().goBack();
};
</script>

<template>
  <Page>
    <AppHeader title="添加角色" />
    <ScrollView>
      <StackLayout class="p-4 space-y-3">
        <Label text="请粘贴角色的 JSON 字符串：" class="font-bold" />
        <TextView v-model="jsonInput" hint="{ ... }" class="p-2 bg-gray-100 rounded-md" editable="true" textWrap="true" height="280" />

        <Label v-if="errorMessage" :text="errorMessage" class="text-red-500" textWrap="true" />

        <GridLayout columns="*, *" class="mt-2">
          <Button col="0" text="取消" class="bg-gray-300" @tap="onCancel" />
          <Button col="1" :isEnabled="!isSaving" text="保存" class="bg-green-500 text-white" @tap="onSave" />
        </GridLayout>
      </StackLayout>
    </ScrollView>
  </Page>
  
</template>

<style>
</style>