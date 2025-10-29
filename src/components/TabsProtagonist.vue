<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'nativescript-vue';
import { databaseService } from '../services/data-service';
import type { Protagonist } from '../../types/protagonist';

defineOptions({ name: 'TabsProtagonist' });

const props = defineProps<{ dbReady: boolean }>();

const protagonist = ref<Protagonist | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');

// 防止在组件已卸载后仍然更新状态导致的异常
const isAlive = ref(true);
onUnmounted(() => { isAlive.value = false; });

const loadedOnce = ref(false);

const loadProtagonist = async () => {
  try {
    isLoading.value = true;
    const p = await databaseService.getProtagonist();
    if (!isAlive.value) return;
    protagonist.value = p;
    loadedOnce.value = true;
  } catch (e) {
    if (!isAlive.value) return;
    console.error('加载主角信息失败:', e);
    errorMessage.value = '加载主角信息失败';
  } finally {
    if (isAlive.value) {
      isLoading.value = false;
    }
  }
};

onMounted(async () => {
  if (props.dbReady && !loadedOnce.value) {
    await loadProtagonist();
  }
});

watch(() => props.dbReady, async (ready) => {
  if (ready && !loadedOnce.value && isAlive.value) {
    await loadProtagonist();
  }
});

// 其他基础属性（不含等级/经验/属性点四项）
const attributeList = computed(() => {
  if (!protagonist.value) return [];
  const a = protagonist.value.base_attributes;
  return [
    { key: 'physique', label: '体魄', value: a.physique },
    { key: 'dexterity', label: '灵巧', value: a.dexterity },
    { key: 'stamina', label: '耐力', value: a.stamina },
    { key: 'intellect', label: '智力', value: a.intellect },
    { key: 'insight', label: '洞察', value: a.insight },
    { key: 'charisma', label: '魅力', value: a.charisma },
    { key: 'oral_skill', label: '口技', value: a.oral_skill },
    { key: 'manual_skill', label: '手技', value: a.manual_skill },
    { key: 'endurance_control', label: '持久控制', value: a.endurance_control },
    { key: 'anatomy_knowledge', label: '解剖知识', value: a.anatomy_knowledge },
    { key: 'rhythm_mastery', label: '节奏掌控', value: a.rhythm_mastery },
    { key: 'virility_level', label: '雄性水平', value: a.virility_level },
  ];
});

// 基础属性（六项）
const coreBasics = computed(() => {
  if (!protagonist.value) return [] as {key:string;label:string;value:number}[];
  const a = protagonist.value.base_attributes;
  return [
    { key: 'physique', label: '体魄', value: a.physique },
    { key: 'dexterity', label: '灵巧', value: a.dexterity },
    { key: 'stamina', label: '耐力', value: a.stamina },
    { key: 'intellect', label: '智力', value: a.intellect },
    { key: 'insight', label: '洞察', value: a.insight },
    { key: 'charisma', label: '魅力', value: a.charisma },
  ];
});

// 爱情相关属性（其余）
const romanceAttrs = computed(() => {
  if (!protagonist.value) return [] as {key:string;label:string;value:number}[];
  const a = protagonist.value.base_attributes;
  return [
    { key: 'oral_skill', label: '口技', value: a.oral_skill },
    { key: 'manual_skill', label: '手技', value: a.manual_skill },
    { key: 'endurance_control', label: '持久控制', value: a.endurance_control },
    { key: 'anatomy_knowledge', label: '解剖知识', value: a.anatomy_knowledge },
    { key: 'rhythm_mastery', label: '节奏掌控', value: a.rhythm_mastery },
    { key: 'virility_level', label: '雄性水平', value: a.virility_level },
  ];
});

// 成长状态（等级/经验/属性点）
const growth = computed(() => {
  const a = protagonist.value?.base_attributes;
  if (!a) return null;
  return {
    level: a.level,
    experience: a.experience,
    expToNext: a.experience_to_next_level,
    points: a.attribute_points_available,
  };
});

</script>

