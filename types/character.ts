// 这个文件定义了“人物”数据在我们的应用中的标准结构。

// 为了类型清晰，我们为每个嵌套对象定义一个接口
export interface CoreIdentity {
  age: number;
  nickname: string;
  birthdate: string;
  last_name: string;
  first_name: string;
  occupation: string;
  gender_identity: string;
  protagonist_relationship: string;
}

export interface PsychologicalProfile {
  flaws: string[];
  secrets: string[];
  virtues: string[];
  mbti_type: string;
}

export interface GeneralProfile {
  body_type: string;
  eye_color: string;
  height_cm: number;
  skin_tone: string;
  weight_kg: number;
  hair_color: string;
  hair_style: string;
  distinguishing_features: string[];
}

export interface SexualAnatomy {
  anus: { color: string; tightness: number; appearance_tags: string[] };
  feet: { shape: string; arch_type: string; shoe_size_eu: number; natural_scent: string; skin_condition: string; };
  vagina: { labia_color: string; labia_shape: string; baseline_tightness: number; baseline_lubrication: number; clitoris_sensitivity: number; };
  breasts: { shape: string; cup_size: string; firmness: number; areola_size: string; nipple_size: string; nipple_type: string; nipple_color: string; };
  buttocks_shape: string;
  waist_hip_ratio: number;
  pubic_hair_style: string;
}

export interface WardrobeStyle {
    sleepwear: string[];
    daily_wear: string[];
    loungewear: string[];
    dating_wear: string[];
    underwear_preference: string[];
}

export interface SensoryDetails {
    natural_scent: string;
    vocal_profile: {moan_style: string; speaking_voice: string};
}

export interface PhysicalProfile {
  general: GeneralProfile;
  sexual_anatomy: SexualAnatomy;
  wardrobe_style: WardrobeStyle;
  sensory_details: SensoryDetails;
}

export interface SexualProfile {
    turn_ons: string[];
    turn_offs: string[];
    orientation: string;
    kinks_and_fetishes: {core: string[]; secondary: string[]};
    communication_style: string;
    aftercare_preference: string;
}

export interface Metrics {
    lust: number;
    trust: number;
    jealousy: number;
    affection: number;
    corruption: number;
    submission: number;
}

export interface Wellbeing {
    fatigue: number;
    is_married: boolean;
    is_pregnant: boolean;
    stress_level: number;
    gestation_weeks: number;
    physical_health: number;
    mental_stability: number;
}

export interface SexualSkill {
    endurance: number;
    responsiveness: number;
    oral_proficiency: number;
    manual_proficiency: number;
    overall_proficiency: number;
    seduction_proficiency: number;
}

export interface BodyDevelopment {
    is_virgin: boolean;
    pain_tolerance: number;
    anal_acceptance: number;
    womb_sensitivity: number;
    g_spot_sensitivity: number;
    clitoris_sensitivity: number;
    squirting_unlocked: boolean;
    multiple_orgasm_unlocked: boolean;
}

// 注意：为了简洁，这里我只定义了两个嵌套接口作为示例。
// 在实际项目中，你会为 physical_profile, sexual_profile 等所有对象都创建接口。

// 这是我们最主要的人物模型接口
export interface Character {
  id: number;
  core_identity: CoreIdentity;
  psychological_profile: PsychologicalProfile;
  physical_profile: PhysicalProfile;
  sexual_profile: SexualProfile;
  metrics: Metrics;
  wellbeing: Wellbeing;
  sexual_skill: SexualSkill;
  body_development: BodyDevelopment;
}