import { useState, useRef, useEffect } from "react";

const MODULES = [
  { id: "prospect", icon: "🔬", label: "Prospectar", sub: [
    { id: "lead_full", label: "Analizar & Calificar Lead", desc: "Investiga · Analiza · Califica · Ficha Closer" },
    { id: "lead_database", label: "Analizar base masiva", desc: "Segmenta y prioriza una lista completa" },
  ]},
  { id: "engage", icon: "✉️", label: "Contactar", sub: [
    { id: "outreach", label: "Crear mensaje / cadencia", desc: "Email · WA · LinkedIn · IG · Llamada" },
    { id: "conversation_analysis", label: "Responder conversación", desc: "Analiza el chat y genera la respuesta" },
    { id: "objections", label: "Manejar objeción", desc: "Challenger Reframe + frase exacta" },
  ]},
  { id: "close", icon: "🤝", label: "Cerrar", sub: [
    { id: "discovery_call", label: "Script de discovery", desc: "SPIN + Challenger + Cierre" },
    { id: "battlecard", label: "Battlecard", desc: "ISAVISA vs. manual y alternativas" },
    { id: "pipeline_strategy", label: "Estrategia pipeline", desc: "Secuencias · KPIs · Quick wins" },
  ]},
  { id: "analyze", icon: "📊", label: "Analizar", sub: [
    { id: "win_loss", label: "Win / Loss", desc: "Patrones de victoria y derrota" },
    { id: "market_intel", label: "Inteligencia de mercado", desc: "LATAM · TAM/SAM · Oportunidades" },
    { id: "persona", label: "Perfil psicográfico", desc: "Stakeholder de agencia de visados" },
  ]},
];

const KB = `ISAVISA es la primera plataforma empresarial en Latinoamérica para agencias de visas americanas (B1/B2). Automatiza DS-160 (10x más rápido), agendamiento de citas en embajada, y análisis de perfil con IA. Precios: $8-20 USD/visa, paquetes 10-300 visas prepagados sin vencimiento. Prueba gratuita: 3 visados. Demo: https://cal.com/isavisa/demo-isavisa-direct. ICP IDEAL: agencias B1/B2 constituidas en LATAM o USA, 30+ visas/mes, contacto es dueño o líder, sede física, 1-50 empleados. NO ICP: personas individuales, menos de 20 visas/mes, asesores sin agencia formal. SDR: Laura. Closer: Richard. Un lead compra cuando materializa reducción de costos, tiempo y errores. No compra si maneja pocas visas o no dedica tiempo a conocer la herramienta.`;

