/**
 * groqClient.js
 * Thin wrapper around Groq's OpenAI-compatible /chat/completions endpoint.
 * Supports streaming (Server-Sent Events) for word-by-word rendering.
 *
 * Model: llama3-8b-8192 (fast, generous free tier)
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "qwen/qwen3.8-27b";

/**
 * CareSetu AI Doctor system prompt.
 * Safety-first, India-focused, concise.
 */
export const SYSTEM_PROMPT = `You are CareSetu AI Doctor — a safety-first medical assistant serving patients in Vadodara, India.

STRICT RULES:
1. If the user mentions ANY of these: chest pain, heart attack, stroke, can't breathe, unconscious, seizure, poisoning, overdose, heavy bleeding — your VERY FIRST line must be: "🚨 CALL 108 NOW — This is a medical emergency."
2. Give practical, compassionate health advice in simple, clear language. Hindi words mixed in are fine.
3. NEVER diagnose a disease. Instead, say "This could be caused by..." and suggest seeing a real doctor.
4. Keep all responses under 200 words.
5. End every response with: "⚕️ Always consult a real doctor for proper diagnosis and treatment."
6. For non-emergency queries: suggest simple home remedies, OTC medicines available in India, and when to see a doctor.
7. Be warm and empathetic — many users may be scared or in pain.`;

/**
 * Streams a Groq chat completion response.
 *
 * @param {Array<{role: string, content: string}>} messages - Chat history (max 10)
 * @param {function(string): void} onChunk  - Called for each streamed text chunk
 * @param {function(string): void} onDone   - Called with the full response when complete
 * @param {function(Error): void}  onError  - Called on any error
 * @returns {AbortController} - Call .abort() to cancel mid-stream
 */
export function streamGroqResponse(messages, onChunk, onDone, onError) {
  const controller = new AbortController();
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    onError(new Error("Groq API key not configured. Add VITE_GROQ_API_KEY to .env"));
    return controller;
  }

  (async () => {
    try {
      const res = await fetch(GROQ_API_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            // Keep last 10 messages to stay within token limits
            ...messages.slice(-10),
          ],
          stream: true,
          temperature: 0.6,
          max_tokens: 512,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(`Groq API error ${res.status}: ${errBody}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last (possibly incomplete) line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const json = JSON.parse(trimmed.slice(6));
            const chunk = json.choices?.[0]?.delta?.content ?? "";
            if (chunk) {
              fullText += chunk;
              onChunk(chunk);
            }
          } catch {
            // Ignore malformed SSE lines
          }
        }
      }

      onDone(fullText);
    } catch (err) {
      if (err.name === "AbortError") return; // User cancelled — not an error
      onError(err);
    }
  })();

  return controller;
}

/**
 * Non-streaming fallback (used if streaming fails or for testing).
 */
export async function fetchGroqResponse(messages) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("Groq API key not configured.");

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages.slice(-10)],
      stream: false,
      temperature: 0.6,
      max_tokens: 512,
    }),
  });

  if (!res.ok) throw new Error(`Groq API error ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
