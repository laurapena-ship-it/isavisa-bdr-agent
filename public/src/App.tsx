import { useState, useRef, useEffect } from "react";

const ISAVISA_KB = `
[BASE DE CONOCIMIENTO — ISAVISA BDR SENIOR]

## QUÉ ES ISAVISA
ISAVISA es la primera plataforma empresarial en Latinoamérica creada EXCLUSIVAMENTE para agencias que gestionan visas americanas (B1/B2). Centraliza clientes y datos, acelera el llenado del DS-160 (10x más rápido), y automatiza búsqueda, agendamiento y reprogramación de citas de visado. Opera en Colombia, México, Perú, Ecuador, Venezuela, Brasil, Bolivia, Uruguay, Argentina, Chile, Paraguay, Panamá, Rep. Dominicana, Costa Rica, El Salvador, Guatemala y Honduras.

## MODELO DE PRECIOS
| Paquete | Visas | Precio/visa | Total |
|---------|-------|-------------|-------|
| Básico | 10 | $20 USD | $200 |
| Estándar | 30 | $17 USD | $510 |
| Popular ⭐ | 50 | $14 USD | $700 |
| Pro | 100 | $10 USD | $1,000 |
| Enterprise | 300 | $8 USD | $2,400 |
Prueba gratuita: 3 visados completos, sin límite de tiempo.

## FUNCIONALIDADES CORE
- Llenado automatizado DS-160 (10x más rápido)
- Creación automática de cuenta en portal de embajada
- Búsqueda y agendamiento automático de citas
- Reprogramación automática de citas
- Análisis de perfil con IA
- Validación automática de información
- Dashboard de seguimiento en tiempo real
- Trabajo colaborativo multiusuario simultáneo

## ICP OFICIAL
PERFIL IDEAL: Agencias de visados B1/B2 en LATAM, 10+ visas/mes, 1-50 empleados.
NEGATIVE: personas tramitando visa personal, agencias <5 visas/mes.

## OBJECIONES Y RESPUESTAS
- "Ya tenemos proceso manual" → "¿Cuántas horas semanales invierte tu equipo solo en DS-160?"
- "Es muy caro" → "¿Cuánto cuesta UN error en un DS-160? El manual cuesta más que $8-14/visa."
- "No tenemos tiempo" → "Implementación en menos de un día. La prueba gratuita no requiere compromiso."
`;

const MODULES = [
  {
    id: "prospect", icon: "🔬", label: "Prospectar",
    sub: [
      { id: "account_research", label: "Analizar cuenta", desc: "Snapshot · Pain · Messaging Matrix" },
      { id: "lead_database", label: "Analizar base/leads", desc: "Segmenta y califica una lista completa" },
      { id: "icp_qualify", label: "Calificar lead", desc: "ICP Score · BANT · MEDDIC" },
    ]
  },
  {
    id: "engage", icon: "✉️", label: "Contactar",
    sub: [
      { id: "outreach", label: "Crear mensaje", desc: "Email · LinkedIn · WhatsApp <100 palabras" },
      { id: "conversation_analysis", label: "Responder conversación", desc: "Analiza el chat y genera la respuesta" },
      { id: "objections", label: "Manejar objeción", desc: "Preemption + Challenger Reframe" },
    ]
  },
  {
    id: "close", icon: "🤝", label: "Cerrar",
    sub: [
      { id: "discovery_call", label: "Script de discovery", desc: "SPIN + Challenger + Cierre ISAVISA" },
      { id: "battlecard", label: "Battlecard", desc: "ISAVISA vs. manual y alternativas" },
      { id: "pipeline_strategy", label: "Estrategia pipeline", desc: "Secuencias · KPIs · Quick wins" },
    ]
  },
  {
    id: "analyze", icon: "📊", label: "Analizar",
    sub: [
      { id: "win_loss", label: "Win / Loss", desc: "Patrones de victoria y derrota" },
      { id: "market_intel", label: "Inteligencia de mercado", desc: "LATAM · TAM/SAM · Oportunidades" },
      { id: "persona", label: "Perfil psicográfico", desc: "Stakeholder de agencia de visados" },
    ]
  },
];

const BASE = `Eres el BDR Senior Estratégico de ISAVISA — la primera plataforma empresarial en Latinoamérica para agencias de visas americanas. Tienes profundo conocimiento del producto, del mercado de visados en LATAM, y de los dolores reales de las agencias. Tu enfoque es relevancia quirúrgica, análisis profundo y generación de pipeline de alta calidad.\n\n${ISAVISA_KB}\n\nREGLAS:\n- PROHIBIDO: "Espero que estés bien", frases genéricas, pitch en primer contacto\n- OBLIGATORIO: Primera frase al grano, máximo 100 palabras en emails, CTAs de baja fricción\n- Tono: Profesional, directo, Challenger Sale, empático con el dolor del operador de agencia\n- Responde en español con emojis para organizar visualmente\n- CTAs preferidos: demo 30 min → https://cal.com/isavisa/30min`;