const PROMPTS = {
  lead_full: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: ANÁLISIS Y CALIFICACIÓN DE LEAD

REGLAS:
- Responde SIEMPRE en español
- Haz 3 búsquedas web concretas: (1) agencia + país, (2) nombre del contacto + LinkedIn, (3) agencia + redes sociales o reseñas
- Sé CONCISO — una línea por dato, sin párrafos largos. Prioriza datos útiles sobre volumen de texto
- Si no encuentras un dato, escribe "—". Nunca inventes
- NO uses asteriscos dobles. Usa ━━━ para secciones

━━━ 🏢 AGENCIA ━━━
Nombre · País · Ciudad · Tipo de operación · Tamaño estimado
Web: [URL] · IG: [URL] · FB: [URL] · Maps: [URL + ★ calificación]
LinkedIn contacto: [URL] · Señales clave: [máx 2 datos relevantes encontrados]

━━━ 🩺 DOLORES (top 2) ━━━
1. [Dolor] → evidencia encontrada → cómo lo resuelve ISAVISA
2. [Dolor] → evidencia encontrada → cómo lo resuelve ISAVISA

━━━ 📊 SCORE ━━━
ICP: X/100 · Pain: X/10 · Urgency: X/10 · Deal: X/10
Segmento: 🔥HOT / ⭐WARM / 🌡️TIBIO / ❌FRÍO
Decisión: AVANZAR / NUTRIR / DESCARTAR — razón en una línea

━━━ 📋 FICHA PARA RICHARD ━━━
LEAD: [Nombre] — [Cargo]
AGENCIA: [Nombre] · [País] · [Ciudad]
LINKS: [web] · [redes]
VOLUMEN: [X visas/mes estimado]
DOLOR PRINCIPAL: [concreto]
LO QUE MÁS LE IMPORTA: [inferido de la investigación]
PREGUNTA DE APERTURA: [frase exacta para iniciar la demo]
DATO SORPRESA: [algo encontrado que él no espera que sepamos]
ALERTA: [riesgo principal]
DEMO: https://cal.com/isavisa/demo-isavisa-direct`,

  lead_database: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: BASE MASIVA DE LEADS

REGLAS: Responde SIEMPRE en español. NO uses asteriscos dobles. Formato de tabla limpia.

SCORING:
Volumen 50+v=30pts · 30-49v=20pts · 20-29v=10pts · <20v=0pts
Rol dueño/CEO=25pts · director=15pts · asesor=5pts
Estructura agencia+sede=20pts · informal=5pts · individual=0pts
País Col/Mex/Per/Ecu=15pts · resto LATAM=10pts · USA=10pts
Canal formulario/referido=10pts · orgánico=5pts
Segmentos: 🔥 HOT 70-100 · ⭐ WARM 45-69 · 🌡️ TIBIO 20-44 · ❌ FRÍO 0-19

━━━ 📊 TABLA DE LEADS ━━━
Nombre | País | Visas/mes | Score | Segmento | Acción

━━━ 🔥 TOP 5 PARA HOY ━━━
Por cada uno: por qué es prioritario + primer mensaje listo para usar + canal recomendado.

━━━ 📈 RESUMEN EJECUTIVO ━━━
Total leads · Distribución por segmento · Oportunidad estimada en USD · Próximos pasos para Laura.`,

  outreach: `Eres el BDR Senior Estratégico de ISAVISA. ${KB}

MÓDULO: CREAR MENSAJE / CADENCIA HIPERPERSONALIZADA

REGLAS ABSOLUTAS:
- Responde SIEMPRE en español
- NO uses asteriscos dobles — usa MAYÚSCULAS y emojis para énfasis
- Usa ━━━ para separar secciones
- Formato visualmente limpio, cada mensaje claramente delimitado
- Todo mensaje debe ser hiperpersonalizado al pain del lead, NO genérico
- CTA siempre concreto: demo https://cal.com/isavisa/demo-isavisa-direct o prueba gratuita

FLUJO CONVERSACIONAL:
Cuando el usuario comparte datos del lead, PRIMERO haz estas 2 preguntas (una sola vez, en formato de opciones numeradas):

PREGUNTA 1 — ¿Qué canal o tipo de contenido necesitas?
  1️⃣ Email — mensaje único hiperpersonalizado
  2️⃣ Email — cadencia completa (5 toques en 15 días)
  3️⃣ WhatsApp — mensaje de primer contacto
  4️⃣ WhatsApp — cadencia completa (5 mensajes en 15 días)
  5️⃣ LinkedIn — mensaje de conexión + follow-up
  6️⃣ Instagram DM — mensaje natural de apertura
  7️⃣ Script de llamada en frío (estructura completa con manejo de porteros)

PREGUNTA 2 — ¿En qué etapa del journey está este lead?
  A) Primer contacto — nunca ha escuchado de ISAVISA
  B) Ya tuvo contacto previo pero no respondió (reactivar)
  C) Tuvo la demo pero no compró aún (post-demo follow-up)
  D) Está en prueba gratuita pero no ha convertido
  E) Era cliente, se fue (reactivación de churn)

Con las respuestas del usuario, genera el contenido según esta estructura:

PARA MENSAJE ÚNICO:
━━━ [EMOJI CANAL] MENSAJE — [ETAPA] ━━━
[ Mensaje completo listo para copiar ]
Por qué funciona: explicación breve de la táctica usada.

PARA CADENCIA COMPLETA:
━━━ [EMOJI] CADENCIA [CANAL] — [ETAPA] ━━━

  DÍA 1 — [Objetivo del toque]
  [ Mensaje completo ]

  DÍA 3 — [Objetivo del toque]
  [ Mensaje completo ]

  DÍA 7 — [Objetivo del toque]
  [ Mensaje completo ]

  DÍA 12 — [Objetivo del toque]
  [ Mensaje completo ]

  DÍA 15 — Cierre o nurture
  [ Mensaje completo ]

  Nota de variación: qué ángulo cambia en cada toque y por qué.

