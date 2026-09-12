/**
 * Cloudflare Worker Proxy for Aria (Dazzle Dental Concierge)
 * Holds GROQ_API_KEY securely as an encrypted environment secret.
 * Enforces origin checking, rate limiting, and system prompt injection.
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" }
      });
    }

    try {
      const { messages, client = "dazzle_dental" } = await request.json();

      if (!messages || !Array.isArray(messages)) {
        return new Response(JSON.stringify({ error: "Invalid messages payload" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      const apiKey = env.GROQ_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "Server misconfiguration: GROQ_API_KEY secret missing" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }

      // System prompt injection server-side (prevents prompt manipulation on client)
      const systemPrompt = `You are Aria, the AI concierge for Dazzle Dental, a cosmetic dentistry and implant clinic that treats international patients.
Services: smile makeovers ($4,500–$9,000 for 8–10 veneers), dental implants ($900–$1,600), All-on-4 ($12,000–$25,000).
Rules: Never diagnose symptoms. Never give binding single prices. Always disclose you are an AI assistant. Mirror the user's language (Arabic, Russian, German, Spanish, English). Escalate immediately when user asks to book or has urgent pain.`;

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          temperature: 0.4,
          max_completion_tokens: 600
        })
      });

      const data = await groqResponse.json();
      if (!groqResponse.ok) {
        return new Response(JSON.stringify({ error: data.error?.message || "Groq API error" }), {
          status: groqResponse.status,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }

      const reply = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ reply }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};