const PROMPTS = {
  account_research: `${BASE}\nMÓDULO: Account Intelligence.\nEntrega:\n**1. 🏢 Account Snapshot** — perfil, tamaño, volumen estimado, señales\n**2. 🩺 Hypothesis of Pain** — dolor principal, coste de inacción, trigger más fuerte\n**3. 📣 Messaging Matrix** — mensaje para Dueño (ROI), Gestor (tiempo), Champion (visibilidad)\n**4. ❓ Killer Question** — pregunta que fuerce a cuantificar el dolor actual\n**5. 🎯 Multi-thread Strategy** — quién contactar primero, en qué canal`,
  lead_database: `${BASE}\nMÓDULO: Análisis de Base de Leads.\nMODO A — LEAD INDIVIDUAL: ICP Score (0-100), Pain Score, Urgency Score, Deal Score, Segmento (🔥/⭐/🌡️/❌), pain principal, mensaje recomendado.\nMODO B — LISTA: tabla | # | Empresa | País | ICP Score | Pain Score | Urgency | Deal Score | Segmento | Pain Principal | Canal | Siguiente Acción | + resumen ejecutivo con top 5 para contactar HOY.`,
  icp_qualify: `${BASE}\nMÓDULO: Calificación ICP + BANT + MEDDIC.\nEvalúa: ¿Gestiona visas B1/B2? Volumen, país, madurez digital, tamaño equipo. BANT completo. MEDDIC completo. DECISIÓN: ✅ AVANZAR / 🔄 NUTRIR / ❌ DESCARTAR con justificación.`,
  outreach: `${BASE}\nMÓDULO: Outreach Quirúrgico.\nEmail <100 palabras, asunto <8 palabras. LinkedIn 1er mensaje <300 chars sin pitch. WhatsApp natural.\nGenera secuencia 5 toques en 15 días: Día 1 LinkedIn, Día 3 Email, Día 6 LinkedIn caso éxito, Día 10 killer question, Día 15 WhatsApp.`,
  conversation_analysis: `${BASE}\nMÓDULO: Análisis de Conversación.\n1. 🔍 Diagnóstico — etapa, señal real, temperatura (🔥/🌡️/🧊/⚠️)\n2. 🧠 Psicografía rápida — perfil comunicacional, pain implícito\n3. ✉️ Respuesta exacta — lista para copiar, <100 palabras, CTA demo\n4. 🔄 Alternativas — Versión A (directa) y B (empática)\n5. ⚠️ Alertas — qué NO decir, cuándo hacer siguiente touchpoint`,
  objections: `${BASE}\nMÓDULO: Objeciones — Challenger Sale.\nPara cada objeción: Diagnóstico → Respuesta Challenger → Frase exacta entre comillas → CTA de reenganche.`,
  battlecard: `${BASE}\nMÓDULO: Battlecard ISAVISA.\nVs: proceso manual, Excel, herramientas genéricas. Incluye: resumen del competidor, matriz comparativa 8 features, 4 landmine questions, cuándo perdemos y cómo revertir.`,
  discovery_call: `${BASE}\nMÓDULO: Discovery Call Script — 30 min.\nOpening (2min) → Situation (5min) → Problem SPIN (10min) → Challenger Insight (5min) → Solution Bridge (5min) → Qualification (2min) → Close (3min). Frases exactas entre comillas, timing, árbol de objeciones.`,
  pipeline_strategy: `${BASE}\nMÓDULO: Pipeline Strategy.\nTarget, pipeline math (leads→demos→trials→cierres→revenue), secuencia semana 1-4, cadencia multicanal, KPIs, 3 quick wins ejecutables HOY.`,
  win_loss: `${BASE}\nMÓDULO: Win/Loss Analysis.\nWin patterns + Loss patterns + Interview script post-decisión (15 min) + Plan de acción: quick wins / cambios este mes / inversiones este trimestre.`,
  market_intel: `${BASE}\nMÓDULO: Market Intelligence LATAM.\nTAM/SAM/SOM agencias B1/B2. Priorización países. Tendencias que favorecen ISAVISA. Recomendación: qué mercado atacar primero.`,
  persona: `${BASE}\nMÓDULO: Perfil Psicográfico.\nIdentidad, psychographics profundos, perfil de decisión, messaging framework (palabras que resuenan / alejan / frase que detiene el scroll / CTA ideal), anti-persona.`,
};

