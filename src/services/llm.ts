import type { ApiSetting } from '../../types/api-setting';
import type { ChatRole } from './data-service';

export type ChatMessagePayload = { role: ChatRole; content: string };

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

export async function chatCompletion(
  setting: ApiSetting,
  messages: ChatMessagePayload[],
  stream: boolean,
  onDelta?: (text: string) => void
): Promise<string> {
  // 目前仅支持 OpenAI 协议格式
  const base = normalizeBaseUrl(setting.base_url);
  const endpoint = `${base}/chat/completions`;
  const body: any = {
    model: setting.model,
    messages,
  };
  if (stream) {
    body.stream = true;
  }
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${setting.api_key}`,
      'Content-Type': 'application/json',
      ...(stream ? { 'Accept': 'text/event-stream' } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  if (stream && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // OpenAI SSE: 按 "data: ...\n\n" 分割
        const parts = chunk.split(/\n\n/);
        for (const part of parts) {
          const line = part.trim();
          if (!line) continue;
          if (line.startsWith('data:')) {
            const jsonText = line.slice(5).trim();
            if (jsonText === '[DONE]') {
              break;
            }
            try {
              const obj = JSON.parse(jsonText);
              const delta = obj?.choices?.[0]?.delta?.content
                ?? obj?.choices?.[0]?.text
                ?? '';
              if (delta) {
                accumulated += delta;
                if (onDelta) onDelta(delta);
              }
            } catch (_) {
              // 忽略无法解析的行
            }
          }
        }
      }
    } catch (e) {
      // 流式读取异常，向上抛出
      throw e;
    }
    return accumulated;
  }

  const data = await res.json();
  // 非流式：兼容通用 OpenAI 返回结构
  const content = data?.choices?.[0]?.message?.content
    ?? data?.choices?.[0]?.delta?.content
    ?? data?.choices?.[0]?.text
    ?? '';
  if (!content) throw new Error('LLM 返回内容为空');
  return content;
}