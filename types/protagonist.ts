// 主角信息的标准结构：基础属性与基础描述

export interface BaseAttributes {
  level: number;
  experience: number;
  experience_to_next_level: number;
  attribute_points_available: number;
  physique: number;
  dexterity: number;
  stamina: number;
  intellect: number;
  insight: number;
  charisma: number;
  oral_skill: number;
  manual_skill: number;
  endurance_control: number;
  anatomy_knowledge: number;
  rhythm_mastery: number;
  virility_level: number;
}

export interface BasicDescription {
  last_name: string;
  first_name: string;
  occupation: string;
  age?: number;
  is_married: boolean;
  has_children: boolean;
  physical_profile: {
    general: {
      body_type: string;
      height_cm: number;
    };
    sexual_anatomy: {
      penis: {
        girth_cm_erect: number;
        is_circumcised: boolean;
        appearance_tags: string[];
        length_cm_erect: number;
      };
    };
  };
  sexual_profile: {
    personal_kinks: {
      BDSM?: { role?: string; active: boolean };
      age_play?: { role?: string; active: boolean };
      praise_kink?: { active: boolean };
      [key: string]: any;
    };
    attraction_profile: {
      physical_types: string[];
      personality_archetypes: string[];
    };
  };
}

export interface Protagonist {
  id: number;
  base_attributes: BaseAttributes;
  basic_description: BasicDescription;
}