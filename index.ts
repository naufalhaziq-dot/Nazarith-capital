// ============================================================================
// NAZARITH CAPITAL V8.0 — SUPABASE EDGE FUNCTION: AI TRADING ANALYST
// Secure AI Proxy: Keeps external AI API keys safe on server-side.
// Deploy to Supabase: `supabase functions deploy ai-analyst`
// ============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Verify User Authentication via Supabase JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse payload from request
    const { tradesSummary, question, provider = "groq" } = await req.json();

    if (!tradesSummary) {
      return new Response(JSON.stringify({ error: "Trades summary data is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Choose configured AI Provider (Groq / OpenAI / Gemini) from secure environment variables
    const groqKey = Deno.env.get("GROQ_API_KEY");
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    let aiResponseText = "";

    const systemPrompt = `You are Nazarith Capital's Chief Trading Analytics Engineer and Institutional Risk Officer.
Your objective is to provide objective, mathematical, and psychology-aware insights based STRICTLY on the trader's actual trade history data.
Never fabricate statistics. Highlight true edge, highest expectancy setups, risk inconsistencies, cost of psychological mistakes, and overtrading tendencies.
Keep responses disciplined, concise, structured with Markdown, and tone institutional.`;

    const userPrompt = `Trader's Actual Quantitative Metrics & History:
${JSON.stringify(tradesSummary, null, 2)}

Trader's Query / Request:
${question || "Provide a comprehensive institutional audit: identify my greatest statistical edge, my most costly mistake, and 3 high-priority execution rules for next week."}`;

    if (groqKey && provider === "groq") {
      const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 1200,
        }),
      });
      const data = await resp.json();
      aiResponseText = data.choices?.[0]?.message?.content || "No analysis generated.";
    } else if (openAiKey && provider === "openai") {
      const resp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
        }),
      });
      const data = await resp.json();
      aiResponseText = data.choices?.[0]?.message?.content || "No analysis generated.";
    } else {
      // Fallback response if external AI keys have not been configured yet
      aiResponseText = `### NAZARITH STATISTICAL INTELLIGENCE AUDIT (Local Engine)
*Note: External AI Edge Function is active, but no API Key (GROQ_API_KEY or OPENAI_API_KEY) was configured in Supabase secrets yet.*

Based on your actual recorded dataset:
- **Sample Size Analyzed**: ${tradesSummary.totalTrades || 0} trades (${tradesSummary.winRate || 0}% Win Rate).
- **Expectancy**: ${tradesSummary.expectancy || "$0.00"} per closed trade.
- **Profit Factor**: ${tradesSummary.profitFactor || "0.00"}.
- **Dominant Mistake**: ${tradesSummary.topMistake || "None recorded"}.

**Recommendation**: Configure \`GROQ_API_KEY\` or \`OPENAI_API_KEY\` via \`supabase secrets set\` to enable natural language institutional diagnostics.`;
    }

    return new Response(JSON.stringify({ analysis: aiResponseText, provider }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
