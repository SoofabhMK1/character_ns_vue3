<template>
  <Page>
    <AppHeader title="人物详情" />

    <ScrollView>
      <StackLayout class="p-4 space-y-4">

        <!-- 1. 顶部核心信息卡 -->
        <StackLayout class="p-4 bg-gray-100 rounded-lg">
          <Label :text="character.core_identity.last_name + character.core_identity.first_name" class="text-2xl font-bold text-center" />
          <Label :text="character.core_identity.occupation" class="mt-2 text-center text-gray-600" />
        </StackLayout>
        
        <StackLayout height="8" />

        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
          <StackLayout>
            <GridLayout v-for="(attr, index) in metricAttributes" :key="index" columns="auto, *, auto" class="mb-2">

              <Label col="0" :text="attr.label" class="w-24 text-base align-middle" />

              <Progress 
                col="1" 
                :value="attr.value" 
                maxValue="100"
                :color="attr.color"
                class="align-middle"
              />

              <Label col="2" :text="`${attr.value} / 100`" class="w-24 text-right text-sm text-gray-600 align-middle" />

            </GridLayout>
          </StackLayout>
        </StackLayout>

        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">

            <Label text="核心档案" class="text-xl font-bold" />

            <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

            <GridLayout columns="auto, *, auto, *">
                <Label col="0" text="年龄:" class="font-bold" />
                <Label col="1" :text="character.core_identity.age" />
                <Label col="2" text="生日:" class="font-bold ml-4" />
                <Label col="3" :text="character.core_identity.birthdate" />
            </GridLayout>

            <GridLayout columns="auto, *" class="mt-2">
                <Label col="0" text="小名:" class="font-bold" />
                <Label col="1" :text="character.core_identity.nickname" textWrap="true" />
            </GridLayout>

            <GridLayout columns="auto, *" class="mt-2">
                <Label col="0" text="关系:" class="font-bold" />
                <Label col="1" :text="character.core_identity.protagonist_relationship" textWrap="true" />
            </GridLayout>

        </StackLayout>

        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">

          <Label text="心理侧写" class="text-xl font-bold" />

          <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

          <GridLayout columns="auto, *" class="align-middle">
            <Label col="0" text="MBTI 人格:" class="font-bold text-base" />
            <Label col="1" :text="character.psychological_profile.mbti_type" class="ml-2 text-base" />
          </GridLayout>

          <StackLayout class="mt-3">
            <Label text="优点" class="font-bold text-lg mb-2" />

            <WrapLayout>

              <Label 
                v-for="(virtue, index) in character.psychological_profile.virtues" 
                :key="`virtue-${index}`"
                :text="virtue"
                class="px-2 py-1 m-1 bg-green-500 text-white rounded-full text-sm" />
            </WrapLayout>
          </StackLayout>

          <StackLayout class="mt-3">
            <Label text="缺点" class="font-bold text-lg mb-2" />
            <WrapLayout>
              <Label 
                v-for="(flaw, index) in character.psychological_profile.flaws" 
                :key="`flaw-${index}`"
                :text="flaw"
                class="px-2 py-1 m-1 bg-orange-500 text-white rounded-full text-sm" />
            </WrapLayout>
          </StackLayout>

          <StackLayout class="mt-3">

            <GridLayout columns="*, auto" @tap="isSecretsExpanded = !isSecretsExpanded" class="p-2 -mx-2">

              <Label col="0" text="秘密" class="font-bold text-lg" />

              <Label col="1" :text="isSecretsExpanded ? '收起 ▲' : '展开 ▼'" class="text-sm text-gray-500" />
            </GridLayout>

            <WrapLayout v-if="isSecretsExpanded" class="mt-2">
              <Label 
                v-for="(secret, index) in character.psychological_profile.secrets" 
                :key="`secret-${index}`"
                :text="secret"
                textWrap="true" 
                class="p-2 m-1 bg-gray-500 text-white rounded-lg text-sm" />
            </WrapLayout>

          </StackLayout>

        </StackLayout>

        <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-3">

        <Label text="体貌特征" class="text-xl font-bold" />
        <StackLayout class="border-b border-gray-300 mt-2" />

        <StackLayout class="mt-2">

          <GridLayout columns="*, *" rows="auto, auto, auto, auto">
            <Label row="0" col="0" :text="`身高: ${character.physical_profile.general.height_cm} cm`" class="p-1" />
            <Label row="0" col="1" :text="`体重: ${character.physical_profile.general.weight_kg} kg`" class="p-1" />
            <Label row="1" col="0" :text="`肤色: ${character.physical_profile.general.skin_tone}`" class="p-1" />
            <Label row="1" col="1" :text="`瞳色: ${character.physical_profile.general.eye_color}`" class="p-1" />
            <Label row="2" col="0" :text="`发色: ${character.physical_profile.general.hair_color}`" class="p-1" />
            <Label row="2" col="1" :text="`体型: ${character.physical_profile.general.body_type}`" class="p-1" />
            <Label row="3" colSpan="2" :text="`发型: ${character.physical_profile.general.hair_style}`" class="p-1" />
          </GridLayout>
          
          <Label text="特征" class="font-bold text-lg mt-3 mb-2" />
          <WrapLayout>
            <Label 
              v-for="(feature, index) in character.physical_profile.general.distinguishing_features" 
              :key="`feature-${index}`"
              :text="feature"
              class="px-2 py-1 m-1 bg-blue-500 text-white rounded-full text-sm" />
          </WrapLayout>
        </StackLayout>

        <StackLayout class="mt-3">

          <GridLayout columns="*, auto" @tap="isWardrobeExpanded = !isWardrobeExpanded" class="p-2 -mx-2">
            <Label col="0" text="着装风格" class="font-bold text-lg" />

            <Label col="1" :text="isWardrobeExpanded ? '收起 ▲' : '展开 ▼'" class="text-sm text-gray-500" />
          </GridLayout>

          <StackLayout v-if="isWardrobeExpanded" class="mt-2 space-y-3">
            <StackLayout v-for="(items, key) in character.physical_profile.wardrobe_style" :key="key">
              <Label :text="getWardrobeTitle(key as string)" class="font-semibold text-base" />
              <WrapLayout class="mt-1">
                <Label 
                  v-for="(item, index) in items" 
                  :key="`${key}-${index}`"
                  :text="item"
                  class="px-2 py-1 m-1 bg-gray-200 rounded-md text-sm" />
              </WrapLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>

        <StackLayout class="mt-3">
          <GridLayout columns="*, auto" @tap="isAnatomyExpanded = !isAnatomyExpanded" class="p-2 -mx-2">
            <Label col="0" text="身体细节" class="font-bold text-lg" />
            <Label col="1" :text="isAnatomyExpanded ? '收起 ▲' : '展开 ▼'" class="text-sm text-gray-500" />
          </GridLayout>

          <StackLayout v-if="isAnatomyExpanded" class="mt-2 space-y-3">

            <StackLayout class="p-3 bg-white rounded-lg">
              <Label text="✨ 感官与声音" class="text-lg font-bold mb-2" />
              <Label :text="'体香: ' + character.physical_profile.sensory_details.natural_scent" textWrap="true" class="mb-1" />
              <Label :text="'声音: ' + character.physical_profile.sensory_details.vocal_profile.speaking_voice" textWrap="true" class="mb-1" />
              <Label :text="'呻吟: ' + character.physical_profile.sensory_details.vocal_profile.moan_style" textWrap="true" />
            </StackLayout>

            <StackLayout height="6" />

            <StackLayout class="p-3 bg-white rounded-lg space-y-2">
              <Label text="🍒 胸部" class="text-lg font-bold" />
              <StackLayout class="border-b border-gray-300" />
              <GridLayout columns="*, *">
                <Label col="0" :text="'罩杯: ' + character.physical_profile.sexual_anatomy.breasts.cup_size" />
                <Label col="1" :text="'形状: ' + character.physical_profile.sexual_anatomy.breasts.shape" class="text-right" />
              </GridLayout>
              <GridLayout columns="*, *">
                <Label col="0" :text="'乳晕大小: ' + character.physical_profile.sexual_anatomy.breasts.areola_size" />
                <Label col="1" :text="'乳头类型: ' + character.physical_profile.sexual_anatomy.breasts.nipple_type" class="text-right" />
              </GridLayout>
              <GridLayout columns="auto, *, auto" class="align-middle">
                <Label col="0" text="紧实度:" class="w-24" />
                <FlexboxLayout col="1" class="mx-2 align-middle">
                  <StackLayout v-for="n in 10" :key="n" :class="n <= Number(character.physical_profile.sexual_anatomy.breasts.firmness) ? 'bg-pink-400' : 'bg-gray-200'" class="flex-1 h-2 rounded-full mx-px" />
                </FlexboxLayout>
                <Label col="2" :text="character.physical_profile.sexual_anatomy.breasts.firmness + '/10'" class="text-sm text-gray-500" />
              </GridLayout>
            </StackLayout>

            <StackLayout class="p-3 bg-white rounded-lg space-y-2">
              <Label text="🌸 私密花园" class="text-lg font-bold" />
              <StackLayout class="border-b border-gray-300" />
              <Label :text="'外观: ' + character.physical_profile.sexual_anatomy.vagina.labia_shape" textWrap="true" />
              <GridLayout columns="*, auto">
                <Label col="0" :text="'颜色: ' + character.physical_profile.sexual_anatomy.vagina.labia_color" />
                <FlexboxLayout col="1" justifyContent="flex-end" class="align-middle">
                  <Label text="毛发:" class="mr-1" />
                  <Label :text="character.physical_profile.sexual_anatomy.pubic_hair_style" textWrap="true" />
                </FlexboxLayout>
              </GridLayout>
              <GridLayout columns="auto, *, auto" class="align-middle">
                <Label col="0" text="紧致度:" class="w-24" />
                <FlexboxLayout col="1" class="mx-2 align-middle">
                  <StackLayout v-for="n in 10" :key="n" :class="n <= Number(character.physical_profile.sexual_anatomy.vagina.baseline_tightness) ? 'bg-pink-400' : 'bg-gray-200'" class="flex-1 h-2 rounded-full mx-px" />
                </FlexboxLayout>
                <Label col="2" :text="character.physical_profile.sexual_anatomy.vagina.baseline_tightness + '/10'" class="text-sm text-gray-500" />
              </GridLayout>
              <GridLayout columns="auto, *, auto" class="align-middle">
                <Label col="0" text="爱液:" class="w-24" />
                <FlexboxLayout col="1" class="mx-2 align-middle">
                  <StackLayout v-for="n in 10" :key="n" :class="n <= Number(character.physical_profile.sexual_anatomy.vagina.baseline_lubrication) ? 'bg-pink-400' : 'bg-gray-200'" class="flex-1 h-2 rounded-full mx-px" />
                </FlexboxLayout>
                <Label col="2" :text="character.physical_profile.sexual_anatomy.vagina.baseline_lubrication + '/10'" class="text-sm text-gray-500" />
              </GridLayout>
              <GridLayout columns="auto, *, auto" class="align-middle">
                <Label col="0" text="敏感点:" class="w-24" />
                <FlexboxLayout col="1" class="mx-2 align-middle">
                  <StackLayout v-for="n in 10" :key="n" :class="n <= Number(character.physical_profile.sexual_anatomy.vagina.clitoris_sensitivity) ? 'bg-pink-400' : 'bg-gray-200'" class="flex-1 h-2 rounded-full mx-px" />
                </FlexboxLayout>
                <Label col="2" :text="character.physical_profile.sexual_anatomy.vagina.clitoris_sensitivity + '/10'" class="text-sm text-gray-500" />
              </GridLayout>
            </StackLayout>

            <StackLayout class="p-3 bg-white rounded-lg space-y-2">
              <Label text="🍑 身形与足部" class="text-lg font-bold" />
              <StackLayout class="border-b border-gray-300" />
              <GridLayout columns="*, *">
                <Label col="0" :text="'臀形: ' + character.physical_profile.sexual_anatomy.buttocks_shape" />
                <Label col="1" :text="'腰臀比: ' + character.physical_profile.sexual_anatomy.waist_hip_ratio" class="text-right" />
              </GridLayout>
              <GridLayout columns="*, *">
                <Label col="0" :text="'鞋码: EU ' + character.physical_profile.sexual_anatomy.feet.shoe_size_eu" />
                <Label col="1" :text="'脚型: ' + character.physical_profile.sexual_anatomy.feet.shape" class="text-right" />
              </GridLayout>
              <Label :text="'足部状态: ' + character.physical_profile.sexual_anatomy.feet.skin_condition" textWrap="true" />
              <GridLayout columns="auto, *, auto" class="align-middle mt-2">
                <Label col="0" text="后庭紧致:" class="w-24" />
                <FlexboxLayout col="1" class="mx-2 align-middle">
                  <StackLayout v-for="n in 10" :key="n" :class="n <= Number(character.physical_profile.sexual_anatomy.anus.tightness) ? 'bg-pink-400' : 'bg-gray-200'" class="flex-1 h-2 rounded-full mx-px" />
                </FlexboxLayout>
                <Label col="2" :text="character.physical_profile.sexual_anatomy.anus.tightness + '/10'" class="text-sm text-gray-500" />
              </GridLayout>
              <WrapLayout v-if="character.physical_profile.sexual_anatomy.anus.appearance_tags?.length">
                <Label 
                  v-for="(tag, index) in character.physical_profile.sexual_anatomy.anus.appearance_tags" 
                  :key="`anus-tag-${index}`"
                  :text="tag"
                  class="px-2 py-1 m-1 bg-gray-200 rounded-md text-sm" />
              </WrapLayout>
            </StackLayout>
          </StackLayout>
        </StackLayout>
        
      </StackLayout>

      <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">

        <GridLayout columns="*, auto" @tap="isSexualProfileExpanded = !isSexualProfileExpanded" class="p-2 -mx-2">
          <Label col="0" text="性偏好" class="text-xl font-bold" />
          <Label col="1" :text="isSexualProfileExpanded ? '收起 ▲' : '展开 ▼'" class="text-sm text-gray-500" />
        </GridLayout>

        <StackLayout v-if="isSexualProfileExpanded" class="mt-2 space-y-3">
          <StackLayout class="border-b border-gray-300" />

          <StackLayout>
            <Label text="TurnOns" class="font-bold text-lg mb-2" />
            <WrapLayout>
              <Label 
                v-for="(item, index) in character.sexual_profile.turn_ons" 
                :key="`turnon-${index}`"
                :text="item"
                class="px-2 py-1 m-1 bg-rose-500 text-white rounded-full text-sm" />
            </WrapLayout>
          </StackLayout>

          <StackLayout>
            <Label text="TurnDowns" class="font-bold text-lg mb-2" />
            <WrapLayout>
              <Label 
                v-for="(item, index) in character.sexual_profile.turn_offs" 
                :key="`turnoff-${index}`"
                :text="item"
                class="px-2 py-1 m-1 bg-sky-500 text-white rounded-full text-sm" />
            </WrapLayout>
          </StackLayout>

          <StackLayout>
            <GridLayout columns="auto, *" class="align-middle">
              <Label col="0" text="取向:" class="font-bold text-base" />
              <Label col="1" :text="character.sexual_profile.orientation" class="ml-2 text-base" />
            </GridLayout>

            <StackLayout class="mt-3">
              <Label text="倾向与癖好" class="font-bold text-lg mb-2" />
              <WrapLayout>
                <Label 
                  v-for="(item, index) in character.sexual_profile.kinks_and_fetishes.core" 
                  :key="`kink-core-${index}`"
                  :text="item"
                  class="px-2 py-1 m-1 bg-purple-600 text-white rounded-md text-sm font-semibold" />
              </WrapLayout>
              <WrapLayout class="mt-1">
                <Label 
                  v-for="(item, index) in character.sexual_profile.kinks_and_fetishes.secondary" 
                  :key="`kink-sec-${index}`"
                  :text="item"
                  class="px-2 py-1 m-1 bg-purple-400 text-white rounded-md text-sm" />
              </WrapLayout>
            </StackLayout>
          </StackLayout>

          <StackLayout class="p-3 bg-white rounded-lg space-y-3">
            <StackLayout>
              <Label text="💬 沟通风格" class="font-bold text-base" />
              <Label :text="character.sexual_profile.communication_style" textWrap="true" class="mt-1 text-gray-700" />
            </StackLayout>
            <StackLayout>
              <Label text="❤️‍🩹 后续关怀 (Aftercare)" class="font-bold text-base" />
              <Label :text="character.sexual_profile.aftercare_preference" textWrap="true" class="mt-1 text-gray-700" />
            </StackLayout>
          </StackLayout>
        </StackLayout>

      </StackLayout>

      <!-- Wellbeing 身心状态 -->
      <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
        <Label text="身心状态" class="text-xl font-bold" />
        <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

        <GridLayout v-for="(attr, index) in wellbeingAttributes" :key="'well-' + index" columns="auto, *, auto" class="mb-2">
          <Label col="0" :text="attr.label" class="w-24 text-base align-middle" />
          <Progress col="1" :value="attr.value" :maxValue="attr.max" :color="attr.color" class="align-middle" />
          <Label col="2" :text="`${attr.value} / ${attr.max}`" class="w-24 text-right text-sm text-gray-600 align-middle" />
        </GridLayout>

        <GridLayout columns="auto, *" class="mt-2">
          <Label col="0" text="已婚:" class="font-bold" />
          <Label col="1" :text="character.wellbeing.is_married ? '是' : '否'" />
        </GridLayout>

        <GridLayout columns="auto, *" class="mt-2">
          <Label col="0" text="怀孕:" class="font-bold" />
          <Label col="1" :text="character.wellbeing.is_pregnant ? '是' : '否'" />
        </GridLayout>

        <GridLayout v-if="character.wellbeing.is_pregnant" columns="auto, *" class="mt-2">
          <Label col="0" text="孕周:" class="font-bold" />
          <Label col="1" :text="character.wellbeing.gestation_weeks + ' 周'" />
        </GridLayout>
      </StackLayout>

      <!-- spacer removed: 统一使用父容器间距 -->

      <!-- Sexual Skill 性技巧 -->
      <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
        <Label text="性技巧" class="text-xl font-bold" />
        <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

        <GridLayout v-for="(attr, index) in sexualSkillAttributes" :key="'skill-' + index" columns="auto, *, auto" class="mb-2">
          <Label col="0" :text="attr.label" class="w-24 text-base align-middle" />
          <Progress col="1" :value="attr.value" :maxValue="attr.max" :color="attr.color" class="align-middle" />
          <Label col="2" :text="`${attr.value} / ${attr.max}`" class="w-24 text-right text-sm text-gray-600 align-middle" />
        </GridLayout>
      </StackLayout>

      <!-- spacer removed: 统一使用父容器间距 -->

      <!-- Body Development 身体开发 -->
      <StackLayout class="p-4 bg-gray-100 rounded-lg space-y-2">
        <Label text="身体开发" class="text-xl font-bold" />
        <StackLayout class="border-b border-gray-300 mt-2 mb-2" />

        <GridLayout columns="auto, *" class="mt-2">
          <Label col="0" text="是否处女:" class="font-bold" />
          <Label col="1" :text="character.body_development.is_virgin ? '是' : '否'" />
        </GridLayout>

        <GridLayout v-for="(attr, index) in bodyDevelopmentAttributes" :key="'dev-' + index" columns="auto, *, auto" class="mb-2">
          <Label col="0" :text="attr.label" class="w-24 text-base align-middle" />
          <Progress col="1" :value="attr.value" :maxValue="attr.max" :color="attr.color" class="align-middle" />
          <Label col="2" :text="`${attr.value} / ${attr.max}`" class="w-24 text-right text-sm text-gray-600 align-middle" />
        </GridLayout>

        <WrapLayout class="mt-2">
          <Label :text="'喷水解锁'" :class="character.body_development.squirting_unlocked ? 'px-2 py-1 m-1 bg-green-500 text-white rounded-full text-sm' : 'px-2 py-1 m-1 bg-gray-300 text-gray-700 rounded-full text-sm'" />
          <Label :text="'多次高潮解锁'" :class="character.body_development.multiple_orgasm_unlocked ? 'px-2 py-1 m-1 bg-green-500 text-white rounded-full text-sm' : 'px-2 py-1 m-1 bg-gray-300 text-gray-700 rounded-full text-sm'" />
        </WrapLayout>
      </StackLayout>

      </StackLayout>
    </ScrollView>
  </Page>
