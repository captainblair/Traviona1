import { resolveApiUrl } from './apiBase.js';

function buildAssistantConfigUrl() {
  return resolveApiUrl('/website/assistant/config/').toString();
}

function buildAssistantChatUrl() {
  return resolveApiUrl('/website/assistant/chat/').toString();
}

export async function fetchAssistantConfig() {
  const response = await fetch(buildAssistantConfigUrl());
  if (!response.ok) {
    throw new Error(`Assistant config failed (${response.status})`);
  }
  return response.json();
}

/**
 * Streams assistant replies via SSE-style chunks from the Django backend.
 */
export async function streamAssistantChat(messages, { onDelta, onDone, onError, signal } = {}) {
  const response = await fetch(buildAssistantChatUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!response.ok) {
    const message = `Assistant request failed (${response.status})`;
    onError?.(message);
    throw new Error(message);
  }

  if (!response.body) {
    onError?.('Streaming is not supported in this browser.');
    throw new Error('Streaming is not supported');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data:')) {
        continue;
      }

      try {
        const payload = JSON.parse(line.slice(5).trim());
        if (payload.error) {
          onError?.(payload.error);
        }
        if (payload.delta) {
          onDelta?.(payload.delta);
        }
        if (payload.done) {
          onDone?.();
        }
      } catch {
        // Ignore malformed SSE chunks.
      }
    }
  }

  onDone?.();
}

export const defaultStarterQuestions = [
  'What services do you offer?',
  'Tell me about latest geopolitical trends',
  'How can I join the talent network?',
];
