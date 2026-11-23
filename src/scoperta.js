// SCHOOL · Banco: le funzioni per studiare sotto ogni video.
//  · simili       → i punti di altri video dove si parla delle stesse cose (dal parlato trascritto)
//  · semplice     → riassunto semplice, punti chiave e glossario dalla trascrizione (AI di Cloudflare)
//  · contrario    → la tesi del video, quella opposta e i video di Lavagna che la sostengono
//  · traduci      → le righe della trascrizione tradotte, a blocchi (per i sottotitoli in due lingue)
// Tutto passa dalla cache: un video già spiegato o tradotto non costa niente la seconda volta.

import { leggiTrascrizione, cercaDomanda, senzaAccenti } from "./parlato.js";
import { cerca } from "./indice.js";
import { infoVideo } from "./youtube.js";

const LINGUE = { it: "Italian", en: "English", es: "Spanish", de: "German", fr: "French" };
const MESE = 30 * 86400;

// Gemini con la chiave di chi usa SCHOOL (gratuita, sua: Lavagna non mette la propria per nessuno)
// [modello, accetta il ragionamento spento]: «-latest» vuole ragionare, quindi lì non si chiede di spegnerlo
// I modelli, dal primo da provare. Google ritira i vecchi (gemini-2.5-flash non c'è più per le chiavi nuove)
// e a volte un modello è sovraccarico (503): allora si riprova una volta, poi si passa al successivo.
export const MODELLI_GEMINI = ["gemini-3.8-flash", "gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"];
// poco ragionamento = risposta più veloce; ogni famiglia lo chiede a modo suo, i «-latest» si lasciano fare
export const pensiero = (modello) => (/^gemini-3/.test(modello) ? { thinkingConfig: { thinkingLevel: "low" } } : /^gemini-2\.5/.test(modello) ? { thinkingConfig: { thinkingBudget: 0 } } : {});
export class ErroreGemini extends Error { constructor(tipo, dettaglio = "") { super(tipo); this.tipo = tipo; this.dettaglio = dettaglio; } }
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
async function ai(env, sistema, domanda, max = 900, chiave = "") {
  if (!chiave) throw new ErroreGemini("chiave");
  let ultimo = new ErroreGemini("ai");
  for (const modello of MODELLI_GEMINI) {
    let conPensiero = true;
    for (let tentativo = 0; tentativo < 3; tentativo++) {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modello}:generateContent`, {
        method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": chiave },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sistema }] },
          contents: [{ role: "user", parts: [{ text: domanda }] }],
          generationConfig: { responseMimeType: "application/json", maxOutputTokens: Math.max(4096, max * 3), temperature: 0.4, ...(conPensiero ? pensiero(modello) : {}) },
        }),
        signal: AbortSignal.timeout(55000), // un modello che non risponde non deve tenere appeso tutto
      }).catch((e) => { ultimo = new ErroreGemini("ai", /timeout|abort/i.test(String(e)) ? `${modello}: nessuna risposta in 55 secondi` : String(e).slice(0, 200)); console.log(`Gemini ${modello}: ${String(e).slice(0, 120)}`); return null; });
      if (!r) break;
      const d = await r.json().catch(() => ({}));
      const messaggio = String(d.error?.message || "").slice(0, 300);
      if (!r.ok) {
        console.log(`Gemini ${modello}: ${r.status} ${messaggio}`); // nei log di Cloudflare, senza la chiave
        if (/API key|API_KEY|PERMISSION_DENIED/i.test(messaggio) || r.status === 401) throw new ErroreGemini("nonValida", messaggio);
        ultimo = new ErroreGemini(r.status === 429 ? "quota" : "ai", messaggio);
        if (r.status === 400 && /think/i.test(messaggio) && conPensiero) { conPensiero = false; continue; } // non accetta quell'impostazione: senza
        if (r.status === 503 && tentativo === 0) { await pausa(1500); continue; } // sovraccarico: un altro tentativo
        break; // 404 (modello ritirato), 429, altro: si passa al modello dopo
      }
      const testo = (d.candidates?.[0]?.content?.parts || []).filter((x) => !x.thought).map((x) => x.text || "").join("");
      try { const a = testo.search(/[{[]/), z = Math.max(testo.lastIndexOf("}"), testo.lastIndexOf("]")); return JSON.parse(testo.slice(a, z + 1)); }
      catch { ultimo = new ErroreGemini("ai", `${modello}: ${d.candidates?.[0]?.finishReason || "risposta non leggibile"}`); console.log(`Gemini ${modello}: risposta non leggibile`, d.candidates?.[0]?.finishReason); break; }
    }
  }
  throw ultimo;
}

// quante richieste all'AI per persona al giorno (le risposte già in cache non contano)
export async function limite(env, req, nome, max) {
  const ip = req.headers.get("cf-connecting-ip") || "";
  const chiave = `${nome}:${ip}:${new Date().toISOString().slice(0, 10)}`;
  const fatte = Number(await env.LAVAGNA.get(chiave)) || 0;
  if (fatte >= max) return false;
  await env.LAVAGNA.put(chiave, String(fatte + 1), { expirationTtl: 86400 });
  return true;
}

// un pezzo di testo lungo, preso da inizio, metà e fine (così l'AI vede tutto il video)
function campione(righe, max = 12000) {
  const testo = righe.map(([, x]) => x).join(" ").replace(/\s+/g, " ");
  if (testo.length <= max) return testo;
  const p = Math.floor(max / 3), m = Math.floor(testo.length / 2);
  return `${testo.slice(0, p)} […] ${testo.slice(m - p / 2, m + p / 2)} […] ${testo.slice(-p)}`;
}

// ——— 1 · Altri che ne parlano ———
const VUOTE = new Set(`sarebbe sarebbero potrebbe dovrebbe succederebbe ragazzi video canale musica music applause risate oggi
questo questa questi queste quello quella quelli quelle allora perche quindi anche ancora molto molti molte sempre ogni dove come quando sono siamo stato stata stati fatto fare essere avere cioe abbiamo hanno della delle dello degli nella nelle negli sulla sulle dalla dalle alla alle allo agli tutto tutti tutte cosa cose volta volte poi proprio infatti invece adesso questo pero dopo prima mentre senza sopra sotto altro altri altre altra
there their about would could should which these those where when what because really thing things going think know people other being after before right also just like into from with this that have will your they them then than were been very much more most some time make made well actually something kind
porque donde cuando tambien entonces todos todas sobre desde hasta este esta estos estas como pero muy mucho
nicht noch auch eine einen einem einer dass wenn oder aber schon wird werden haben sind wurde dieser diese dieses
avec dans pour mais plus tout tous cette sont nous vous elle ils etre avoir fait comme aussi alors parce`.split(/\s+/));

export async function simili(env, id, titolo = "", max = 10) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  const conta = new Map();
  const aggiungi = (s, peso) => { for (const p of senzaAccenti(s).split(/[^\p{L}]+/u)) if (p.length >= 5 && !VUOTE.has(p)) conta.set(p, (conta.get(p) || 0) + peso); };
  aggiungi(titolo, 6);
  if (t?.righe?.length) aggiungi(t.righe.map(([, x]) => x).join(" "), 1);
  // le parole che contano: frequenti in questo video ma rare nell'archivio (e presenti anche altrove)
  const candidati = [...conta].sort((a, b) => b[1] - a[1]).slice(0, 30);
  let scelte;
  try {
    const df = new Map((await env.PARLATO.prepare(`SELECT term, doc FROM parlato_vocab WHERE term IN (${candidati.map(() => "?").join(",")})`).bind(...candidati.map(([p]) => p)).all()).results.map((r) => [r.term, r.doc]));
    const N = (await env.PARLATO.prepare("SELECT count(*) AS n FROM parlato").first())?.n || 1000;
    scelte = candidati.filter(([p]) => (df.get(p) || 0) >= 2)
      .map(([p, tf]) => [p, Math.log(1 + tf) * Math.log(N / (1 + df.get(p)))]).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([p]) => p);
  } catch { scelte = candidati.slice(0, 5).map(([p]) => p); }
  if (scelte.length < 2) return { parole: scelte, momenti: [] };
  // almeno due di queste parole nello stesso pezzo di parlato (2 minuti)
  // le forme vere della parola (buco/buchi, massa/masse, hole/holes), non «tutto ciò che comincia così»: «terr…» troverebbe anche «territory»
  const varianti = (p) => {
    const v = new Set([p]);
    if (/[aeio]$/.test(p)) { const b = p.slice(0, -1); for (const x of "aeio") v.add(b + x); if (/[cg]$/.test(b)) { v.add(b + "he"); v.add(b + "hi"); } }
    if (/(che|chi|ghe|ghi)$/.test(p)) { const b = p.slice(0, -2); for (const x of "ao") v.add(b + x); }
    if (/[^aeious]$/.test(p)) v.add(p + "s"); else if (/s$/.test(p) && p.length > 5) v.add(p.slice(0, -1));
    return [...v];
  };
  const q = (p) => `(${varianti(p).map((x) => `"${x}"`).join(" OR ")})`, coppie = [];
  for (let i = 0; i < scelte.length; i++) for (let j = i + 1; j < scelte.length; j++) coppie.push(`(${q(scelte[i])} AND ${q(scelte[j])})`);
  const domanda = coppie.join(" OR ");
  const momenti = await cercaDomanda(env, domanda, scelte.flatMap(varianti), max, id);
  return { parole: scelte, momenti };
}

// ——— 4 · Spiegamelo più semplice ———
export async function semplice(env, id, ui, chiave) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  if (!t?.righe?.length) return { errore: "trascrizione" };
  const lingua = LINGUE[ui] || "English";
  const sistema = `Answer ONLY in ${lingua}, with a JSON object and nothing else. You explain videos to curious students (14-18 years old) in simple, clear words.
From the transcript of an educational video write:
{"riassunto": "what the video explains, in 4-6 short simple sentences", "punti": ["the 3-6 key ideas, one short sentence each"], "glossario": [{"termine": "a difficult word used in the video", "spiegazione": "what it means, in one simple sentence"}]}
Glossary: 5-10 terms. Use only what is in the transcript or basic certain knowledge. Ignore sponsors and calls to subscribe. Write all the values in ${lingua}, even if the transcript is in another language.`;
  const d = await ai(env, sistema, `Transcript:\n${campione(t.righe)}`, 1400, chiave);
  const pulito = (x) => String(x || "").replace(/\*\*/g, "").trim();
  return {
    riassunto: pulito(d.riassunto),
    punti: (d.punti || []).map(pulito).filter(Boolean).slice(0, 8),
    glossario: (d.glossario || []).map((g) => ({ termine: pulito(g.termine), spiegazione: pulito(g.spiegazione) })).filter((g) => g.termine).slice(0, 12),
  };
}

// ——— Mappa mentale del video: rami e dettagli, che il browser disegna come la mappa delle lezioni ———
export async function mappa(env, id, ui, chiave) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  if (!t?.righe?.length) return { errore: "trascrizione" };
  const lingua = LINGUE[ui] || "English";
  const sistema = `Answer ONLY in ${lingua}, with a JSON object and nothing else. From the transcript of an educational video build a MIND MAP of what it explains:
{"centro": "the topic in 2-5 words", "rami": [{"t": "main idea, 2-6 words", "f": ["detail, 2-7 words", "..."]}]}
4-7 branches, 2-4 details each, all different, no repetitions. Only what the video explains. Ignore sponsors and calls to subscribe. Write all the values in ${lingua}.`;
  const d = await ai(env, sistema, `Transcript:\n${campione(t.righe)}`, 1200, chiave);
  const pulito = (x) => String(x || "").replace(/\*\*/g, "").replace(/^[-*•\d.)\s]+/, "").trim().slice(0, 60);
  const rami = (d.rami || []).map((r) => ({ t: pulito(r.t), f: (r.f || []).map(pulito).filter(Boolean).slice(0, 5) })).filter((r) => r.t).slice(0, 8);
  if (!rami.length) throw new Error("mappa vuota");
  return { centro: pulito(d.centro), testo: rami.map((r) => [r.t, ...r.f.map((x) => `  ${x}`)].join("\n")).join("\n") };
}

// ——— Riassunto in tre punti ———
export async function tre(env, id, ui, chiave) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  if (!t?.righe?.length) return { errore: "trascrizione" };
  const lingua = LINGUE[ui] || "English";
  const sistema = `Answer ONLY in ${lingua}, with a JSON object and nothing else. Summarize this educational video in exactly THREE main points, in the order the video presents them:
{"punti": [{"titolo": "2-5 words", "testo": "one or two clear sentences"}, {...}, {...}]}
Only what the video says. Ignore sponsors and calls to subscribe. Write all the values in ${lingua}.`;
  const d = await ai(env, sistema, `Transcript:\n${campione(t.righe)}`, 700, chiave);
  const pulito = (x) => String(x || "").replace(/\*\*/g, "").trim();
  const punti = (d.punti || []).map((p) => (typeof p === "string" ? { titolo: "", testo: pulito(p) } : { titolo: pulito(p.titolo), testo: pulito(p.testo) })).filter((p) => p.testo).slice(0, 3);
  if (!punti.length) throw new Error("vuoto");
  return { punti };
}

// ——— Domande per ripassare (la risposta si scopre, niente punteggi) ———
export async function domande(env, id, ui, chiave) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  if (!t?.righe?.length) return { errore: "trascrizione" };
  const lingua = LINGUE[ui] || "English";
  const sistema = `Answer ONLY in ${lingua}, with a JSON object and nothing else. Write 6-8 review questions on this educational video, from simple recall to reasoning, each with a short answer taken from the video:
{"domande": [{"d": "question?", "r": "answer in one or two sentences"}]}
Only what the video says. Write all the values in ${lingua}.`;
  const d = await ai(env, sistema, `Transcript:\n${campione(t.righe)}`, 1200, chiave);
  const lista = (d.domande || []).map((x) => ({ d: String(x.d || "").trim(), r: String(x.r || "").trim() })).filter((x) => x.d && x.r).slice(0, 10);
  if (!lista.length) throw new Error("vuoto");
  return { domande: lista };
}

// ——— Linea del tempo: i fatti datati del video, con il minuto in cui se ne parla ———
export async function lineaTempo(env, id, ui, chiave) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  if (!t?.righe?.length) return { errore: "trascrizione" };
  const lingua = LINGUE[ui] || "English";
  // il testo con i minuti, così ogni fatto torna col punto del video dove se ne parla
  const conMinuti = t.righe.filter((_, i) => i % 2 === 0).map(([s, x], i) => `[${Math.floor(s)}] ${x} ${t.righe[i * 2 + 1]?.[1] || ""}`).join("\n").slice(0, 14000);
  const sistema = `Answer ONLY in ${lingua}, with a JSON object and nothing else. List the dated events mentioned in this educational video, in chronological order (5-12):
{"eventi": [{"quando": "the date as said (year, century, period)", "cosa": "what happened, one sentence", "sec": seconds number from the [N] marker where it is mentioned}]}
If the video has no dates at all, answer {"eventi": []}. Write "cosa" in ${lingua}.`;
  const d = await ai(env, sistema, `Transcript with [seconds]:\n${conMinuti}`, 1200, chiave);
  return { eventi: (d.eventi || []).map((e) => ({ quando: String(e.quando || "").trim(), cosa: String(e.cosa || "").trim(), sec: Math.max(0, Number(e.sec) || 0) })).filter((e) => e.quando && e.cosa).slice(0, 14) };
}

// il parlato con i secondi ogni tre righe ([12] …), accorciato in modo uniforme se il video è molto lungo
function conSecondi(righe, max = 45000) {
  const pezzi = [];
  for (let i = 0; i < righe.length; i += 3) pezzi.push(`[${Math.floor(righe[i][0])}] ${righe.slice(i, i + 3).map(([, x]) => x).join(" ")}`);
  let testo = pezzi.join("\n");
  if (testo.length > max) { const k = Math.ceil(testo.length / max); testo = pezzi.filter((_, i) => i % k === 0).join("\n"); }
  return testo;
}

// ——— Capitoli: l'indice del video, con il secondo da cui guardare ogni parte ———
export async function capitoli(env, id, ui, chiave) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  if (!t?.righe?.length) return { errore: "trascrizione" };
  const lingua = LINGUE[ui] || "English", fine = t.righe.at(-1)[0];
  const sistema = `Answer ONLY in ${lingua}, with a JSON object and nothing else. Divide this educational video into its chapters, in order (4-10, following how the topic changes):
{"capitoli": [{"sec": start in seconds taken from the [N] markers, "titolo": "3-7 words", "riassunto": "what this part explains, one short sentence"}]}
The first chapter starts at 0. Write titolo and riassunto in ${lingua}.`;
  const d = await ai(env, sistema, `Transcript with [seconds]:\n${conSecondi(t.righe)}`, 1200, chiave);
  const lista = (d.capitoli || []).map((c) => ({ sec: Math.max(0, Math.min(fine, Math.round(Number(c.sec) || 0))), titolo: String(c.titolo || "").trim(), riassunto: String(c.riassunto || "").trim() }))
    .filter((c) => c.titolo).sort((a, b) => a.sec - b.sec).slice(0, 14);
  if (!lista.length) throw new ErroreGemini("ai", "nessun capitolo");
  lista[0].sec = 0;
  return { capitoli: lista };
}

// ——— Flashcard: davanti una domanda o una parola, dietro la risposta (si girano, niente punteggi) ———
export async function carte(env, id, ui, chiave) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  if (!t?.righe?.length) return { errore: "trascrizione" };
  const lingua = LINGUE[ui] || "English";
  const sistema = `Answer ONLY in ${lingua}, with a JSON object and nothing else. Make 10-16 flashcards to study this educational video:
{"carte": [{"fronte": "a short question, or a key term to define", "retro": "the answer, 1-2 clear sentences"}]}
Cover the whole video, from basic facts to the main ideas. Only what the video says. Write everything in ${lingua}.`;
  const d = await ai(env, sistema, `Transcript:\n${campione(t.righe)}`, 1600, chiave);
  const lista = (d.carte || []).map((c) => ({ fronte: String(c.fronte || "").trim(), retro: String(c.retro || "").trim() })).filter((c) => c.fronte && c.retro).slice(0, 20);
  if (!lista.length) throw new ErroreGemini("ai", "nessuna carta");
  return { carte: lista };
}

// ——— Chiedi al video: risponde solo con quello che dice il video, e dice in che minuto ———
export async function chiedi(env, id, ui, chiave, domanda) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  if (!t?.righe?.length) return { errore: "trascrizione" };
  const lingua = LINGUE[ui] || "English";
  const sistema = `You answer a student's question about an educational video, using ONLY what is said in its transcript ([N] = seconds from the start).
Answer ONLY in ${lingua}, with a JSON object and nothing else:
{"risposta": "a clear answer in 2-5 sentences", "nelVideo": true or false, "sec": [the seconds where the video talks about it, from the [N] markers, at most 3]}
If the video does not talk about it, set "nelVideo" to false, say so in one sentence in "risposta" and leave "sec" empty. Do not invent anything.`;
  const d = await ai(env, sistema, `Transcript with [seconds]:\n${conSecondi(t.righe)}\n\nStudent's question: ${domanda}`, 700, chiave);
  return { risposta: String(d.risposta || "").trim(), nelVideo: d.nelVideo !== false, sec: (Array.isArray(d.sec) ? d.sec : []).map((x) => Math.max(0, Math.round(Number(x) || 0))).filter((x, i, a) => a.indexOf(x) === i).slice(0, 3) };
}

// ——— 8 · Il contrario ———
export async function contrario(env, id, ui, chiave) {
  const v = await infoVideo(env, id).catch(() => null);
  if (!v?.titolo) return { errore: "video" };
  const t = await leggiTrascrizione(env, id).catch(() => null);
  const lingua = LINGUE[ui] || "English", linguaVideo = LINGUE[v.lingua] || "English";
  const sistema = `Answer ONLY with a JSON object, nothing else. You help students see both sides of a debate, fairly and without taking sides.
{"tesi": "the main claim or position of this video, in one neutral sentence in ${lingua}", "opposta": "the strongest opposite position held by serious people, in one neutral sentence in ${lingua}", "ricerche": ["3 short search queries (2-5 words) that would find videos defending the OPPOSITE position: 2 in ${linguaVideo}, 1 in English"]}
If the video has no claim to oppose (it only informs), the "opposta" is the main critique or alternative view on the topic.`;
  const d = await ai(env, sistema, `Title: ${v.titolo}\nDescription: ${String(v.descrizione || "").slice(0, 800)}\nTranscript (excerpt): ${t?.righe?.length ? campione(t.righe, 5000) : "(none)"}`, 600, chiave);
  const gia = new Set([id]), video = [];
  for (const q of (d.ricerche || []).slice(0, 3)) {
    const e = await cerca(env, { q: String(q).slice(0, 80) }).catch(() => null);
    for (const x of [...(e?.parole || []).slice(0, 8), ...(e?.significato || []).slice(0, 6)]) {
      if (gia.has(x.id) || x.canale === v.canale) continue;
      gia.add(x.id); video.push(x);
    }
  }
  return { tesi: String(d.tesi || "").trim(), opposta: String(d.opposta || "").trim(), ricerche: d.ricerche || [], video: video.slice(0, 8) };
}

// ——— 6 · Sottotitoli in due lingue: 40 righe per volta ———
export const BLOCCO = 40;
export async function traduci(env, id, verso, k, chiave) {
  const t = await leggiTrascrizione(env, id).catch(() => null);
  if (!t?.righe?.length) return { errore: "trascrizione" };
  const righe = t.righe.slice(k * BLOCCO, (k + 1) * BLOCCO);
  if (!righe.length) return { righe: [] };
  const lingua = LINGUE[verso] || "English";
  if (t.lingua === verso) return { righe: righe.map(([, x]) => x) };
  // le righe numerate: la traduzione di ognuna torna col suo numero, così non slitta mai sotto la frase sbagliata
  const dentro = Object.fromEntries(righe.map(([, x], i) => [String(i + 1), x]));
  const sistema = `Translate each numbered subtitle line into ${lingua}. Answer ONLY with a JSON object with exactly the same keys ("1" to "${righe.length}"), each value the translation of that line alone. Lines are pieces of sentences: translate each piece on its own, do not move words between lines. Keep it natural and short.`;
  const fuori = await ai(env, sistema, JSON.stringify(dentro), 3000, chiave);
  return { righe: righe.map((_, i) => String((fuori && !Array.isArray(fuori) ? fuori[String(i + 1)] : Array.isArray(fuori) ? fuori[i] : "") ?? "")) };
}

export { MESE };
