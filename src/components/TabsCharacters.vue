<script lang="ts" setup>
import { ItemEventData } from '@nativescript/core';
import type { Character } from '../../types/character';

defineProps<{
  isLoading: boolean;
  errorMessage: string;
  characters: Character[];
}>();

const emit = defineEmits<{ (e: 'itemTap', event: ItemEventData): void }>();

const onItemTap = (event: ItemEventData) => {
  emit('itemTap', event);
};
</script>

<template>
  <GridLayout rows="*">
    <ActivityIndicator v-if="isLoading" row="0" busy="true" class="align-middle" />
    <Label v-else-if="errorMessage" row="0" :text="errorMessage" class="text-center text-red-500 align-middle" textWrap="true" />
    <ListView v-else row="0" :items="characters" @itemTap="onItemTap">
      <template #default="{ item }">
        <GridLayout rows="auto, auto" columns="*" class="p-4 mb-2 bg-gray-100 rounded-lg">
          <Label row="0" class="text-lg font-bold">
            <FormattedString>
              <Span :text="item.core_identity.last_name" />
              <Span :text="item.core_identity.first_name" />
            </FormattedString>
          </Label>
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