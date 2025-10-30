<script lang="ts" setup>
import type { Character } from '../../types/character';

defineProps<{
  isLoading: boolean;
  errorMessage: string;
  characters: Character[];
}>();

const emit = defineEmits<{ (e: 'moreTap', character: Character): void; (e: 'chatTap', character: Character): void }>();

const onMoreTap = (character: Character) => {
  emit('moreTap', character);
};

const onChatTap = (character: Character) => {
  emit('chatTap', character);
};
</script>

<template>
  <GridLayout rows="*">
    <ActivityIndicator v-if="isLoading" row="0" busy="true" class="align-middle" />
    <Label v-else-if="errorMessage" row="0" :text="errorMessage" class="text-center text-red-500 align-middle" textWrap="true" />
    <ListView v-else row="0" :items="characters">
      <template #default="{ item }">
        <GridLayout rows="auto, auto" columns="*" class="p-4 mb-2 bg-gray-100 rounded-lg">
          <!-- 顶部：名字 + 右侧图标 -->
          <GridLayout row="0" columns="*, auto, auto" class="items-center">
            <Label col="0" class="text-lg font-bold">
              <FormattedString>
                <Span :text="item.core_identity.last_name" />
                <Span :text="item.core_identity.first_name" />
              </FormattedString>
            </Label>
            <!-- 对话图标（占位，无跳转） -->
            <Label col="1" text="💬" class="text-lg ml-2" @tap="onChatTap(item)" />
            <!-- 更多（省略号）图标，点击进入详情 -->
            <Label col="2" text="⋯" class="text-lg ml-8 mr-4" @tap="onMoreTap(item)" />
          </GridLayout>

          <!-- 次级信息：年龄、职业 -->
          <Label row="1" class="text-gray-600">
            <FormattedString>
              <Span :text="item.core_identity.age + '岁, '" />
              <Span :text="item.core_identity.occupation" />
            </FormattedString>
          </Label>
        </GridLayout>
      </template>
    </ListView>
  </GridLayout>
</template>

<style>
</style>