</template>

<script lang="ts" setup>
import { ref, computed } from 'nativescript-vue';
import AppHeader from './AppHeader.vue';
import type { Character } from '../../types/character';

const props = defineProps<{
  character: Character
}>();

const metricAttributes = computed(() => {
  // 安全检查：如果 character 数据还没加载好，返回空数组以防报错
  if (!props.character?.metrics) return [];
  
  return [
    { label: '信任', value: props.character.metrics.trust, color: '#4299e1' },       // 蓝色
    { label: '欲望', value: props.character.metrics.lust, color: '#e53e3e' },         // 红色
    { label: '妒忌', value: props.character.metrics.jealousy, color: '#9f7aea' }, // 紫色
    { label: '好感', value: props.character.metrics.affection, color: '#ed64a6' }, // 粉色
    { label: '堕落', value: props.character.metrics.corruption, color: '#718096' }, // 灰色
    { label: '顺从', value: props.character.metrics.submission, color: '#38b2ac' }  // 青色
  ];
});

const isWardrobeExpanded = ref(false);
const isAnatomyExpanded = ref(false);
const isSecretsExpanded = ref(false);
const isSexualProfileExpanded = ref(false);

const getWardrobeTitle = (key: string): string => {
  const titles: { [key: string]: string } = {
    daily_wear: '日常穿着',
    sleepwear: '居家睡衣',
    loungewear: '休闲服饰',
    dating_wear: '约会着装',
    underwear_preference: '内衣偏好',
  };
  return titles[key] || key;
};

