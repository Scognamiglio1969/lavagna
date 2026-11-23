// Dentro il parlato dei video: trascrizioni, ricerca nelle parole dette, fotogrammi.
// Le trascrizioni stanno in un database a parte (PARLATO) e arrivano da tre strade:
//  - lo script dal Mac (scripts/trascrizioni.mjs), che legge i sottotitoli di YouTube: dai server Cloudflare YouTube non li dà;
//  - la chiave Gemini di chi guarda, quando un video non ce l'ha ancora (la chiave passa e non resta da nessuna parte);
//  - quello che c'è già: una volta fatta, la trascrizione serve a tutti.

const FINESTRA = 120; // secondi: la ricerca trova la finestra, poi la riga giusta dentro
const MODELLI_GEMINI = [["gemini-3.8-flash", "3"], ["gemini-flash-latest", ""], ["gemini-flash-lite-latest", ""], ["gemini-2.5-flash", "2.5"]]; // [nome, famiglia]: gemini-2.5-flash non c'è più per le chiavi nuove // [nome, accetta thinkingBudget]
const MAX_GEMINI_GIORNO = 30; // trascrizioni con Gemini per indirizzo al giorno (la chiave è di chi la usa, i nostri limiti no)

const pulisci = (s) => String(s || "").replace(/\s+/g, " ").trim();
export const senzaAccenti = (s) => String(s || "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

async function comprimi(dati) {
  const s = new Blob([JSON.stringify(dati)]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
async function decomprimi(blob) {
  const byte = blob instanceof Uint8Array ? blob : new Uint8Array(blob);
  const s = new Blob([byte]).stream().pipeThrough(new DecompressionStream("gzip"));
  return JSON.parse(await new Response(s).text());
}
function finestre(righe) {
  const m = new Map();
  for (const [t, x] of righe) { const k = Math.floor(t / FINESTRA); m.set(k, m.has(k) ? m.get(k) + " " + x : x); }
  return m;
}
const normalizza = (righe) => (Array.isArray(righe) ? righe : [])
  .map((r) => [Math.max(0, Math.round(Number(r?.[0]) * 10) / 10), pulisci(r?.[1]).slice(0, 600)])
  .filter(([t, x]) => x && Number.isFinite(t))
  .sort((a, b) => a[0] - b[0]).slice(0, 30000);

export async function leggiTrascrizione(env, id) {
  if (!env.PARLATO || !/^[\w-]{11}$/.test(id)) return null;
  const r = await env.PARLATO.prepare("SELECT lingua, fonte, righe, storyboard FROM trascrizioni WHERE id = ?").bind(id).first();
  if (!r) return null;
  return { id, lingua: r.lingua || "", fonte: r.fonte, righe: r.righe ? await decomprimi(r.righe) : [], fotogrammi: !!r.storyboard };
}

// salva (o sostituisce) una trascrizione e rifà le sue voci nell'indice delle parole
export async function salvaTrascrizione(env, id, { lingua = "", fonte = "yt", righe = [], storyboard = "" }) {
  const db = env.PARLATO;
  righe = normalizza(righe);
  const sb = /^https:\/\/i\.ytimg\.com\/sb\/[\w-]{11}\//.test(storyboard || "") ? storyboard.slice(0, 2000) : null;
  const vecchia = await db.prepare("SELECT n, righe, storyboard FROM trascrizioni WHERE id = ?").bind(id).first();
  const istruzioni = [];
  if (vecchia?.righe) for (const [k, testo] of finestre(await decomprimi(vecchia.righe)))
    istruzioni.push(db.prepare("INSERT INTO parlato (parlato, rowid, testo) VALUES ('delete', ?, ?)").bind(vecchia.n * 100000 + k, testo));
  const blob = righe.length ? await comprimi(righe) : null;
  const ora = new Date().toISOString();
  let n = vecchia?.n;
  if (n) istruzioni.push(db.prepare("UPDATE trascrizioni SET lingua = ?, fonte = ?, righe = ?, storyboard = ?, creato = ? WHERE n = ?")
    .bind(lingua || "", righe.length ? fonte : "nessuna", blob, sb || vecchia.storyboard || null, ora, n));
  else n = (await db.prepare("INSERT INTO trascrizioni (id, lingua, fonte, righe, storyboard, creato) VALUES (?, ?, ?, ?, ?, ?) RETURNING n")
    .bind(id, lingua || "", righe.length ? fonte : "nessuna", blob, sb, ora).first()).n;
  for (const [k, testo] of finestre(righe))
    istruzioni.push(db.prepare("INSERT INTO parlato (rowid, testo) VALUES (?, ?)").bind(n * 100000 + k, testo));
  istruzioni.push(db.prepare("DELETE FROM richieste WHERE id = ?").bind(id));
  for (let i = 0; i < istruzioni.length; i += 90) await db.batch(istruzioni.slice(i, i + 90));
  return { righe: righe.length };
}

export async function segnaRichiesta(env, id) {
  if (!env.PARLATO || !/^[\w-]{11}$/.test(id)) return;
  await env.PARLATO.prepare("INSERT INTO richieste (id, volte, ultima) VALUES (?, 1, ?) ON CONFLICT(id) DO UPDATE SET volte = volte + 1, ultima = excluded.ultima")
    .bind(id, new Date().toISOString()).run();
}

// ricerca dentro il parlato: la finestra giusta, poi la prima riga che contiene le parole
export async function cercaParlato(env, q, max = 12) {
  if (!env.PARLATO) return [];
  const parole = senzaAccenti(q).split(/[^\p{L}\p{N}]+/u).filter((p) => p.length >= 2).slice(0, 6);
  if (!parole.length) return [];
  // radici: «buchi neri» trova anche «buco nero», «holes» anche «hole»
  const radice = (p) => { const r = p.replace(/(es|s)$/, "").replace(/h?[aeiouyàèéìòù]+$/, ""); return r.length >= 3 && /^[\p{L}]+$/u.test(r) ? r : ""; };
  const domanda = parole.map((p) => (radice(p) ? `${radice(p)}*` : `"${p}"`)).join(" ");
  return cercaDomanda(env, domanda, parole.map((p) => radice(p) || p), max);
}

// la ricerca vera e propria: una domanda FTS già pronta; «escludi» = un video da lasciar fuori
export async function cercaDomanda(env, domanda, cerchi, max = 12, escludi = "") {
  if (!env.PARLATO) return [];
  const fuoriN = escludi ? (await env.PARLATO.prepare("SELECT n FROM trascrizioni WHERE id = ?").bind(escludi).first())?.n : null;
  const { results } = await env.PARLATO.prepare("SELECT rowid AS r FROM parlato WHERE parlato MATCH ? ORDER BY rank LIMIT 80").bind(domanda).all();
  const migliori = new Map(); // n → [k, …] (al massimo 2 punti per video)
  for (const { r } of results) {
    const n = Math.floor(r / 100000), k = r % 100000;
    if (n === fuoriN) continue;
    if (!migliori.has(n)) { if (migliori.size >= max) continue; migliori.set(n, []); }
    if (migliori.get(n).length < 2) migliori.get(n).push(k);
  }
  if (!migliori.size) return [];
  const ns = [...migliori.keys()];
  const righe = (await env.PARLATO.prepare(`SELECT n, id, lingua, righe FROM trascrizioni WHERE n IN (${ns.map(() => "?").join(",")})`).bind(...ns).all()).results;
  const fuori = [];
  for (const n of ns) {
    const t = righe.find((x) => x.n === n);
    if (!t?.righe) continue;
    const tutte = await decomprimi(t.righe);
    for (const k of migliori.get(n)) {
      const dentro = tutte.filter(([s]) => Math.floor(s / FINESTRA) === k);
      const i = Math.max(0, dentro.findIndex(([, x]) => { const y = senzaAccenti(x); return cerchi.some((p) => y.includes(p)); }));
      const pezzo = dentro.slice(Math.max(0, i - 1), i + 3);
      if (pezzo.length) fuori.push({ id: t.id, lingua: t.lingua, da: dentro[i]?.[0] ?? pezzo[0][0], estratto: pezzo.map(([, x]) => x).join(" ").slice(0, 400) });
    }
  }
  return fuori;
}

// ——— fotogrammi: YouTube prepara per ogni video dei fogli di miniature (una ogni pochi secondi) ———
// spec: "https://i.ytimg.com/sb/ID/storyboard3_L$L/$N.jpg?sqp=…|48#27#100#10#10#0#default#rs$…|…|320#180#104#3#3#5000#M$M#rs$…"
export function fogliDa(spec) {
  const p = String(spec || "").split("|");
  if (p.length < 2) return null;
  const L = p.length - 2;
  const [w, h, quanti, colonne, file, passo, nome, sigh] = p.at(-1).split("#");
  return { L, w: +w, h: +h, quanti: +quanti, colonne: +colonne, file: +file, passo: +passo, nome, sigh, base: p[0] };
}
export function urlFoglio(f, N) {
  return f.base.replace("$L", f.L).replace("$N", f.nome.replace("$M", N)) + "&sigh=" + f.sigh;
}
export async function infoFotogrammi(env, id) {
  const r = env.PARLATO && /^[\w-]{11}$/.test(id) ? await env.PARLATO.prepare("SELECT storyboard FROM trascrizioni WHERE id = ?").bind(id).first() : null;
  const f = r?.storyboard ? fogliDa(r.storyboard) : null;
  if (!f) return { id, approssimato: true, src: `/api/foglio/${id}/mq`, w: 320, h: 180 };
  return { id, src: `/api/foglio/${id}/{N}`, w: f.w, h: f.h, quanti: f.quanti, colonne: f.colonne, file: f.file, passo: f.passo };
}
export async function foglio(env, id, quale) {
  let url = "";
  if (quale === "mq") url = `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
  else {
    const r = await env.PARLATO.prepare("SELECT storyboard FROM trascrizioni WHERE id = ?").bind(id).first();
    const f = r?.storyboard ? fogliDa(r.storyboard) : null;
    if (!f || !/^\d{1,4}$/.test(quale)) return null;
    url = urlFoglio(f, Number(quale));
  }
  const x = await fetch(url);
  if (!x.ok) return quale === "mq" ? null : foglio(env, id, "mq");
  return new Response(x.body, { headers: { "content-type": x.headers.get("content-type") || "image/jpeg", "cache-control": "public, max-age=604800" } });
}

// ——— trascrizione con la chiave Gemini di chi guarda ———
const PROMPT = `Transcribe, word for word, everything that is spoken in this video, in the language it is spoken (do not translate).
One line per sentence. Every line starts with the time from the start of the video in square brackets, like this:
[0:05] First sentence.
[12:34] Another sentence.
[1:02:03] For videos longer than an hour.
Write nothing else: no titles, no comments, no description of the images. If nobody speaks, answer only: NO SPEECH`;

const secondiDa = (s) => s.split(":").reduce((n, x) => n * 60 + Number(x), 0);
function righeDaGemini(testo, inizio = 0) {
  const righe = [];
  for (const l of String(testo || "").split("\n")) {
    const m = l.match(/^\s*\[(\d{1,2}(?::\d{1,2}){1,2})(?:\.\d+)?\]\s*(.+)$/);
    if (m) righe.push([secondiDa(m[1]), m[2]]);
  }
  // con un pezzo che non parte da zero, Gemini a volte conta dall'inizio del pezzo
  if (inizio > 0 && righe.length && righe[0][0] < inizio - 60) for (const r of righe) r[0] += inizio;
  return righe;
}
async function chiediGemini(chiave, id, da, a) {
  const video = { fileData: { fileUri: `https://www.youtube.com/watch?v=${id}` } };
  if (da || a) video.videoMetadata = { ...(da ? { startOffset: `${da}s` } : {}), ...(a ? { endOffset: `${a}s` } : {}), fps: 0.1 };
  else video.videoMetadata = { fps: 0.1 };
  let ultimo = null;
  for (const [modello, budget] of MODELLI_GEMINI) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modello}:generateContent`, {
      method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": chiave },
      body: JSON.stringify({
        contents: [{ parts: [video, { text: PROMPT }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 60000, mediaResolution: "MEDIA_RESOLUTION_LOW", ...(budget === "3" ? { thinkingConfig: { thinkingLevel: "low" } } : budget === "2.5" ? { thinkingConfig: { thinkingBudget: 0 } } : {}) },
      }),
    }).catch(() => null);
    if (!r) { ultimo = { stato: 502 }; continue; }
    const d = await r.json().catch(() => ({}));
    if (r.ok) return { testo: (d.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("") };
    ultimo = { stato: r.status, messaggio: d.error?.message || "" };
    if (r.status === 400 && /api key|API_KEY/i.test(ultimo.messaggio)) break; // chiave sbagliata: inutile provare un altro modello
    if (r.status === 403 || r.status === 401) break;
  }
  return { errore: ultimo };
}
export async function trascriviConGemini(env, id, chiave, durata = 0, ip = "") {
  const giorno = `gemini:${ip}:${new Date().toISOString().slice(0, 10)}`;
  const fatte = Number(await env.LAVAGNA.get(giorno)) || 0;
  if (fatte >= MAX_GEMINI_GIORNO) return { errore: "troppe", stato: 429 };
  await env.LAVAGNA.put(giorno, String(fatte + 1), { expirationTtl: 86400 });
  // i video lunghi a pezzi di 45 minuti (una risposta di Gemini ha un limite di lunghezza)
  const PEZZO = 2700;
  const pezzi = durata > 3300 ? Array.from({ length: Math.ceil(durata / PEZZO) }, (_, i) => [i * PEZZO, Math.min(durata, (i + 1) * PEZZO)]) : [[0, 0]];
  const righe = [];
  for (const [da, a] of pezzi.slice(0, 8)) {
    const r = await chiediGemini(chiave, id, da, a);
    if (r.errore) {
      const s = r.errore.stato;
      const m = r.errore.messaggio || "";
      return { errore: s === 401 || /API key|API_KEY|PERMISSION_DENIED/i.test(m) ? "chiave" : s === 429 ? "quota" : "gemini", stato: s === 429 ? 429 : 502, dettaglio: (r.errore.messaggio || "").slice(0, 200) };
    }
    righe.push(...righeDaGemini(r.testo, da));
  }
  return { righe };
}
