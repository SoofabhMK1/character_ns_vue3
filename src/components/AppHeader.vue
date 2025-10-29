<template>
  <ActionBar>
    <NavigationButton v-if="showBackButton" text="Go back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    <Label :text="title" class="text-center font-bold text-lg" horizontalAlignment="center" />
  </ActionBar>
</template>

<script setup>
  defineProps({
    title: {
      type: String,
      default: 'App'
    },
    showBackButton: {
        type: Boolean,
        default: true
    }
  })
</script>