const PLACEHOLDERS = {
  account_research: "Nombre de la agencia, ciudad, país, LinkedIn del dueño/gestor, o cualquier info disponible...",
  lead_database: "LEAD INDIVIDUAL: info de una agencia.\n\nBASE DE DATOS: pega tabla o lista con múltiples agencias.",
  conversation_analysis: "Pega el texto completo de la conversación (WhatsApp, LinkedIn, email)...",
  icp_qualify: "Nombre de la agencia, país, volumen estimado visas/mes, cargo del contacto...",
  outreach: "Canal, nombre y cargo del prospecto, agencia, país, volumen estimado, trigger detectado...",
  objections: "Pega la objeción exacta recibida...",
  battlecard: "¿Contra qué compites? (manual, Excel, otra herramienta). Dame detalles del prospecto.",
  discovery_call: "Perfil de la agencia, país, volumen estimado, cargo del interlocutor...",
  pipeline_strategy: "¿Qué país/segmento atacar? ¿En cuánto tiempo? ¿Cuántos cierres buscas?",
  win_loss: "Describe deals recientes ganados o perdidos: agencia, país, tamaño, por qué compraron o se fueron...",
  market_intel: "¿Qué mercado o país analizar? ¿Qué pregunta estratégica necesitas responder?",
  persona: "¿Qué stakeholder perfilar? Dueño, gestor operativo, director comercial. Especifica país si es posible.",
};

