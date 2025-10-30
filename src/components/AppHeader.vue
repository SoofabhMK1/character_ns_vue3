<template>
  <ActionBar>
    <NavigationButton v-if="showBackButton" text="Go back" android.systemIcon="ic_menu_back" @tap="$navigateBack" />
    <Label :text="title" class="text-center font-bold text-lg" horizontalAlignment="center" />
    <ActionItem v-if="showAddButton" android.systemIcon="ic_menu_add" @tap="onAddTap" />
    <ActionItem v-if="showSettingsButton" android.systemIcon="ic_menu_manage" @tap="onSettingsTap" />
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
    },
    showSettingsButton: {
        type: Boolean,
        default: false
    }
  })

  const emit = defineEmits(['addTap', 'settingsTap']);
  const onAddTap = () => emit('addTap');
  const onSettingsTap = () => emit('settingsTap');
</script>