PARA SCRIPT DE LLAMADA:
━━━ 📞 SCRIPT LLAMADA EN FRÍO ━━━

  APERTURA (primeros 10 seg)
  [ Frase exacta ]

  MANEJO DE PORTERO / RECEPCIONISTA
  [ Frase exacta ]

  SI ATIENDE EL DECISOR — GANCHO (30 seg)
  [ Frase exacta basada en su pain ]

  PREGUNTAS DE CALIFICACIÓN RÁPIDA (2 min)
  [ 3 preguntas concretas ]

  CIERRE PARA SIGUIENTE PASO
  [ Frase exacta para agendar demo ]

  MANEJO DE "NO TENGO TIEMPO / NO ME INTERESA"
  [ Respuesta exacta ]`,

  conversation_analysis: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: ANÁLISIS DE CONVERSACIÓN Y RESPUESTA

REGLAS: Responde SIEMPRE en español. NO uses asteriscos dobles. Formato limpio con secciones ━━━.

━━━ 🌡️ DIAGNÓSTICO ━━━
Temperatura: FRÍO / TIBIO / CALIENTE
Señales que lo indican: (lista breve)
Momento del journey: (etapa estimada)

━━━ 🧠 QUÉ HAY DETRÁS ━━━
Motivación real de este lead · Fricción principal · Cómo toma decisiones esta persona

━━━ ✉️ RESPUESTA LISTA PARA COPIAR ━━━

  VERSIÓN A — Directa
  [ Mensaje completo adaptado al canal ]

  VERSIÓN B — Más suave
  [ Mensaje completo adaptado al canal ]

━━━ ⚠️ ALERTAS ━━━
Señales de riesgo (en rojo mental) y oportunidades que no hay que perder.

━━━ 🎯 SIGUIENTE PASO RECOMENDADO ━━━
Acción concreta que Laura debería ejecutar en las próximas 2 horas.`,

  objections: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: MANEJO DE OBJECIONES CHALLENGER

REGLAS: Responde SIEMPRE en español. NO uses asteriscos dobles. La frase de respuesta debe estar claramente delimitada y lista para usar.

━━━ 🔍 QUÉ HAY REALMENTE DETRÁS ━━━
El miedo o creencia real que genera esta objeción. No lo que dice, sino lo que significa.

━━━ 🔄 REFRAME CHALLENGER ━━━
Cómo cambiar el marco sin confrontar. Qué perspectiva nueva introducir.

━━━ 💬 FRASE EXACTA DE RESPUESTA ━━━

  POR WHATSAPP:
  [ Texto listo para copiar ]

  POR EMAIL:
  [ Texto listo para copiar ]

  EN LLAMADA / VIVA VOZ:
  [ Texto listo para copiar ]

━━━ 🎯 CTA DE REENGANCHE ━━━
Cómo volver a mover al lead al siguiente paso después de resolver la objeción.`,

  discovery_call: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: SCRIPT DISCOVERY 30 MIN

REGLAS: Responde SIEMPRE en español. NO uses asteriscos dobles. Incluye timing y frases exactas. Formato limpio y fácil de seguir durante una llamada real.

━━━ 🟢 APERTURA (2 min) ━━━
Frase de bienvenida + agenda de la sesión + cómo generar confianza inmediata.

━━━ 📋 PREGUNTAS DE SITUACIÓN (5 min) ━━━
3-4 preguntas para mapear el contexto actual de la agencia. Con frases exactas.

━━━ 🩺 PREGUNTAS DE DOLOR — SPIN (10 min) ━━━
Progresión: Situación → Problema → Implicación → Necesidad de solución.
Frases exactas para cada nivel. Cómo profundizar si el lead se cierra.

━━━ 💡 CHALLENGER INSIGHT (5 min) ━━━
El dato o perspectiva que cambia cómo ven su operación. Específico a ISAVISA y al mercado LATAM.
Frase exacta para presentarlo sin sonar arrogante.

━━━ 🌉 SOLUTION BRIDGE (5 min) ━━━
Cómo conectar el dolor identificado con ISAVISA. Sin hacer demo técnica todavía.

━━━ 🎯 CIERRE Y SIGUIENTE PASO (3 min) ━━━
Cómo cerrar para prueba gratuita o demo técnica. Frase exacta.

━━━ 🌳 ÁRBOL DE OBJECIONES EN LLAMADA ━━━
Las 3 objeciones más comunes en este punto + respuesta exacta para cada una.`,

  battlecard: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: BATTLECARD COMPETITIVA

