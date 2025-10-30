import type { Character } from '../../types/character';
import type { Protagonist } from '../../types/protagonist';

export function buildInitialSystemPrompt(character: Character, protagonist: Protagonist | null, extraSystemPrompt: string): string {
  const ci = character.core_identity;
  const charName = `${ci.last_name}${ci.first_name}`;
  const charProfile = `角色信息：\n- 姓名：${charName}\n- 年龄：${ci.age}\n- 职业：${ci.occupation}\n- 与主角关系：${ci.protagonist_relationship}`;
  const pro = protagonist;
  const proName = pro ? `${pro.basic_description.last_name}${pro.basic_description.first_name}` : '（主角未加载）';
  const proProfile = pro ? `主角信息：\n- 姓名：${proName}\n- 职业：${pro.basic_description.occupation}\n- 是否已婚：${pro.basic_description.is_married ? '是' : '否'}` : `主角信息：${proName}`;
  const replyFormat = `回复要求：\n- 使用中文，口吻自然，第一人称。\n- 贴合角色设定，避免机械化。\n- 每次回复不超过 200 字。\n- 如涉及隐私或不当内容，委婉规避并引导到合适话题。`;
  const roleAssign = `你需要扮演 ${charName}，在对话中保持其性格与背景设定。`;

  const segments = [
    extraSystemPrompt?.trim() ? `系统设定：\n${extraSystemPrompt.trim()}` : '',
    roleAssign,
    charProfile,
    proProfile,
    replyFormat,
  ].filter(Boolean);

  return segments.join('\n\n');
}