import type { ApiSetting } from '../../types/api-setting';
import type { ChatMessagePayload } from '../../types/chat';
import { isNativeAbortAvailable } from './abort-controller';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

export async function chatCompletion(
  setting: ApiSetting,
  messages: ChatMessagePayload[],
  stream: boolean,
  onDelta?: (text: string) => void,
  signal?: AbortSignal | { aborted: boolean }
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
    ...(isNativeAbortAvailable() && signal ? { signal: signal as AbortSignal } : {}),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  if (stream && res.body) {
    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulated = '';
    let finished = false;
    try {
      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;
        if (signal?.aborted) {
          try { await reader.cancel(); } catch {}
          finished = true;
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        // 处理尽可能多的完整 SSE 事件（以空行分隔）
        while (true) {
          // 兼容 \n\n 与 \r\n\r\n
          const idxLF = buffer.indexOf('\n\n');
          const idxCRLF = buffer.indexOf('\r\n\r\n');
          const idx = idxLF >= 0 && idxCRLF >= 0 ? Math.min(idxLF, idxCRLF) : (idxLF >= 0 ? idxLF : idxCRLF);
          if (idx < 0) break; // 没有完整事件，等待更多数据

          const event = buffer.slice(0, idx);
          buffer = buffer.slice(idx + (idx === idxLF ? 2 : 4));

          // 将事件按行拆分，拼接所有 data: 行
          const lines = event.split(/\r?\n/);
          let dataPayload = '';
          for (const ln of lines) {
            if (ln.startsWith('data:')) {
              // 去掉前缀并按规范拼接（支持多行 data）
              const part = ln.slice(5).trim();
              if (dataPayload.length) dataPayload += '\n';
              dataPayload += part;
            }
          }
          if (!dataPayload) continue;
          if (dataPayload === '[DONE]') { finished = true; break; }

          // OpenAI Chat Completions：每个事件 data 是 JSON
          try {
            const obj = JSON.parse(dataPayload);
            const choice = obj?.choices?.[0];
            const delta = choice?.delta?.content
              ?? choice?.message?.content
              ?? choice?.text
              ?? '';
            if (delta) {
              accumulated += delta;
              if (!signal?.aborted && onDelta) onDelta(delta);
            }
            // 有些片段只包含 role / function_call 等，忽略即可
          } catch (err) {
            // 有些第三方兼容端可能直接返回纯文本片段
            if (typeof dataPayload === 'string' && dataPayload.length) {
              accumulated += dataPayload;
              if (!signal?.aborted && onDelta) onDelta(dataPayload);
            }
          }
        }
      }
    } catch (e) {
      // 如果是主动取消，抛出中止错误给调用方处理
      throw e;
    }
    return accumulated;
  }

  // 流式回退：某些运行环境不支持 ReadableStream（如部分 NativeScript 实现）
  if (stream && !res.body) {
    const fullText = await res.text();
    let accumulated = '';
    // 以空行分割事件，逐个提取 data 负载
    const events = fullText.split(/\r?\n\r?\n/);
    for (const ev of events) {
      const lines = ev.split(/\r?\n/);
      let dataPayload = '';
      for (const ln of lines) {
        if (ln.startsWith('data:')) {
          const part = ln.slice(5).trim();
          if (dataPayload.length) dataPayload += '\n';
          dataPayload += part;
        }
      }
      if (!dataPayload) continue;
      if (dataPayload === '[DONE]') break;
      try {
        const obj = JSON.parse(dataPayload);
        const choice = obj?.choices?.[0];
        const delta = choice?.delta?.content
          ?? choice?.message?.content
          ?? choice?.text
          ?? '';
        if (delta) {
          accumulated += delta;
          if (onDelta) onDelta(delta);
        }
      } catch (_) {
        // 回退到直接文本
        accumulated += dataPayload;
        if (onDelta) onDelta(dataPayload);
      }
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