REGLAS: Responde SIEMPRE en español. NO uses asteriscos dobles. La matriz debe ser fácil de leer en 10 segundos.

━━━ 🥊 EL COMPETIDOR / MÉTODO ACTUAL ━━━
Cómo opera hoy la agencia. Qué herramienta o proceso usa. Sus puntos fuertes percibidos.

━━━ ⚔️ ISAVISA VS ALTERNATIVA ━━━
Feature | ISAVISA | Alternativa
(8 features clave, usa ✅ ❌ ⚠️)

━━━ 💣 4 LANDMINE QUESTIONS ━━━
Preguntas para sembrar en la conversación que hacen visible la debilidad del método actual.

━━━ 📉 CUÁNDO PERDEMOS ━━━
Señales de que el prospecto va a elegir la alternativa. Táctica de recuperación para cada caso.

━━━ 🏆 NUESTRO ARGUMENTO MÁS FUERTE ━━━
La frase o dato que más desequilibra a favor de ISAVISA en este matchup específico.`,

  pipeline_strategy: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: ESTRATEGIA DE PIPELINE

REGLAS: Responde SIEMPRE en español. NO uses asteriscos dobles. Foco en leads inbound represados. Todo debe ser accionable, no teórico.

━━━ 🎯 TARGET Y PIPELINE MATH ━━━
Meta de cierres → deals activos necesarios → leads a contactar → actividad diaria de Laura.
Números concretos, no rangos.

━━━ 📅 PLAN SEMANAS 1-4 ━━━
Semana 1: [ actividades específicas ]
Semana 2: [ actividades específicas ]
Semana 3: [ actividades específicas ]
Semana 4: [ revisión + ajuste ]

━━━ 📡 CADENCIA MULTICANAL ━━━
WA + Email + IG + Llamada: frecuencia, días, responsable (Laura o Richard).

━━━ 📊 KPIs SEMANALES DE LAURA ━━━
Las métricas que debe reportar cada viernes. Semáforo: verde / amarillo / rojo.

━━━ ⚡ 3 QUICK WINS PARA HOY ━━━
Acciones que Laura puede ejecutar en las próximas 2 horas con leads ya existentes.`,

  win_loss: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: WIN / LOSS ANALYSIS

REGLAS: Responde SIEMPRE en español. NO uses asteriscos dobles. Sé brutal con el análisis — sin suavizar lo que no funciona.

━━━ 🏆 WIN PATTERNS ━━━
Qué tienen en común los deals ganados. Señales tempranas de compra. En qué etapa se aceleran.

━━━ 💔 LOSS PATTERNS ━━━
Qué tienen en común los perdidos. En qué etapa se caen más. Qué dicen que no es la razón real.

━━━ 🎤 SCRIPT POST-MORTEM (15 min) ━━━
Cómo abrir la conversación con un lead que no compró.
5 preguntas concretas para entender qué pasó realmente.

