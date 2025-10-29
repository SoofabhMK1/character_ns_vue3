<template>
  <ActionBar>
    <NavigationButton v-if="showBackButton" text="Go back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    <Label :text="title" class="text-center font-bold text-lg" horizontalAlignment="center" />
    <ActionItem v-if="showAddButton" android.systemIcon="ic_menu_add" @tap="onAddTap" />
  </ActionBar>
</template>

<script setup>
  const props = defineProps({
    title: {
      type: String,
      default: 'App'
    },
    showBackButton: {
        type: Boolean,
        default: true
    },
    showAddButton: {
        type: Boolean,
        default: false
    }
  })

  const emit = defineEmits(['addTap']);
  const onAddTap = () => emit('addTap');
</script>