const wellbeingAttributes = computed(() => {
  if (!props.character?.wellbeing) return [] as Array<{label: string; value: number; max: number; color: string}>;
  return [
    { label: '疲劳', value: props.character.wellbeing.fatigue, max: 100, color: '#718096' },
    { label: '压力', value: props.character.wellbeing.stress_level, max: 100, color: '#f59e0b' },
    { label: '身体健康', value: props.character.wellbeing.physical_health, max: 100, color: '#10b981' },
    { label: '精神稳定', value: props.character.wellbeing.mental_stability, max: 100, color: '#3b82f6' },
  ];
});

const sexualSkillAttributes = computed(() => {
  if (!props.character?.sexual_skill) return [] as Array<{label: string; value: number; max: number; color: string}>;
  return [
    { label: '持久力', value: props.character.sexual_skill.endurance, max: 100, color: '#ef4444' },
    { label: '敏感度', value: props.character.sexual_skill.responsiveness, max: 100, color: '#f472b6' },
    { label: '口技', value: props.character.sexual_skill.oral_proficiency, max: 100, color: '#8b5cf6' },
    { label: '手技', value: props.character.sexual_skill.manual_proficiency, max: 100, color: '#22c55e' },
    { label: '总评', value: props.character.sexual_skill.overall_proficiency, max: 100, color: '#0ea5e9' },
    { label: '诱惑', value: props.character.sexual_skill.seduction_proficiency, max: 100, color: '#f59e0b' },
  ];
});