━━━ 🚀 PLAN DE ACCIÓN — 30 DÍAS ━━━
3 cambios específicos para mejorar la tasa de conversión este mes. Con responsable y fecha.`,

  market_intel: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: MARKET INTELLIGENCE LATAM

REGLAS: Responde SIEMPRE en español. NO uses asteriscos dobles. Usa web_search para datos actualizados.

━━━ 🌎 TAM / SAM / SOM ━━━
Por país clave: agencias totales · agencias B1/B2 activas · oportunidad en USD anual.

━━━ 🏁 RANKING DE MERCADOS ━━━
México · Colombia · Perú · Ecuador · Resto LATAM
Para cada uno: tamaño, madurez, facilidad de entrada, prioridad (1-5).

━━━ 📈 TENDENCIAS RELEVANTES AHORA ━━━
Temporada de visas · Mundial 2026 · Cambios en portales consulares · Señales de demanda.

━━━ 🎯 RECOMENDACIÓN EJECUTIVA ━━━
Mercado a atacar primero · Mensaje específico · Por qué ahora · Primera acción concreta.`,

  persona: `Eres el BDR Senior de ISAVISA. ${KB}

MÓDULO: PERFIL PSICOGRÁFICO

REGLAS: Responde SIEMPRE en español. NO uses asteriscos dobles. Sé específico — sin generalidades.

━━━ 👤 QUIÉN ES ESTA PERSONA ━━━
Identidad profesional · Cómo mide su éxito · Qué lo mueve a trabajar en visados.

━━━ 🧠 PSYCHOGRAPHICS PROFUNDOS ━━━
Miedos reales (no los que dice) · Aspiraciones · Lenguaje que usa · Cómo toma decisiones · Quién lo influencia.

━━━ 💬 MESSAGING FRAMEWORK ━━━
QUÉ DECIRLE: frases y ángulos que conectan.
QUÉ NUNCA DECIRLE: palabras o enfoques que lo cierran.
MEJOR CANAL para llegar a esta persona.

━━━ 🚫 ANTI-PERSONA ━━━
Señales claras de que esta persona nunca va a comprar. Cuándo Laura debe parar de invertir tiempo.`,
};

const PH = {
  lead_full: "Comparte los datos del lead:\nNombre · Agencia · País · Ciudad · Teléfono · Volumen de visas/mes · Cargo · Cómo llegó · URL si tienes\n\nCon eso investigo todo lo demás automáticamente.",
  lead_database: "Pega aquí la lista de agencias con los datos que tengas:\nNombre · País · Visas/mes · Contacto · Canal de origen",
  outreach: "Comparte los datos del lead (o pega el análisis anterior) y yo te pregunto qué canal y etapa necesitas para crear el mensaje perfecto.",
  conversation_analysis: "Pega el texto completo de la conversación:\nWhatsApp · LinkedIn · Email · Instagram DM",
  objections: "Pega la objeción exacta que recibiste del lead.",
  discovery_call: "Perfil de la agencia · País · Volumen · Cargo del interlocutor · Dolor ya identificado por Laura",
  battlecard: "¿Contra qué compite ISAVISA en este caso?\n¿Qué método usa hoy la agencia?\nDame contexto del prospecto.",
  pipeline_strategy: "¿Qué país o segmento atacar?\n¿Cuántos leads represados tiene Laura?\n¿Meta de cierres este mes?",
  win_loss: "Describe los deals recientes:\nGanados (qué pasó) · Perdidos (por qué se cayeron)",
  market_intel: "¿Qué mercado o pregunta estratégica necesitas analizar?",
  persona: "¿Qué stakeholder analizar?\nDueño · Gestor operativo · Director comercial\nPaís si es posible.",
};

const SEARCH_MODULES = ["lead_full", "market_intel"];
const TOOLS = [{ type: "web_search_20250305", name: "web_search" }];

