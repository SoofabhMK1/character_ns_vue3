<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'nativescript-vue';
import { storeToRefs } from 'pinia';
import { useProtagonistStore } from '../stores/protagonist';
import { useAppStore } from '../stores/app';
import type { Protagonist } from '../../types/protagonist';
import { GridLayout } from '@nativescript/core';

defineOptions({ name: 'TabsProtagonist' });

// 使用 Pinia store 管理主角数据
const appStore = useAppStore();
const protagonistStore = useProtagonistStore();
const { protagonist, isLoading, errorMessage, loadedOnce } = storeToRefs(protagonistStore);

// 防止在组件已卸载后仍然更新状态导致的异常
const isAlive = ref(true);
onUnmounted(() => { isAlive.value = false; });

onMounted(async () => {
  if (appStore.dbReady && !loadedOnce.value) {
    await protagonistStore.loadProtagonist();
  }
});

watch(() => appStore.dbReady, async (ready) => {
  if (ready && !loadedOnce.value && isAlive.value) {
    await protagonistStore.loadProtagonist();
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

const isBaseAttributeShow = ref(false);

// 分配属性点（基础版本）
const allocateMode = ref(false);
const pending = ref<Record<string, number>>({});
const allocatedTotal = computed(() => Object.values(pending.value).reduce((s, v) => s + (v || 0), 0));
const remaining = computed(() => Math.max(0, (growth.value?.points || 0) - allocatedTotal.value));

const initPending = () => {
  const list = attributeList.value;
  const obj: Record<string, number> = {};
  for (const item of list) obj[item.key] = 0;
  pending.value = obj;
};

watch(protagonist, () => {
  initPending();
});

const getCurrentValue = (key: string) => {
  const a = protagonist.value?.base_attributes as any;
  return a?.[key] ?? 0;
};

const getMaxAllocFor = (key: string) => {
  const current = getCurrentValue(key);
  const room = Math.max(0, 999 - current);
  const backAllowance = (pending.value[key] || 0);
  return Math.min(room, remaining.value + backAllowance);
};

const inc = (key: string) => {
  const max = getMaxAllocFor(key);
  const cur = pending.value[key] || 0;
  if (cur < max) pending.value[key] = cur + 1;
};

const dec = (key: string) => {
  const cur = pending.value[key] || 0;
  if (cur > 0) pending.value[key] = cur - 1;
};

const resetAll = () => initPending();

const saveAllocation = async () => {
  if (!protagonist.value) return;
  try {
    const updated: Protagonist = JSON.parse(JSON.stringify(protagonist.value));
    const a: any = updated.base_attributes as any;
    for (const [key, add] of Object.entries(pending.value)) {
      if (add && add > 0) {
        a[key] = Math.min(999, (a[key] || 0) + add);
      }
    }
    a.attribute_points_available = remaining.value;
    await protagonistStore.saveProtagonist(updated);
    allocateMode.value = false;
    initPending();
  } catch (e) {
    console.error('保存属性分配失败:', e);
    errorMessage.value = '保存属性分配失败';
  }
};

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
            <Progress col="1" :value="(growth && growth.level != null ? growth.level : 0)" :maxValue="999" color="#07C160" class="align-middle" />
            <Label col="2" :text="(growth && growth.level != null ? growth.level : 0) + ' / 999'" class="w-28 text-right text-sm text-gray-600 align-middle" />
          </GridLayout>

          <!-- 经验（上限为升级所需经验） -->
          <GridLayout columns="auto, *, auto" class="mb-2">
            <Label col="0" text="经验" class="w-32 text-base align-middle" />
            <Progress 
              col="1" 
              :value="(growth && growth.experience != null ? growth.experience : 0)" 
              :maxValue="(growth && growth.expToNext != null ? growth.expToNext : 0)" 
              color="#4299e1" 
              class="align-middle" />
            <Label col="2" :text="(growth && growth.experience != null ? growth.experience : 0) + ' / ' + (growth && growth.expToNext != null ? growth.expToNext : 0)" class="w-28 text-right text-sm text-gray-600 align-middle" />
          </GridLayout>

          <!-- 属性点（无上限，显示数值） -->
          <!-- 可用属性点 + 分配按钮同行，风格一致 -->
          <GridLayout columns="auto, *, auto" class="mb-2">
            <Label col="0" text="可用属性点" class="w-32 text-base align-middle font-bold" />
            <Label col="1" :text="(growth && growth.points != null ? growth.points : 0).toString()" class="text-left text-base" />
            <Button col="2" :text="allocateMode ? '取消分配' : '分配属性点'" class="btn btn-outline" @tap="() => { allocateMode = !allocateMode; if (allocateMode) initPending(); }" />
          </GridLayout>
          <!-- 分配状态（第一行仅显示状态） -->
          <GridLayout v-if="allocateMode" columns="auto, *" class="mt-2">
            <Label col="0" :text="'剩余属性点：' + remaining" class="text-sm text-gray-600" />
            <Label col="1" :text="'本次改动：+' + allocatedTotal" class="text-sm text-gray-600 text-right" />
          </GridLayout>
          <!-- 操作按钮（第二行独立） -->
          <GridLayout v-if="allocateMode" columns="*, auto, auto" class="mt-2">
            <StackLayout col="0" />
            <Button col="1" text="重置" class="btn btn-outline" @tap="resetAll" />
            <Button col="2" text="保存分配" class="btn btn-success" :isEnabled="allocatedTotal > 0" @tap="saveAllocation" />
          </GridLayout>
        </StackLayout>

        <!-- 基础属性（六项，统一上限 999） -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
          <Label text="基础属性" class="text-xl font-bold" />
          <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

          <GridLayout v-for="(attr, index) in coreBasics" :key="'core-'+index" columns="auto, auto, *" class="mb-2">
            <Label col="0" :text="attr.label" class="w-32 text-base align-middle" />
            <Progress v-if="!allocateMode" col="1" :value="attr.value" :maxValue="999" color="#4299e1" class="align-middle" />
            <StackLayout v-else col="1" orientation="horizontal" class="align-middle">
              <Button text="-" @tap="() => dec(attr.key)" :isEnabled="(pending[attr.key] || 0) > 0" width="40" height="30" class="mr-2 btn btn-outline" />
              <Button text="+" @tap="() => inc(attr.key)" :isEnabled="getMaxAllocFor(attr.key) > (pending[attr.key] || 0)" width="40" height="30" class="btn btn-outline" />
            </StackLayout>
            <Label v-if="!allocateMode" col="2" :text="attr.value + ' / 999'" class="w-28 text-right text-sm text-gray-600 align-middle" />
            <Label v-else col="2" :text="attr.value + ' + ' + (pending[attr.key] || 0) + ' / 999'" class="text-right text-sm text-gray-600 align-middle" />
          </GridLayout>
        </StackLayout>

        <!-- 爱情相关属性（其余，统一上限 999） -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
          <Label text="其他属性" class="text-xl font-bold" />
          <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

          <GridLayout v-for="(attr, index) in romanceAttrs" :key="'rom-'+index" columns="auto, auto, *" class="mb-2">
            <Label col="0" :text="attr.label" class="w-32 text-base align-middle" />
            <Progress v-if="!allocateMode" col="1" :value="attr.value" :maxValue="999" color="#9f7aea" class="align-middle" />
            <StackLayout v-else col="1" orientation="horizontal" class="align-middle">
              <Button text="-" @tap="() => dec(attr.key)" :isEnabled="(pending[attr.key] || 0) > 0" width="40" height="30" class="mr-2 btn btn-outline" />
              <Button text="+" @tap="() => inc(attr.key)" :isEnabled="getMaxAllocFor(attr.key) > (pending[attr.key] || 0)" width="40" height="30" class="btn btn-outline" />
            </StackLayout>
            <Label v-if="!allocateMode" col="2" :text="attr.value + ' / 999'" class="w-28 text-right text-sm text-gray-600 align-middle" />
            <Label v-else col="2" :text="attr.value + ' + ' + (pending[attr.key] || 0) + ' / 999'" class="text-right text-sm text-gray-600 align-middle" />
          </GridLayout>
        </StackLayout>

        <!-- 基础描述 -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
          <GridLayout columns="*, auto" @tap="isBaseAttributeShow = !isBaseAttributeShow" class="p-2 -mx-2">
            <Label col="0" text="基础描述" class="text-xl font-bold" />
            <Label col="1" :text="isBaseAttributeShow ? '收起 ▲' : '展开 ▼'" class="text-sm text-gray-500" />
          </GridLayout>
          <StackLayout v-if="isBaseAttributeShow">
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
/* 统一按钮风格，贴近应用配色 */
.btn {
  font-weight: 600;
  border-radius: 16;
  padding: 6 12;
}
.btn-outline {
  background-color: #ffffff;
  color: #4299e1;
  border-width: 1;
  border-color: #d1d5db; /* gray-300 */
}
.btn-success {
  background-color: #07C160; /* 微信绿，和等级条一致 */
  color: #ffffff;
}
.btn-icon {
  width: 40;
  height: 20;
  border-radius: 12;
}
.mr-2 { margin-right: 8; }
.ml-1 { margin-left: 4; }
.mt-2 { margin-top: 8; }
.mb-2 { margin-bottom: 8; }
.w-32 { width: 128; }
.w-28 { width: 112; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.text-base { font-size: 16; }
.text-xl { font-size: 20; }
.text-2xl { font-size: 24; }
.font-bold { font-weight: 700; }
.rounded-lg { border-radius: 12; }
.bg-gray-100 { background-color: #f3f4f6; }
.text-gray-600 { color: #4b5563; }
</style>