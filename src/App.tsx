import type { VercelRequest, VercelResponse } from "@vercel/node";

const ANTHROPIC_API = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1500;

const WEB_SEARCH_TOOL = {
  type: "web_search_20250305",
  name: "web_search",
};

// Módulos que necesitan web search
const SEARCH_MODULES = ["lead_full", "market_intel"];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages, system, module: mod } = req.body;

  if (!messages || !system) {
    return res.status(400).json({ error: "Missing messages or system prompt" });
  }

  const useSearch = SEARCH_MODULES.includes(mod);

  try {
    const body: Record<string, unknown> = {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages,
    };

    if (useSearch) {
      body.tools = [WEB_SEARCH_TOOL];
    }

    let response = await callAnthropic(body);

    // Loop: si el modelo usa herramientas, procesar hasta obtener respuesta final
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter((b: any) => b.type === "tool_use");
      const toolResults = toolUseBlocks.map((block: any) => ({
        type: "tool_result",
        tool_use_id: block.id,
        content: block.input?.query
          ? `Búsqueda ejecutada: ${block.input.query}`
          : "Sin resultado",
      }));

      // Agregar respuesta del asistente y resultados al historial
      const updatedMessages = [
        ...messages,
        { role: "assistant", content: response.content },
        { role: "user", content: toolResults },
      ];

      body.messages = updatedMessages;
      response = await callAnthropic(body);
    }

    // Extraer solo los bloques de texto de la respuesta final
    const textContent = response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");

    return res.status(200).json({
      content: [{ type: "text", text: textContent }],
    });

  } catch (err: any) {
    console.error("Anthropic API error:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}

async function callAnthropic(body: Record<string, unknown>) {
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
