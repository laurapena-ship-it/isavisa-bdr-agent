const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1500;
const SEARCH_MODULES = ["lead_full", "market_intel"];

const WEB_SEARCH_TOOL = {
  type: "web_search_20250305",
  name: "web_search",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { messages, system, module: mod } = req.body;
  if (!messages || !system) return res.status(400).json({ error: "Missing messages or system" });

  const useSearch = SEARCH_MODULES.includes(mod);

  const buildBody = (msgs) => ({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system,
    messages: msgs,
    ...(useSearch && { tools: [WEB_SEARCH_TOOL] }),
  });

  try {
    let msgs = messages;
    let data = await callAnthropic(buildBody(msgs));

    // Loop de tool calls hasta obtener respuesta final de texto
    while (data.stop_reason === "tool_use") {
      const toolUseBlocks = data.content.filter((b) => b.type === "tool_use");
      const toolResults = toolUseBlocks.map((b) => ({
        type: "tool_result",
        tool_use_id: b.id,
        content: `Búsqueda: ${b.input?.query ?? "sin query"}`,
      }));

      msgs = [
        ...msgs,
        { role: "assistant", content: data.content },
        { role: "user", content: toolResults },
      ];

      data = await callAnthropic(buildBody(msgs));
    }

    // Extraer solo texto final
    const text = data.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return res.status(200).json({ content: [{ type: "text", text }] });

  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

async function callAnthropic(body) {
  const r = await fetch(ANTHROPIC_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "web-search-2025-03-05",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Anthropic ${r.status}: ${err}`);
  }

  return r.json();
}