const bodyDevelopmentAttributes = computed(() => {
  if (!props.character?.body_development) return [] as Array<{label: string; value: number; max: number; color: string}>;
  return [
    { label: '疼痛耐受', value: props.character.body_development.pain_tolerance, max: 100, color: '#6b7280' },
    { label: '后庭接受', value: props.character.body_development.anal_acceptance, max: 100, color: '#ef4444' },
    { label: '子宫敏感', value: props.character.body_development.womb_sensitivity, max: 100, color: '#f59e0b' },
    { label: 'G 点敏感', value: props.character.body_development.g_spot_sensitivity, max: 100, color: '#a78bfa' },
    { label: '阴蒂敏感', value: props.character.body_development.clitoris_sensitivity, max: 100, color: '#f472b6' },
  ];
});
</script>

<style>
.bg-gray-100 {
  background-color: #f3f4f6;
}
.rounded-lg {
  border-radius: 8;
}
.p-4 {
  padding: 16;
}
/* 统一 space-y-* 规则：给除第一个外的所有直接子元素添加上边距 */
.space-y-4 > * + * {
  margin-top: 16;
}
.space-y-3 > * + * {
  margin-top: 12;
}
.space-y-2 > * + * {
  margin-top: 8;
}
.text-2xl {
  font-size: 24;
}
.text-xl {
  font-size: 20;
}
.text-lg {
  font-size: 18;
}
.font-bold {
  font-weight: bold;
}
.text-center {
  text-align: center;
}
.italic {
  font-style: italic;
}
.mt-2 {
  margin-top: 8;
}
.mt-4 {
  margin-top: 16;
}
.text-gray-600 {
  color: #4b5563;
}
.mb-2 {
  margin-bottom: 8;
}
.mb-1 {
  margin-bottom: 4;
}
.w-24 {
  width: 96;
}
</style>