<template>
  <GridLayout rows="auto, *" class="p-4">
    <ActivityIndicator v-if="isLoading" row="0" busy="true" class="align-middle" />
    <Label v-else-if="errorMessage" row="0" :text="errorMessage" class="text-center text-red-500 align-middle" textWrap="true" />

    <ScrollView v-else row="1">
      <StackLayout class="space-y-4">

        <!-- 顶部核心信息 -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg">
          <Label v-if="protagonist" :text="protagonist.basic_description.last_name + protagonist.basic_description.first_name" class="text-2xl font-bold text-center" />
          <Label v-if="protagonist" :text="protagonist.basic_description.occupation" class="mt-2 text-center text-gray-600" />
        </StackLayout>

        <StackLayout height="8" />

        <!-- 成长状态 -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
          <Label text="成长状态" class="text-xl font-bold" />
          <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

          <!-- 等级（上限 999） -->
          <GridLayout columns="auto, *, auto" class="mb-2">
            <Label col="0" text="等级" class="w-32 text-base align-middle" />
            <Progress col="1" :value="growth?.level || 0" :maxValue="999" color="#07C160" class="align-middle" />
            <Label col="2" :text="`${growth?.level || 0} / 999`" class="w-28 text-right text-sm text-gray-600 align-middle" />
          </GridLayout>

          <!-- 经验（上限为升级所需经验） -->
          <GridLayout columns="auto, *, auto" class="mb-2">
            <Label col="0" text="经验" class="w-32 text-base align-middle" />
            <Progress 
              col="1" 
              :value="growth?.experience || 0" 
              :maxValue="growth?.expToNext || 0" 
              color="#4299e1" 
              class="align-middle" />
            <Label col="2" :text="`${growth?.experience || 0} / ${growth?.expToNext || 0}`" class="w-28 text-right text-sm text-gray-600 align-middle" />
          </GridLayout>

          <!-- 属性点（无上限，显示数值） -->
          <GridLayout columns="auto, *" class="mb-2">
            <Label col="0" text="可用属性点" class="w-32 text-base align-middle font-bold" />
            <Label col="1" :text="String(growth?.points ?? 0)" class="text-right text-base" />
          </GridLayout>
        </StackLayout>

        <!-- 基础属性（六项，统一上限 999） -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
          <Label text="基础属性" class="text-xl font-bold" />
          <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

          <GridLayout v-for="(attr, index) in coreBasics" :key="'core-'+index" columns="auto, *, auto" class="mb-2">
            <Label col="0" :text="attr.label" class="w-32 text-base align-middle" />
            <Progress col="1" :value="attr.value" :maxValue="999" color="#4299e1" class="align-middle" />
            <Label col="2" :text="`${attr.value} / 999`" class="w-28 text-right text-sm text-gray-600 align-middle" />
          </GridLayout>
        </StackLayout>

        <!-- 爱情相关属性（其余，统一上限 999） -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
          <Label text="其他属性" class="text-xl font-bold" />
          <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

          <GridLayout v-for="(attr, index) in romanceAttrs" :key="'rom-'+index" columns="auto, *, auto" class="mb-2">
            <Label col="0" :text="attr.label" class="w-32 text-base align-middle" />
            <Progress col="1" :value="attr.value" :maxValue="999" color="#9f7aea" class="align-middle" />
            <Label col="2" :text="`${attr.value} / 999`" class="w-28 text-right text-sm text-gray-600 align-middle" />
          </GridLayout>
        </StackLayout>

        <!-- 基础描述 -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
          <Label text="基础描述" class="text-xl font-bold" />
          <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

          <GridLayout columns="auto, *" class="mb-2">
            <Label col="0" text="已婚:" class="font-bold" />
            <Label col="1" :text="protagonist?.basic_description.is_married ? '是' : '否'" />
          </GridLayout>
          <GridLayout columns="auto, *" class="mb-2">
            <Label col="0" text="有子女:" class="font-bold" />
            <Label col="1" :text="protagonist?.basic_description.has_children ? '是' : '否'" />
          </GridLayout>

          <StackLayout class="mt-2">
            <Label text="外貌与身体细节" class="font-bold text-lg mb-2" />
            <GridLayout columns="auto, *" class="mb-1">
              <Label col="0" text="体型:" class="font-bold" />
              <Label col="1" :text="protagonist?.basic_description.physical_profile.general.body_type" />
            </GridLayout>
            <GridLayout columns="auto, *" class="mb-1">
              <Label col="0" text="身高:" class="font-bold" />
              <Label col="1" :text="(protagonist?.basic_description.physical_profile.general.height_cm || 0) + ' cm'" />
            </GridLayout>

            <StackLayout class="mt-2">
              <Label text="性特征（男）" class="font-semibold text-base" />
              <GridLayout columns="auto, *" class="mb-1">
                <Label col="0" text="勃起长度:" class="font-bold" />
                <Label col="1" :text="(protagonist?.basic_description.physical_profile.sexual_anatomy.penis.length_cm_erect || 0) + ' cm'" />
              </GridLayout>
              <GridLayout columns="auto, *" class="mb-1">
                <Label col="0" text="勃起周长:" class="font-bold" />
                <Label col="1" :text="(protagonist?.basic_description.physical_profile.sexual_anatomy.penis.girth_cm_erect || 0) + ' cm'" />
              </GridLayout>
              <GridLayout columns="auto, *" class="mb-1">
                <Label col="0" text="是否包皮环切:" class="font-bold" />
                <Label col="1" :text="protagonist?.basic_description.physical_profile.sexual_anatomy.penis.is_circumcised ? '是' : '否'" />
              </GridLayout>
              <WrapLayout>
                <Label
                  v-for="(tag, idx) in protagonist?.basic_description.physical_profile.sexual_anatomy.penis.appearance_tags || []"
                  :key="'penis-tag-' + idx"
                  :text="tag"
                  class="px-2 py-1 m-1 bg-blue-500 text-white rounded-full text-sm" />
              </WrapLayout>
            </StackLayout>
          </StackLayout>

          <!-- 移除生活技能：已按需求从基础描述中删除 -->

          <StackLayout class="mt-2">
            <Label text="性偏好与吸引" class="font-bold text-lg mb-2" />
            <StackLayout>
              <Label text="个人癖好" class="font-semibold text-base" />
              <WrapLayout>
                <Label
                  v-for="(cfg, name) in protagonist?.basic_description.sexual_profile.personal_kinks || {}"
                  :key="'kink-' + String(name)"
                  :text="String(name) + (cfg?.role ? '（' + cfg.role + '）' : '')"
                  class="px-2 py-1 m-1 bg-purple-500 text-white rounded-full text-sm" />
              </WrapLayout>
            </StackLayout>

            <StackLayout class="mt-2">
              <Label text="偏好类型（外在）" class="font-semibold text-base" />
              <WrapLayout>
                <Label
                  v-for="(t, idx) in protagonist?.basic_description.sexual_profile.attraction_profile.physical_types || []"
                  :key="'phys-' + idx"
                  :text="t"
                  class="px-2 py-1 m-1 bg-gray-200 rounded-md text-sm" />
              </WrapLayout>
            </StackLayout>

            <StackLayout class="mt-2">
              <Label text="偏好类型（性格）" class="font-semibold text-base" />
              <WrapLayout>
                <Label
                  v-for="(t, idx) in protagonist?.basic_description.sexual_profile.attraction_profile.personality_archetypes || []"
                  :key="'pers-' + idx"
                  :text="t"
                  class="px-2 py-1 m-1 bg-gray-200 rounded-md text-sm" />
              </WrapLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>

        <!-- 占位：技能与熟练度 -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg">
          <Label text="技能与熟练度（待实现）" class="text-center text-gray-600" />
        </StackLayout>

        <!-- 占位：背包 -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg">
          <Label text="背包（待实现）" class="text-center text-gray-600" />
        </StackLayout>

      </StackLayout>
    </ScrollView>
  </GridLayout>
</template>

<style>
</style>