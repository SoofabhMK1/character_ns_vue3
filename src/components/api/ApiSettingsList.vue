<script lang="ts" setup>
import { onMounted, getCurrentInstance, computed } from 'nativescript-vue';
import { useApiSettingsStore } from '../../stores/api-settings';
import { Dialogs } from '@nativescript/core';
import ApiSettingsForm from './ApiSettingsForm.vue';

const store = useApiSettingsStore();
const instance = getCurrentInstance();

const list = computed(() => store.list);
const isLoading = computed(() => store.isLoading);
const errorMessage = computed(() => store.errorMessage);

onMounted(async () => {
  await store.loadAll();
});

const openCreate = () => {
  if (instance && instance.proxy) {
    instance.proxy.$navigateTo(ApiSettingsForm, { props: { mode: 'create' } });
  }
};

const onItemTap = (args: any) => {
  const idx = args?.index ?? 0;
  const item = list.value[idx];
  if (!item) return;
  if (instance && instance.proxy) {
    instance.proxy.$navigateTo(ApiSettingsForm, { props: { mode: 'edit', initial: item } });
  }
};

const setDefault = async (item: any) => {
  if (!item?.id) return;
  await store.setDefault(item.id);
};

const editItem = (item: any) => {
  if (instance && instance.proxy) {
    instance.proxy.$navigateTo(ApiSettingsForm, { props: { mode: 'edit', initial: item } });
  }
};

const deleteItem = async (item: any) => {
  if (!item?.id) return;
  const confirmed = await Dialogs.confirm({
    title: '删除确认',
    message: `确定删除「${item.name}」吗？该操作不可撤销。`,
    okButtonText: '删除',
    cancelButtonText: '取消'
  });
  if (confirmed) {
    await store.remove(item.id);
  }
};
</script>

<template>
  <Page>
    <ActionBar title="API设置">
      <NavigationButton text="返回" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
      <ActionItem android.systemIcon="ic_menu_add" @tap="openCreate" />
    </ActionBar>

    <GridLayout rows="*" class="p-4">
      <ActivityIndicator v-if="isLoading" row="0" busy="true" />
      <Label v-else-if="errorMessage" row="0" :text="errorMessage" class="text-center text-red-500" textWrap="true" />
      <ListView v-else row="0" :items="list" @itemTap="onItemTap">
        <template #default="{ item }">
          <GridLayout rows="auto, auto, auto" columns="auto, *" class="p-4 mb-2 bg-gray-100 rounded-lg">
            <!-- 第一行：名称与默认标记 -->
            <Label row="0" col="0" v-if="item.is_default" text="★" class="text-yellow-500 mr-2" />
            <Label row="0" col="1" class="text-lg font-bold" :text="item.name" />

            <!-- 第二行：平台与模型信息 -->
            <Label row="1" colSpan="2" class="text-gray-600" :text="item.model + ' · ' + item.platform" />

            <!-- 第三行：按钮独立一行 -->
            <StackLayout row="2" colSpan="2" orientation="horizontal" class="mt-2">
              <Button text="编辑" class="mr-2" @tap="() => editItem(item)" />
              <Button text="删除" class="mr-2" @tap="() => deleteItem(item)" />
              <Button text="设为默认" @tap="() => setDefault(item)" />
            </StackLayout>
          </GridLayout>
        </template>
      </ListView>
    </GridLayout>
  </Page>
</template>

<style>
</style>