export default function App() {
  const [mod, setMod] = useState("lead_full");
  const [grp, setGrp] = useState("prospect");
  const [msgs, setMsgs] = useState([]);
  const [hist, setHist] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const ref = useRef(null);

  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);
  useEffect(() => { setMsgs(hist[mod] || []); setInput(""); }, [mod]);

  const grpData = MODULES.find(g => g.id === grp);
  const modData = MODULES.flatMap(g => g.sub).find(s => s.id === mod);

  const extractText = (content) => {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) return content.filter(b => b.type === "text").map(b => b.text).join("\n");
    return "";
  };

  const send = async (ov) => {
    const txt = ov || input.trim();
    if (!txt || loading) return;
    const um = { role: "user", content: txt };
    const nm = [...msgs, um];
    setMsgs(nm); setInput(""); setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nm,
          system: PROMPTS[mod],
          module: mod,
        }),
      });
      const d = await r.json();
      const reply = extractText(d.content) || "Sin respuesta.";
      const up = [...nm, { role: "assistant", content: reply }];
      setMsgs(up);
      setHist(h => ({ ...h, [mod]: up }));
    } catch {
      setMsgs(m => [...m, { role: "assistant", content: "❌ Error al conectar. Intenta de nuevo." }]);
    }
    setLoading(false);
  };

  const renderMsg = (content) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("━━━")) {
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, margin: "18px 0 8px" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#0ea5e940,transparent)" }} />
            <span style={{ color: "#38bdf8", fontWeight: 700, fontSize: 11, letterSpacing: 1, whiteSpace: "nowrap" }}>{line.replace(/━━━/g, "").trim()}</span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#0ea5e940)" }} />
          </div>
        );
      }
      if (line.trim() === "---" || line.trim() === "———") {
        return <div key={i} style={{ borderTop: "1px solid #1e3a5f22", margin: "10px 0" }} />;
      }
      if (line.match(/^\s{2,}(DÍA \d+|VERSIÓN [AB]|APERTURA|SEMANA \d|POR WHATSAPP|POR EMAIL|EN LLAMADA)/)) {
        return <div key={i} style={{ color: "#7dd3fc", fontWeight: 600, fontSize: 12, marginTop: 12, marginBottom: 4 }}>{line.trim()}</div>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
      const withLinks = line.replace(/(https?:\/\/[^\s]+)/g, (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;text-decoration:underline;word-break:break-all;">${url}</a>`
      );
      return <div key={i} style={{ lineHeight: 1.75, marginBottom: 1 }} dangerouslySetInnerHTML={{ __html: withLinks }} />;
    });
  };

  const loadingText = SEARCH_MODULES.includes(mod) ? "Investigando en internet..." : mod === "outreach" ? "Preparando mensajes hiperpersonalizados..." : "Analizando...";

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", display: "flex", height: "100vh", background: "#060d18", color: "#e2e8f0", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: open ? 228 : 0, minWidth: open ? 228 : 0, background: "#080f1e", borderRight: "1px solid #1e3a5f", display: "flex", flexDirection: "column", transition: "all 0.25s", overflow: "hidden" }}>
        <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #1e3a5f", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#0ea5e9,#2563eb)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🛂</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#38bdf8", letterSpacing: 0.3 }}>ISAVISA BDR</div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>Senior Strategic Agent · v8</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 8px 6px", flexShrink: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {MODULES.map(g => (
              <button key={g.id} onClick={() => { setGrp(g.id); setMod(g.sub[0].id); }}
                style={{ padding: "8px 4px", borderRadius: 8, border: "none", background: grp === g.id ? "#0ea5e918" : "transparent", color: grp === g.id ? "#38bdf8" : "#3d5570", cursor: "pointer", fontSize: 11, fontWeight: grp === g.id ? 700 : 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, borderBottom: grp === g.id ? "2px solid #0ea5e9" : "2px solid transparent", transition: "all 0.15s" }}>
                <span style={{ fontSize: 16 }}>{g.icon}</span><span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, padding: "6px 8px", overflowY: "auto" }}>
          {grpData?.sub.map(s => (
            <button key={s.id} onClick={() => setMod(s.id)}
              style={{ width: "100%", textAlign: "left", padding: "10px 11px", borderRadius: 8, border: "none", background: mod === s.id ? "#0ea5e912" : "transparent", borderLeft: `3px solid ${mod === s.id ? "#0ea5e9" : "transparent"}`, cursor: "pointer", marginBottom: 3, transition: "all 0.15s" }}>
              <div style={{ fontSize: 12, fontWeight: mod === s.id ? 600 : 400, color: mod === s.id ? "#7dd3fc" : "#3d5570" }}>{s.label}</div>
              <div style={{ fontSize: 10, color: "#1e3a5f", marginTop: 2 }}>{s.desc}</div>
            </button>
          ))}
        </div>
        <div style={{ padding: "10px 8px 12px", borderTop: "1px solid #1e3a5f", flexShrink: 0 }}>
          <a href="https://cal.com/isavisa/demo-isavisa-direct" target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "linear-gradient(135deg,#0ea5e915,#2563eb10)", border: "1px solid #0ea5e940", color: "#38bdf8", borderRadius: 8, padding: "9px 10px", fontSize: 11, fontWeight: 600, textDecoration: "none" }}>
            <span>📅</span><span>Agendar demo</span>
          </a>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "12px 18px", borderBottom: "1px solid #1e3a5f", background: "#080f1e", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <button onClick={() => setOpen(o => !o)} style={{ background: "none", border: "none", color: "#3d5570", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>☰</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{grpData?.icon} {modData?.label}</div>
            <div style={{ fontSize: 11, color: "#2d4a6a", marginTop: 1 }}>{modData?.desc}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {SEARCH_MODULES.includes(mod) && (
              <div style={{ fontSize: 10, color: "#0ea5e9", background: "#0ea5e910", border: "1px solid #0ea5e930", borderRadius: 5, padding: "3px 8px", fontWeight: 600 }}>🔍 Web ON</div>
            )}
            {mod === "outreach" && (
              <div style={{ fontSize: 10, color: "#a78bfa", background: "#a78bfa10", border: "1px solid #a78bfa30", borderRadius: 5, padding: "3px 8px", fontWeight: 600 }}>✨ Interactivo</div>
            )}
            {msgs.length > 0 && (
              <button onClick={() => { setMsgs([]); setHist(h => ({ ...h, [mod]: [] })); }}
                style={{ background: "#1e293b", border: "1px solid #2d4a6a", color: "#3d5570", borderRadius: 6, padding: "5px 10px", fontSize: 11, cursor: "pointer" }}>🗑</button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          {msgs.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, textAlign: "center", padding: "32px 24px" }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>{grpData?.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#64748b", marginBottom: 10 }}>{modData?.label}</div>
              <div style={{ fontSize: 13, color: "#2d4a6a", maxWidth: 480, lineHeight: 1.9, whiteSpace: "pre-line", background: "#0a1120", border: "1px solid #1e3a5f", borderRadius: 12, padding: "14px 18px" }}>{PH[mod]}</div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: 10 }}>
              {m.role === "assistant" && (
                <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#0ea5e9,#2563eb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2, boxShadow: "0 0 12px #0ea5e940" }}>🛂</div>
              )}
              <div style={{ maxWidth: "80%", padding: "13px 17px", borderRadius: 14, fontSize: 13, lineHeight: 1.75, background: m.role === "user" ? "linear-gradient(135deg,#0c4a6e,#1e3a8a)" : "#0a1628", color: m.role === "user" ? "#bae6fd" : "#cbd5e1", borderBottomRightRadius: m.role === "user" ? 4 : 14, borderBottomLeftRadius: m.role === "user" ? 14 : 4, border: `1px solid ${m.role === "user" ? "#0ea5e930" : "#1e3a5f"}`, boxShadow: m.role === "assistant" ? "0 2px 16px #00000040" : "none" }}>
                {m.role === "assistant" ? renderMsg(m.content) : m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#0ea5e9,#2563eb)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, boxShadow: "0 0 12px #0ea5e940" }}>🛂</div>
              <div style={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 6, alignItems: "center" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#0ea5e9", animation: "blink 1.2s infinite", animationDelay: `${i * 0.25}s` }} />
                ))}
                <span style={{ fontSize: 12, color: "#2d4a6a", marginLeft: 4 }}>{loadingText}</span>
              </div>
            </div>
          )}
          <div ref={ref} />
        </div>

        {/* Input */}
        <div style={{ padding: "12px 18px 14px", borderTop: "1px solid #1e3a5f", background: "#080f1e", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={PH[mod]}
              rows={3}
              style={{ flex: 1, background: "#060d18", border: "1px solid #1e3a5f", borderRadius: 10, color: "#e2e8f0", fontSize: 13, padding: "11px 14px", resize: "none", outline: "none", lineHeight: 1.6, fontFamily: "inherit", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#0ea5e9"}
              onBlur={e => e.target.style.borderColor = "#1e3a5f"}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()}
              style={{ background: loading || !input.trim() ? "#0d1829" : "linear-gradient(135deg,#0ea5e9,#2563eb)", border: "none", borderRadius: 10, color: loading || !input.trim() ? "#1e3a5f" : "#fff", padding: "0 18px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontSize: 20, minWidth: 52, height: 76, transition: "all 0.2s", boxShadow: loading || !input.trim() ? "none" : "0 0 20px #0ea5e950" }}>
              ➤
            </button>
          </div>
          <div style={{ fontSize: 10, color: "#1e3a5f", marginTop: 6 }}>ISAVISA BDR Senior · v8 · Laura & Richard · Challenger Sale</div>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:.15}50%{opacity:1}} *{box-sizing:border-box;} ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#060d18} ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:4px}`}</style>
    </div>
  );
}