export default function ISAVISABDRAgent() {
  const [activeModule, setActiveModule] = useState("account_research");
  const [activeGroup, setActiveGroup] = useState("prospect");
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { setMessages(history[activeModule] || []); setInput(""); }, [activeModule]);

  const activeMod = MODULES.flatMap(g => g.sub).find(s => s.id === activeModule);
  const activeGroupData = MODULES.find(g => g.id === activeGroup);

  const sendMessage = async (override) => {
    const content = override || input.trim();
    if (!content || loading) return;
    if (!apiKey) { setShowKeyInput(true); return; }
    const userMsg = { role: "user", content };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST"
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, system: PROMPTS[activeModule], messages: newMsgs }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Sin respuesta.";
      const updated = [...newMsgs, { role: "assistant", content: reply }];
      setMessages(updated);
      setHistory(h => ({ ...h, [activeModule]: updated }));
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "❌ Error de conexión. Verifica tu API key." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#060d18", color: "#e2e8f0", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>

      {/* API Key Modal */}
      {showKeyInput && (
        <div style={{ position: "fixed", inset: 0, background: "#000000dd", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#0a1120", border: "1px solid #1e3a5f", borderRadius: 16, width: "min(480px, 94vw)", padding: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>🔑 Anthropic API Key</div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 16, lineHeight: 1.6 }}>
              Necesitas una API key de Anthropic para usar el BDR Agent.<br/>
              Obtén la tuya en <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" style={{ color: "#38bdf8" }}>console.anthropic.com</a>
            </div>
            <input
              type="password"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              style={{ width: "100%", background: "#060d18", border: "1px solid #1e3a5f", borderRadius: 8, color: "#e2e8f0", fontSize: 13, padding: "10px 12px", outline: "none", boxSizing: "border-box", marginBottom: 12 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { if (apiKey.startsWith("sk-")) setShowKeyInput(false); }} style={{ flex: 1, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", border: "none", color: "#fff", borderRadius: 8, padding: "10px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                Guardar y continuar
              </button>
              <button onClick={() => setShowKeyInput(false)} style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "10px 16px", cursor: "pointer", fontSize: 12 }}>
                Cancelar
              </button>
            </div>
            <div style={{ fontSize: 10, color: "#334155", marginTop: 10 }}>La key se guarda solo en memoria del navegador, no se envía a ningún servidor externo salvo Anthropic.</div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 220 : 0, minWidth: sidebarOpen ? 220 : 0, background: "#0a1120", borderRight: "1px solid #1e3a5f", display: "flex", flexDirection: "column", transition: "all 0.25s", overflow: "hidden" }}>
        <div style={{ padding: "14px 14px 12px", borderBottom: "1px solid #1e3a5f", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>🛂</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#38bdf8" }}>ISAVISA BDR</div>
              <div style={{ fontSize: 10, color: "#475569" }}>Senior Strategic Agent</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "10px 8px 6px", flexShrink: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {MODULES.map(g => (
              <button key={g.id} onClick={() => { setActiveGroup(g.id); setActiveModule(g.sub[0].id); }}
                style={{ padding: "7px 4px", borderRadius: 7, border: "none", background: activeGroup === g.id ? "#0ea5e920" : "transparent", color: activeGroup === g.id ? "#38bdf8" : "#475569", cursor: "pointer", fontSize: 11, fontWeight: activeGroup === g.id ? 700 : 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, borderBottom: activeGroup === g.id ? "2px solid #0ea5e9" : "2px solid transparent" }}>
                <span style={{ fontSize: 15 }}>{g.icon}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, padding: "4px 8px", overflowY: "auto" }}>
          {activeGroupData?.sub.map(s => (
            <button key={s.id} onClick={() => setActiveModule(s.id)} style={{ width: "100%", textAlign: "left", padding: "9px 10px", borderRadius: 8, border: "none", background: activeModule === s.id ? "#0ea5e915" : "transparent", borderLeft: `3px solid ${activeModule === s.id ? "#0ea5e9" : "transparent"}`, cursor: "pointer", marginBottom: 2 }}>
              <div style={{ fontSize: 12, fontWeight: activeModule === s.id ? 600 : 400, color: activeModule === s.id ? "#7dd3fc" : "#64748b" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>{s.desc}</div>
            </button>
          ))}
        </div>

        <div style={{ padding: "10px 8px", borderTop: "1px solid #1e3a5f", flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={() => setShowKeyInput(true)} style={{ width: "100%", background: "#fbbf2420", border: "1px solid #fbbf2433", color: "#fbbf24", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <span>🔑</span><span>{apiKey ? "API Key ✓" : "Configurar API Key"}</span>
          </button>
          <a href="https://cal.com/isavisa/30min" target="_blank" rel="noopener noreferrer" style={{ width: "100%", background: "#0ea5e915", border: "1px solid #0ea5e933", color: "#38bdf8", borderRadius: 8, padding: "8px 10px", cursor: "pointer", fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, textDecoration: "none" }}>
            <span>📅</span><span>Agendar demo</span>
          </a>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "11px 18px", borderBottom: "1px solid #1e3a5f", background: "#0a1120", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 18 }}>☰</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{activeGroupData?.icon} {activeMod?.label}</div>
            <div style={{ fontSize: 11, color: "#334155", marginTop: 1 }}>{activeMod?.desc}</div>
          </div>
          {messages.length > 0 && (
            <button onClick={() => { setMessages([]); setHistory(h => ({ ...h, [activeModule]: [] })); }}
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#64748b", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>🗑</button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", padding: "24px 20px" }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>{activeGroupData?.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#94a3b8", marginBottom: 6 }}>{activeMod?.label}</div>
              <div style={{ fontSize: 13, color: "#334155", maxWidth: 440, lineHeight: 1.7 }}>{PLACEHOLDERS[activeModule]}</div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: 8 }}>
              {m.role === "assistant" && (
                <div style={{ width: 26, height: 26, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginTop: 2 }}>🛂</div>
              )}
              <div style={{ maxWidth: "78%", padding: "10px 14px", borderRadius: 12, fontSize: 13, lineHeight: 1.7, background: m.role === "user" ? "linear-gradient(135deg, #0ea5e9, #1d4ed8)" : "#0d1829", color: m.role === "user" ? "#fff" : "#cbd5e1", borderBottomRightRadius: m.role === "user" ? 4 : 12, borderBottomLeftRadius: m.role === "user" ? 12 : 4, border: m.role === "assistant" ? "1px solid #1e3a5f" : "none", whiteSpace: "pre-wrap" }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 26, height: 26, background: "linear-gradient(135deg, #0ea5e9, #2563eb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🛂</div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", animation: "blink 1.2s infinite", animationDelay: `${i*0.2}s` }} />)}
                <span style={{ fontSize: 12, color: "#334155", marginLeft: 6 }}>Analizando...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "12px 18px", borderTop: "1px solid #1e3a5f", background: "#0a1120", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={PLACEHOLDERS[activeModule]} rows={3}
              style={{ flex: 1, background: "#060d18", border: "1px solid #1e3a5f", borderRadius: 10, color: "#e2e8f0", fontSize: 13, padding: "10px 13px", resize: "none", outline: "none", lineHeight: 1.6, fontFamily: "inherit" }}
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{ background: loading || !input.trim() ? "#1e293b" : "linear-gradient(135deg, #0ea5e9, #2563eb)", border: "none", borderRadius: 10, color: "#fff", padding: "0 16px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize: 18, minWidth: 48, height: 74 }}>➤</button>
          </div>
          <div style={{ fontSize: 10, color: "#1e3a5f", marginTop: 5 }}>Enter para enviar · ISAVISA BDR Senior · Challenger Sale</div>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:.2}50%{opacity:1}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}`}</style>
    </div>
  );
}
