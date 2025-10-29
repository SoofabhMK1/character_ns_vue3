export interface ApiSetting {
  id?: number;
  name: string; // 显示名称
  platform: 'openai'; // 目前仅支持 OpenAI 协议
  base_url: string; // API 接口地址
  api_key: string; // API 密钥
  model: string; // 模型名称
  created_at?: string;
  updated_at?: string;
  is_default?: boolean; // 是否为默认连接
}