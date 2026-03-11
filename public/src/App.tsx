import { useState, useRef, useEffect } from "react";

const MODULES = [
  { id: "prospect", icon: "🔬", label: "Prospectar", sub: [
    { id: "account_research", label: "Analizar cuenta", desc: "Snapshot · Pain · Messaging Matrix" },
    { id: "lead_database", label: "Analizar base/leads", desc: "Segmenta y califica una lista completa" },
    { id: "icp_qualify", label: "Calificar lead", desc: "ICP Score · BANT · MEDDIC" },
  ]},
  { id: "engage", icon: "✉️", label: "Contactar", sub: [
    { id: "outreach", label: "Crear mensaje", desc: "Email · LinkedIn · WhatsApp" },
    { id: "conversation_analysis", label: "Responder conversación", desc: "Analiza el chat y genera la respuesta" },
    { id: "objections", label: "Manejar objeción", desc: "Preemption + Challenger Reframe" },
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

const KB = `ISAVISA es la primera plataforma empresarial en Latinoamérica para agencias de visas americanas (B1/B2). Automatiza DS-160 (10x más rápido), agendamiento de citas en embajada, y análisis de perfil con IA. Precios: $8-20 USD/visa, paquetes 10-300 visas prepagados sin vencimiento. Prueba gratuita: 3 visados. Demo: https://cal.com/isavisa/30min. ICP: agencias B1/B2 en LATAM, 10+ visas/mes, 1-50 empleados. ANTI-ICP: personas individuales, <5 visas/mes.`;

const BASE = `Eres el BDR Senior Estratégico de ISAVISA. ${KB} REGLAS: PROHIBIDO frases genéricas. Primera frase al grano. Emails <100 palabras. Tono Challenger Sale. Responde en español con emojis. CTA preferido: demo 30 min.`;

const PROMPTS: Record<string,string> = {
  account_research: `${BASE} MÓDULO Account Intelligence: 1.🏢 Snapshot 2.🩺 Hypothesis of Pain 3.📣 Messaging Matrix (Dueño/Gestor/Champion) 4.❓ Killer Question 5.🎯 Multi-thread Strategy`,
  lead_database: `${BASE} MÓDULO Leads: INDIVIDUAL→ ICP Score, Pain Score, Urgency, Deal Score, Segmento (🔥/⭐/🌡️/❌), pain, mensaje. LISTA→ tabla completa + resumen ejecutivo top 5 HOY.`,
  icp_qualify: `${BASE} MÓDULO Calificación: ICP+BANT+MEDDIC completo. DECISIÓN: ✅AVANZAR / 🔄NUTRIR / ❌DESCARTAR con justificación y próximos pasos.`,
  outreach: `${BASE} MÓDULO Outreach: Email <100 palabras, LinkedIn <300 chars sin pitch, WhatsApp natural. Secuencia 5 toques en 15 días.`,
  conversation_analysis: `${BASE} MÓDULO Conversación: 1.🔍Diagnóstico+temperatura 2.🧠Psicografía 3.✉️Respuesta exacta lista para copiar 4.🔄Versiones A y B 5.⚠️Alertas`,
  objections: `${BASE} MÓDULO Objeciones Challenger: Diagnóstico → Respuesta → Frase exacta entre comillas → CTA reenganche.`,
  battlecard: `${BASE} MÓDULO Battlecard: vs manual/Excel/genéricas. Resumen competidor, matriz 8 features, 4 landmine questions, cuándo perdemos y cómo revertir.`,
  discovery_call: `${BASE} MÓDULO Discovery 30min: Opening→Situation→SPIN→Challenger Insight→Solution Bridge→Qualification→Close. Frases exactas, timing, árbol objeciones.`,
  pipeline_strategy: `${BASE} MÓDULO Pipeline: target, pipeline math, secuencia sem 1-4, cadencia multicanal, KPIs, 3 quick wins HOY.`,
  win_loss: `${BASE} MÓDULO Win/Loss: win patterns + loss patterns + interview script 15min + plan acción.`,
  market_intel: `${BASE} MÓDULO Market Intel LATAM: TAM/SAM/SOM, priorización países, tendencias, recomendación qué atacar primero.`,
  persona: `${BASE} MÓDULO Psicografía: identidad, psychographics profundos, perfil decisión, messaging framework, anti-persona.`,
};

const PH: Record<string,string> = {
  account_research: "Nombre de la agencia, ciudad, país, LinkedIn del dueño/gestor...",
  lead_database: "INDIVIDUAL: info de una agencia.\nLISTA: pega tabla con múltiples agencias.",
  icp_qualify: "Nombre, país, volumen visas/mes, cargo del contacto, señales detectadas...",
  outreach: "Canal, nombre, cargo, agencia, país, volumen, trigger detectado...",
  conversation_analysis: "Pega el texto completo de la conversación (WhatsApp, LinkedIn, email)...",
  objections: "Pega la objeción exacta recibida...",
  battlecard: "¿Contra qué compites? Dame detalles del prospecto.",
  discovery_call: "Perfil agencia, país, volumen, cargo del interlocutor...",
  pipeline_strategy: "¿Qué país/segmento? ¿En cuánto tiempo? ¿Cuántos cierres buscas?",
  win_loss: "Describe deals recientes ganados o perdidos...",
  market_intel: "¿Qué mercado analizar? ¿Qué pregunta estratégica necesitas responder?",
  persona: "¿Qué stakeholder? Dueño, gestor operativo, director comercial. País si es posible.",
};

export default function App() {
  const [mod, setMod] = useState("account_research");
  const [grp, setGrp] = useState("prospect");
  const [msgs, setMsgs] = useState<{role:string,content:string}[]>([]);
  const [hist, setHist] = useState<Record<string,{role:string,content:string}[]>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { ref.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);
  useEffect(() => { setMsgs(hist[mod] || []); setInput(""); }, [mod]);

  const grpData = MODULES.find(g => g.id === grp);
  const modData = MODULES.flatMap(g => g.sub).find(s => s.id === mod);

  const send = async (ov?: string) => {
    const txt = ov || input.trim();
    if (!txt || loading) return;
    const um = { role:"user", content:txt };
    const nm = [...msgs, um];
    setMsgs(nm); setInput(""); setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1500, system:PROMPTS[mod], messages:nm }),
      });
      const d = await r.json();
      const reply = d.content?.[0]?.text || "Sin respuesta.";
      const up = [...nm, { role:"assistant", content:reply }];
      setMsgs(up);
      setHist(h => ({...h, [mod]: up}));
    } catch { setMsgs(m => [...m, {role:"assistant", content:"❌ Error. Intenta de nuevo."}]); }
    setLoading(false);
  };

  const S: React.CSSProperties = { fontFamily:"'Inter',sans-serif" };

  return (
    <div style={{...S, display:"flex", height:"100vh", background:"#060d18", color:"#e2e8f0", overflow:"hidden"}}>
      {/* sidebar */}
      <div style={{width: open?220:0, minWidth:open?220:0, background:"#0a1120", borderRight:"1px solid #1e3a5f", display:"flex", flexDirection:"column", transition:"all 0.25s", overflow:"hidden"}}>
        <div style={{padding:"14px 14px 12px", borderBottom:"1px solid #1e3a5f"}}>
          <div style={{display:"flex", alignItems:"center", gap:9}}>
            <div style={{width:32,height:32,background:"linear-gradient(135deg,#0ea5e9,#2563eb)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🛂</div>
            <div>
              <div style={{fontSize:14,fontWeight:800,color:"#38bdf8"}}>ISAVISA BDR</div>
              <div style={{fontSize:10,color:"#475569"}}>Senior Strategic Agent</div>
            </div>
          </div>
        </div>
        <div style={{padding:"10px 8px 6px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
            {MODULES.map(g => (
              <button key={g.id} onClick={() => { setGrp(g.id); setMod(g.sub[0].id); }} style={{padding:"7px 4px",borderRadius:7,border:"none",background:grp===g.id?"#0ea5e920":"transparent",color:grp===g.id?"#38bdf8":"#475569",cursor:"pointer",fontSize:11,fontWeight:grp===g.id?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:2,borderBottom:grp===g.id?"2px solid #0ea5e9":"2px solid transparent"}}>
                <span style={{fontSize:15}}>{g.icon}</span><span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div style={{flex:1,padding:"4px 8px",overflowY:"auto"}}>
          {grpData?.sub.map(s => (
            <button key={s.id} onClick={() => setMod(s.id)} style={{width:"100%",textAlign:"left",padding:"9px 10px",borderRadius:8,border:"none",background:mod===s.id?"#0ea5e915":"transparent",borderLeft:`3px solid ${mod===s.id?"#0ea5e9":"transparent"}`,cursor:"pointer",marginBottom:2}}>
              <div style={{fontSize:12,fontWeight:mod===s.id?600:400,color:mod===s.id?"#7dd3fc":"#64748b"}}>{s.label}</div>
              <div style={{fontSize:10,color:"#334155",marginTop:2}}>{s.desc}</div>
            </button>
          ))}
        </div>
        <div style={{padding:"10px 8px",borderTop:"1px solid #1e3a5f"}}>
          <a href="https://cal.com/isavisa/30min" target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:6,background:"#0ea5e915",border:"1px solid #0ea5e933",color:"#38bdf8",borderRadius:8,padding:"8px 10px",fontSize:11,fontWeight:600,textDecoration:"none"}}>
            <span>📅</span><span>Agendar demo</span>
          </a>
        </div>
      </div>

      {/* main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"11px 18px",borderBottom:"1px solid #1e3a5f",background:"#0a1120",display:"flex",alignItems:"center",gap:10}}>
          <button onClick={() => setOpen(o=>!o)} style={{background:"none",border:"none",color:"#475569",cursor:"pointer",fontSize:18}}>☰</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:"#f1f5f9"}}>{grpData?.icon} {modData?.label}</div>
            <div style={{fontSize:11,color:"#334155",marginTop:1}}>{modData?.desc}</div>
          </div>
          {msgs.length > 0 && <button onClick={() => { setMsgs([]); setHist(h=>({...h,[mod]:[]})); }} style={{background:"#1e293b",border:"1px solid #334155",color:"#64748b",borderRadius:6,padding:"5px 10px",fontSize:11,cursor:"pointer"}}>🗑</button>}
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"18px 20px",display:"flex",flexDirection:"column",gap:14}}>
          {msgs.length === 0 && (
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,textAlign:"center",padding:"24px 20px"}}>
              <div style={{fontSize:38,marginBottom:10}}>{grpData?.icon}</div>
              <div style={{fontSize:15,fontWeight:700,color:"#94a3b8",marginBottom:6}}>{modData?.label}</div>
              <div style={{fontSize:13,color:"#334155",maxWidth:440,lineHeight:1.7}}>{PH[mod]}</div>
            </div>
          )}
          {msgs.map((m,i) => (
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",alignItems:"flex-start",gap:8}}>
              {m.role==="assistant" && <div style={{width:26,height:26,background:"linear-gradient(135deg,#0ea5e9,#2563eb)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,marginTop:2}}>🛂</div>}
              <div style={{maxWidth:"78%",padding:"10px 14px",borderRadius:12,fontSize:13,lineHeight:1.7,background:m.role==="user"?"linear-gradient(135deg,#0ea5e9,#1d4ed8)":"#0d1829",color:m.role==="user"?"#fff":"#cbd5e1",borderBottomRightRadius:m.role==="user"?4:12,borderBottomLeftRadius:m.role==="user"?12:4,border:m.role==="assistant"?"1px solid #1e3a5f":"none",whiteSpace:"pre-wrap"}}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:26,height:26,background:"linear-gradient(135deg,#0ea5e9,#2563eb)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🛂</div>
              <div style={{display:"flex",gap:4,alignItems:"center"}}>
                {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#0ea5e9",animation:"blink 1.2s infinite",animationDelay:`${i*0.2}s`}}/>)}
                <span style={{fontSize:12,color:"#334155",marginLeft:6}}>Analizando...</span>
              </div>
            </div>
          )}
          <div ref={ref}/>
        </div>

        <div style={{padding:"12px 18px",borderTop:"1px solid #1e3a5f",background:"#0a1120"}}>
          <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
            <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder={PH[mod]} rows={3}
              style={{flex:1,background:"#060d18",border:"1px solid #1e3a5f",borderRadius:10,color:"#e2e8f0",fontSize:13,padding:"10px 13px",resize:"none",outline:"none",lineHeight:1.6,fontFamily:"inherit"}}/>
            <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?"#1e293b":"linear-gradient(135deg,#0ea5e9,#2563eb)",border:"none",borderRadius:10,color:"#fff",padding:"0 16px",cursor:loading||!input.trim()?"not-allowed":"pointer",fontSize:18,minWidth:48,height:74}}>➤</button>
          </div>
          <div style={{fontSize:10,color:"#1e3a5f",marginTop:5}}>ISAVISA BDR Senior · Challenger Sale · v5</div>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:.2}50%{opacity:1}}`}</style>
    </div>
  );
}
