// Lavagna — dentro i video e la scuola:
//  · trascrizione sotto ogni video YouTube, con ricerca nel parlato e la riga che segue il video
//  · appunti col minutaggio (da… a…), con il testo detto in quel pezzo e il fotogramma; si esportano
//  · Scuola: lezioni (insegnanti) e ricerche (studenti) montate con estratti di video, titoli, testi e domande;
//    si presentano a tutto schermo, si esportano, si condividono con un link
// Gli appunti e le lezioni stanno nel browser; con la propria Lavagna (passkey) stanno sul server e si ritrovano ovunque.

let C; // gli attrezzi di app.js (installa)
import { passoMonta as montatore } from "./montaggio.js";
export function installa(ctx) { C = ctx; }
const $ = (s, d = document) => d.querySelector(s);
const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// ——— parole ———
const S = {
  en: {
    trascrizione: "Transcript", appunti: "Notes", cercaQui: "Search what is said in this video…", segui: "Follow the video",
    nessunaTr: "This video has no transcript in Lavagna yet.", nessunParlato: "YouTube has no subtitles for this video.",
    conGemini: "You can make it with Gemini, free: you need an API key from Google AI Studio. The key stays only in this browser and passes through Lavagna just for this request.",
    prendiChiave: "Get a key", chiaveGemini: "Gemini API key", trascrivi: "Transcribe with Gemini", cambiaChiave: "change key",
    ascolta: "Gemini is listening to the video… it can take a couple of minutes.", fatta: "Done. The transcript is now in Lavagna for everyone.",
    erroreChiave: "Gemini did not accept the key. Check it on Google AI Studio.", erroreQuota: "Your Gemini key has reached its limit for now. Try again later.",
    erroreTroppe: "Too many transcriptions from here today. Try again tomorrow.", erroreGemini: "Gemini could not transcribe this video.", erroreVuota: "Gemini found no speech in this video.",
    fonte: { yt: "Subtitles from YouTube", "yt-auto": "YouTube automatic subtitles", gemini: "Transcribed by Gemini" },
    subitoT: "Now, with your Gemini key", codaT: "Or wait for it", codaTesto: "The request is recorded: Lavagna transcribes requested videos first, at its next round of transcriptions. Come back later.",
    trovate: (n) => `${n} found`, nienteQui: "Not said in this video.",
    nuovoAppunto: (t) => `✎ New note at ${t}`, da: "From", a: "To", adesso: "now", commento: "Comment", commentoPh: "What matters here, what to remember, what to ask…",
    estratto: "What is said (from the transcript)", salva: "Save", annulla: "Cancel", modifica: "Edit", togli: "Delete", vai: "Play from here",
    nessunAppunto: "No notes on this video yet. Pause where something matters and add a note: time, comment, the words said, a frame.",
    allaLezione: "＋ Lesson", scegliLezione: "Add this excerpt to…", nuovaLezioneDa: "a new lesson", nuovaRicercaDa: "a new research", aggiuntoA: (n) => `Added to «${n}»`,
    esporta: "Export", md: "Markdown", csv: "CSV (spreadsheet)", html: "Page with frames (HTML)", stampa: "Print / PDF",
    appuntiDi: "Notes", fotogramma: "frame", circa: "approximate frame",
    nelParlato: "Said in the videos", nelParlatoSotto: "the exact moment, inside transcribed videos", nienteParlato: "Nobody says it in the transcribed videos (yet).",
    // scuola
    creaLezione: "Create a lesson", creaLezioneSotto: "For teachers and students alike: choose the videos on a topic, keep the pieces that matter, put titles, notes and questions in between, add a mind map, a glossary, a timeline, review questions. Then present it, download it or send a link.",
    scuola: "School", scuolaSotto: "Lessons made of pieces of videos, step by step.",
    insegnanti: "Teachers", insegnantiSotto: "Prepare a lesson: video excerpts in the right order, titles in between, your notes and questions. Present it full screen in class or send a link.",
    studenti: "Students", studentiSotto: "Prepare a research: collect the pieces of videos you need, comment them, add your text. Sources and timings are listed for you.",
    nuovaLezione: "New lesson", nuovaRicerca: "New research", leMieLezioni: "My lessons", leMieRicerche: "My research", iMieiAppunti: "My notes",
    nessunaLezione: "None yet.", lezione: "Lesson", ricerca: "Research", senzaTitolo: "Untitled",
    titoloLezione: "Title", titoloRicerca: "Research title", classe: "Class, subject or question", domandaRicerca: "The question of the research", autore: "Author",
    bTitolo: "＋ Title", bVideo: "＋ Video excerpt", bTesto: "＋ Text", bDomanda: "＋ To think about",
    tTitolo: "Title", tTesto: "Text", tDomanda: "To think about", tVideo: "Video excerpt",
    linkVideo: "YouTube link or video ID", oAppunto: "…or pick one of your notes", mostraTesto: "show the words in the presentation",
    presenta: "▶ Present", condividiLink: "Share link", togliLink: "Stop sharing", duplica: "Duplicate", elimina: "Delete",
    eliminaChiedi: "Delete this for good?", salvato: "Saved", salvaInCorso: "Saving…", linkCopiato: "Link copied",
    serveConto: "To share with a link you need your own Lavagna (a passkey, no email).", copiaMia: "Copy to my notebook", copiata: "Copied to your notebook",
    fonti: "Sources", fine: "The end", auto: "Go on by itself after each excerpt", schermoIntero: "Full screen", esci: "Exit",
    vuotaLezione: "Add a title, a video excerpt, some text: the blocks appear here, in order.",
    nonTrovata: "This lesson is not shared (any more).", guardaDa: (t) => `watch from ${t}`,
    localeNota: "Saved in this browser. With your own Lavagna they follow you on every device.",
    caricaVideo: "Load", videoNonValido: "Paste a YouTube link or an 11-character video ID.",
  },
  it: {
    trascrizione: "Trascrizione", appunti: "Appunti", cercaQui: "Cerca in quello che si dice nel video…", segui: "Segui il video",
    nessunaTr: "Questo video non ha ancora la trascrizione in Lavagna.", nessunParlato: "YouTube non ha sottotitoli per questo video.",
    conGemini: "Puoi farla tu con Gemini, gratis: serve una chiave API di Google AI Studio. La chiave resta solo in questo browser e passa da Lavagna solo per questa richiesta.",
    prendiChiave: "Prendi una chiave", chiaveGemini: "Chiave API di Gemini", trascrivi: "Trascrivi con Gemini", cambiaChiave: "cambia chiave",
    ascolta: "Gemini sta ascoltando il video… può volerci un paio di minuti.", fatta: "Fatto. Ora la trascrizione è in Lavagna per tutti.",
    erroreChiave: "Gemini non ha accettato la chiave. Controllala su Google AI Studio.", erroreQuota: "La tua chiave Gemini ha finito il limite per ora. Riprova più tardi.",
    erroreTroppe: "Troppe trascrizioni da qui per oggi. Riprova domani.", erroreGemini: "Gemini non è riuscito a trascrivere questo video.", erroreVuota: "Gemini non ha trovato parlato in questo video.",
    fonte: { yt: "Sottotitoli di YouTube", "yt-auto": "Sottotitoli automatici di YouTube", gemini: "Trascritta da Gemini" },
    subitoT: "Subito, con la tua chiave Gemini", codaT: "Oppure aspetta", codaTesto: "La richiesta è registrata: Lavagna trascrive per primi i video richiesti, al prossimo giro di trascrizioni. Ripassa più tardi.",
    trovate: (n) => `${n} trovate`, nienteQui: "Non si dice in questo video.",
    nuovoAppunto: (t) => `✎ Nuovo appunto a ${t}`, da: "Da", a: "A", adesso: "adesso", commento: "Commento", commentoPh: "Cosa conta qui, cosa ricordare, cosa chiedere…",
    estratto: "Cosa si dice (dalla trascrizione)", salva: "Salva", annulla: "Annulla", modifica: "Modifica", togli: "Togli", vai: "Guarda da qui",
    nessunAppunto: "Ancora nessun appunto su questo video. Metti in pausa dove c'è qualcosa che conta e aggiungi un appunto: minuto, commento, le parole dette, un fotogramma.",
    allaLezione: "＋ Lezione", scegliLezione: "Metti questo pezzo in…", nuovaLezioneDa: "una nuova lezione", nuovaRicercaDa: "una nuova ricerca", aggiuntoA: (n) => `Aggiunto a «${n}»`,
    esporta: "Esporta", md: "Markdown", csv: "CSV (foglio di calcolo)", html: "Pagina con fotogrammi (HTML)", stampa: "Stampa / PDF",
    appuntiDi: "Appunti", fotogramma: "fotogramma", circa: "fotogramma approssimato",
    nelParlato: "Detto nei video", nelParlatoSotto: "il momento esatto, dentro i video trascritti", nienteParlato: "Nei video trascritti (finora) nessuno lo dice.",
    creaLezione: "Crea una lezione", creaLezioneSotto: "Per insegnanti e studenti allo stesso modo: scegli i video su un argomento, tieni i pezzi che contano, metti in mezzo titoli, note e domande, aggiungi mappa mentale, glossario, linea del tempo, domande per ripassare. Poi presentala, scaricala o manda un link.",
    scuola: "Scuola", scuolaSotto: "Lezioni fatte di pezzi di video, passo passo.",
    insegnanti: "Insegnanti", insegnantiSotto: "Prepara una lezione: estratti di video nell'ordine giusto, titoli fra l'uno e l'altro, le tue note e le domande. Presentala a tutto schermo in classe o manda il link.",
    studenti: "Studenti", studentiSotto: "Prepara una ricerca: raccogli i pezzi di video che ti servono, commentali, aggiungi il tuo testo. Fonti e minutaggi si mettono in fila da soli.",
    nuovaLezione: "Nuova lezione", nuovaRicerca: "Nuova ricerca", leMieLezioni: "Le mie lezioni", leMieRicerche: "Le mie ricerche", iMieiAppunti: "I miei appunti",
    nessunaLezione: "Ancora nessuna.", lezione: "Lezione", ricerca: "Ricerca", senzaTitolo: "Senza titolo",
    titoloLezione: "Titolo", titoloRicerca: "Titolo della ricerca", classe: "Classe, materia o domanda", domandaRicerca: "La domanda della ricerca", autore: "Autore",
    bTitolo: "＋ Titolo", bVideo: "＋ Estratto di video", bTesto: "＋ Testo", bDomanda: "＋ Per pensarci",
    tTitolo: "Titolo", tTesto: "Testo", tDomanda: "Per pensarci", tVideo: "Estratto di video",
    linkVideo: "Link YouTube o id del video", oAppunto: "…oppure scegli uno dei tuoi appunti", mostraTesto: "mostra le parole nella presentazione",
    presenta: "▶ Presenta", condividiLink: "Condividi link", togliLink: "Smetti di condividere", duplica: "Duplica", elimina: "Elimina",
    eliminaChiedi: "Eliminarla per sempre?", salvato: "Salvato", salvaInCorso: "Salvo…", linkCopiato: "Link copiato",
    serveConto: "Per condividere con un link serve la tua Lavagna (una passkey, niente email).", copiaMia: "Copia nel mio quaderno", copiata: "Copiata nel tuo quaderno",
    fonti: "Fonti", fine: "Fine", auto: "Vai avanti da solo dopo ogni estratto", schermoIntero: "Schermo intero", esci: "Esci",
    vuotaLezione: "Aggiungi un titolo, un estratto di video, un testo: i blocchi compaiono qui, in ordine.",
    nonTrovata: "Questa lezione non è (più) condivisa.", guardaDa: (t) => `guarda da ${t}`,
    localeNota: "Salvati in questo browser. Con la tua Lavagna ti seguono su ogni dispositivo.",
    caricaVideo: "Carica", videoNonValido: "Incolla un link di YouTube o l'id del video (11 caratteri).",
  },
};
const s = (k, ...a) => { const v = S[C.ui()]?.[k] ?? S.en[k]; return typeof v === "function" ? v(...a) : v; };

// ——— tempi ———
export const tempo = (x) => {
  x = Math.max(0, Math.floor(Number(x) || 0));
  const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), sec = String(x % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
};
const secondi = (str) => {
  str = String(str || "").trim();
  if (/^\d+(\.\d+)?$/.test(str)) return Number(str);
  const p = str.split(":").map(Number);
  return p.some((n) => !Number.isFinite(n)) ? NaN : p.reduce((n, x) => n * 60 + x, 0);
};
const nuovoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const linkYT = (id, da) => `https://www.youtube.com/watch?v=${id}${da ? `&t=${Math.floor(da)}s` : ""}`;
export const idDaLink = (x) => {
  x = String(x || "").trim();
  if (/^[\w-]{11}$/.test(x)) return { id: x };
  const m = x.match(/(?:v=|youtu\.be\/|\/v\/|shorts\/|embed\/|live\/)([\w-]{11})/);
  if (!m) return null;
  const t = x.match(/[?&#]t=(\d+h)?(\d+m)?(\d+)s?/);
  const da = t ? (parseInt(t[1]) || 0) * 3600 + (parseInt(t[2]) || 0) * 60 + Number(t[3]) : 0;
  return { id: m[1], da };
};

// ——— trascrizioni (in memoria per la visita) ———
const trascrizioni = new Map();
export function trascrizione(id) {
  if (!trascrizioni.has(id)) trascrizioni.set(id, fetch(`/api/parlato/${id}`).then((r) => r.json()).catch(() => ({ manca: true })));
  return trascrizioni.get(id);
}
const estrattoDa = (righe = [], da, a) => {
  if (!(a > da)) a = da + 30;
  return righe.filter(([t]) => t >= da - 1 && t < a).map(([, x]) => x).join(" ").replace(/\s+/g, " ").trim();
};

// ——— fotogrammi: un ritaglio del foglio di miniature che YouTube prepara per ogni video ———
const infoFot = new Map(), immagini = new Map();
const carica = (src) => {
  if (!immagini.has(src)) immagini.set(src, new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; }));
  return immagini.get(src);
};
export async function fotogramma(id, sec, durata = 0) {
  try {
    if (!infoFot.has(id)) infoFot.set(id, fetch(`/api/fotogrammi/${id}`).then((r) => r.json()));
    const f = await infoFot.get(id);
    const tela = document.createElement("canvas");
    if (f.approssimato) {
      const img = await carica(f.src);
      tela.width = img.naturalWidth; tela.height = img.naturalHeight;
      tela.getContext("2d").drawImage(img, 0, 0);
      return { src: tela.toDataURL("image/jpeg", 0.85), circa: true };
    }
    const passo = f.passo || (durata ? (durata * 1000) / f.quanti : 0);
    const i = Math.min(f.quanti - 1, Math.max(0, passo ? Math.floor((sec * 1000) / passo) : 0));
    const per = f.colonne * f.file, N = Math.floor(i / per), k = i % per;
    const img = await carica(f.src.replace("{N}", N));
    tela.width = f.w; tela.height = f.h;
    tela.getContext("2d").drawImage(img, (k % f.colonne) * f.w, Math.floor(k / f.colonne) * f.h, f.w, f.h, 0, 0, f.w, f.h);
    return { src: tela.toDataURL("image/jpeg", 0.88) };
  } catch { return null; }
}

// ——— il quaderno: nel browser, oppure sul server se sei entrato nella tua Lavagna ———
const Q = {
  dati: null, di: undefined,
  async tutto() {
    const chi = C.io()?.nome || null;
    if (this.di !== chi) { this.dati = null; this.di = chi; }
    if (this.dati) return this.dati;
    if (!chi) return (this.dati = C.memo.get("quaderno", []));
    const r = await fetch("/api/mio/quaderno");
    this.dati = r.ok ? await r.json() : [];
    // quello scritto prima di entrare passa nella propria Lavagna
    const locali = C.memo.get("quaderno", []);
    if (locali.length) {
      try {
        for (let i = 0; i < locali.length; i += 150) await C.mio("quaderno-salva", { voci: locali.slice(i, i + 150) });
        this.dati = [...locali.filter((x) => !this.dati.some((y) => y.id === x.id)), ...this.dati];
        C.memo.set("quaderno", []);
      } catch {}
    }
    return this.dati;
  },
  async salva(x) {
    x.aggiornato = new Date().toISOString();
    const tutto = await this.tutto();
    const i = tutto.findIndex((y) => y.id === x.id);
    if (i >= 0) tutto[i] = x; else tutto.unshift(x);
    if (C.io()) await C.mio("quaderno-salva", x); else C.memo.set("quaderno", tutto);
  },
  async togli(id) {
    const tutto = await this.tutto();
    const i = tutto.findIndex((y) => y.id === id);
    if (i >= 0) tutto.splice(i, 1);
    if (C.io()) await C.mio("quaderno-togli", { id }); else C.memo.set("quaderno", tutto);
  },
  async appunti(video) { return (await this.tutto()).filter((x) => x.tipo === "appunto" && (!video || x.video === video)).sort((a, b) => a.video === b.video ? a.da - b.da : 0); },
  async lezioni() { return (await this.tutto()).filter((x) => x.tipo === "lezione"); },
};

// ——— esportare ———
function scarica(nome, testo, tipo) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([testo], { type: tipo }));
  a.download = nome; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function stampa(html) {
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(f);
  f.srcdoc = html;
  f.onload = () => { setTimeout(() => { f.contentWindow.focus(); f.contentWindow.print(); setTimeout(() => f.remove(), 2000); }, 300); };
}
const nomeFile = (x) => (String(x || "lavagna").normalize("NFD").replace(/\p{M}/gu, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "lavagna").toLowerCase();
const csvCella = (x) => `"${String(x ?? "").replace(/"/g, '""')}"`;
const STILE_EXPORT = `body{font:16px/1.55 Georgia,serif;color:#1d2420;max-width:780px;margin:40px auto;padding:0 20px}
h1{font-size:30px;margin:0 0 6px}h2{font-size:21px;margin:36px 0 8px;border-bottom:1px solid #ddd6c6;padding-bottom:4px}
.sotto{color:#66706a;margin:0 0 24px;font-style:italic}.pezzo{display:grid;grid-template-columns:200px 1fr;gap:16px;margin:18px 0;page-break-inside:avoid}
.pezzo img{width:200px;border-radius:6px;display:block}.tc{font:600 13px system-ui,sans-serif;color:#c4572e}.tc a{color:inherit}
blockquote{margin:8px 0;padding:6px 12px;border-left:3px solid #ddd6c6;color:#444;font-size:14.5px}
.domanda{background:#f3efe4;padding:12px 16px;border-radius:8px}.testo{white-space:pre-wrap}
.fonti li{margin:4px 0;font-size:14px}.piede{margin-top:40px;color:#888;font:12px system-ui,sans-serif}
.st-mappa{overflow-x:auto}.st-mappa svg{max-width:100%;height:auto}dl.st-glossario dt{font-weight:700;margin-top:8px}dl.st-glossario dd{margin:2px 0 0 0}
ol.st-tempo{list-style:none;padding:0;border-left:3px solid #c4572e}ol.st-tempo li{margin:0 0 10px;padding-left:14px}ol.st-tempo b{display:block;color:#c4572e}
@media(max-width:560px){.pezzo{grid-template-columns:1fr}.pezzo img{width:100%}}@media print{body{margin:0}a{color:inherit}}`;
const paginaExport = (titolo, corpo) => `<!doctype html><html lang="${C.ui()}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(titolo)}</title><style>${STILE_EXPORT}</style></head><body>${corpo}<p class="piede">Lavagna · ${new Date().toLocaleDateString(C.ui() === "it" ? "it-IT" : "en-GB")}</p></body></html>`;

async function pezzoHTML(p, conFoto = true) {
  const f = conFoto ? await fotogramma(p.video, p.da, p.durata) : null;
  return `<div class="pezzo">${f ? `<div><img src="${f.src}" alt="${esc(s(f.circa ? "circa" : "fotogramma"))} ${tempo(p.da)}"></div>` : "<div></div>"}<div>
    <div class="tc"><a href="${linkYT(p.video, p.da)}">${tempo(p.da)}${p.a > p.da ? `–${tempo(p.a)}` : ""}</a></div>
    ${p.commento || p.testo ? `<p class="testo">${esc(p.commento || p.testo)}</p>` : ""}
    ${p.estratto ? `<blockquote>${esc(p.estratto)}</blockquote>` : ""}</div></div>`;
}
async function esportaAppunti(lista, formato, titolo) {
  const perVideo = new Map();
  for (const p of lista) { if (!perVideo.has(p.video)) perVideo.set(p.video, []); perVideo.get(p.video).push(p); }
  const nome = nomeFile(titolo);
  if (formato === "csv") {
    const righe = [["video", "titolo", "canale", "da", "a", "link", "commento", "estratto"].join(",")];
    for (const p of lista) righe.push([p.video, p.titoloVideo, p.nomeCanale, tempo(p.da), p.a > p.da ? tempo(p.a) : "", linkYT(p.video, p.da), p.testo, p.estratto].map(csvCella).join(","));
    return scarica(`${nome}.csv`, "﻿" + righe.join("\r\n"), "text/csv;charset=utf-8");
  }
  if (formato === "md") {
    let md = `# ${titolo}\n`;
    for (const [id, ps] of perVideo) {
      md += `\n## ${ps[0].titoloVideo || id}${ps[0].nomeCanale ? ` — ${ps[0].nomeCanale}` : ""}\n`;
      for (const p of ps) md += `\n### [${tempo(p.da)}${p.a > p.da ? `–${tempo(p.a)}` : ""}](${linkYT(p.video, p.da)})\n${p.testo ? `\n${p.testo}\n` : ""}${p.estratto ? `\n> ${p.estratto}\n` : ""}`;
    }
    return scarica(`${nome}.md`, md, "text/markdown;charset=utf-8");
  }
  let corpo = `<h1>${esc(titolo)}</h1>`;
  for (const [id, ps] of perVideo) {
    corpo += `<h2>${esc(ps[0].titoloVideo || id)}</h2><p class="sotto">${esc(ps[0].nomeCanale || "")} · <a href="${linkYT(id)}">YouTube</a></p>`;
    for (const p of ps) corpo += await pezzoHTML(p);
  }
  const html = paginaExport(titolo, corpo);
  if (formato === "stampa") return stampa(html);
  return scarica(`${nome}.html`, html, "text/html;charset=utf-8");
}
const menuEsporta = (dove, fai, opz = {}) => {
  dove.innerHTML = `<label class="esporta">${s("esporta")}: <select><option value="">…</option>
    <option value="html">${s("html")}</option><option value="stampa">${s("stampa")}</option><option value="md">${s("md")}</option>${opz.csv !== false ? `<option value="csv">${s("csv")}</option>` : ""}</select></label>`;
  const sel = dove.querySelector("select");
  sel.onchange = async () => { const f = sel.value; sel.value = ""; if (f) { sel.disabled = true; try { await fai(f); } finally { sel.disabled = false; } } };
};

// ——— chiedere la trascrizione di un video che non ce l'ha: subito con una chiave Gemini gratuita, oppure in coda ———
// (la richiesta in coda è già registrata: la pagina ha chiesto la trascrizione e il server se l'è segnata)
export function chiediTrascrizione(box, id, fonte, fatto) {
  const chiave = C.memo.get("chiaveGemini", "");
  box.innerHTML = `<div class="tr-manca"><p><strong>${fonte === "nessuna" ? s("nessunParlato") : s("nessunaTr")}</strong></p>
    <div class="chiedi-due">
      <div class="chiedi"><h4>${s("subitoT")}</h4><p class="sotto">${s("conGemini")} <a class="link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">${s("prendiChiave")} ↗</a></p>
        <form class="g-form">${chiave ? "" : `<input type="password" class="g-chiave" placeholder="${s("chiaveGemini")}" autocomplete="off" required aria-label="${s("chiaveGemini")}">`}
        <button class="bott on">${s("trascrivi")}</button>${chiave ? ` <button type="button" class="link g-cambia">${s("cambiaChiave")}</button>` : ""}</form>
        <p class="msg g-msg" role="status"></p></div>
      <div class="chiedi"><h4>${s("codaT")}</h4><p class="sotto">${s("codaTesto")}</p></div>
    </div></div>`;
  box.querySelector(".g-cambia")?.addEventListener("click", () => { C.memo.set("chiaveGemini", ""); chiediTrascrizione(box, id, fonte, fatto); });
  box.querySelector(".g-form").onsubmit = async (e) => {
    e.preventDefault();
    const k = chiave || box.querySelector(".g-chiave").value.trim();
    if (!k) return;
    const b = e.target.querySelector("button"); b.disabled = true;
    const msg = box.querySelector(".g-msg");
    msg.textContent = s("ascolta");
    const r = await fetch(`/api/parlato/${id}/gemini`, { method: "POST", headers: { "x-gemini-key": k } }).catch(() => null);
    const d = await r?.json().catch(() => ({})) || {};
    if (!box.isConnected) return;
    if (r?.ok && d.righe?.length) { C.memo.set("chiaveGemini", k); trascrizioni.set(id, Promise.resolve(d)); C.avvisa(s("fatta")); fatto?.(); return; }
    b.disabled = false;
    if (d.errore === "chiave") C.memo.set("chiaveGemini", "");
    msg.textContent = { chiave: s("erroreChiave"), quota: s("erroreQuota"), troppe: s("erroreTroppe"), vuota: s("erroreVuota") }[d.errore] || s("erroreGemini");
    if (d.errore === "chiave") setTimeout(() => chiediTrascrizione(box, id, fonte, fatto), 2500);
  };
}

// ——— sotto il video: Trascrizione | Appunti ———
export function pannelloVideo(dove, v, lettore) {
  let scheda = C.memo.get("schedaStudio", "tr"), giro = null, tr = null, chiuso = false;
  dove.innerHTML = `<div class="sv"><div class="sv-schede" role="tablist">
      <button role="tab" data-p="tr">${s("trascrizione")}</button><button role="tab" data-p="ap">${s("appunti")} <small id="svN"></small></button></div>
    <div class="sv-corpo" id="svCorpo"></div></div>`;
  const corpo = $("#svCorpo", dove);
  const ora = () => { try { return lettore()?.tempo?.() || 0; } catch { return 0; } };
  const vai = (t) => { try { lettore()?.vai?.(t); lettore()?.play?.(); } catch {} };
  const contaAppunti = async () => { const n = (await Q.appunti(v.id)).length; const el = $("#svN", dove); if (el) el.textContent = n ? `(${n})` : ""; };
  const apri = (p) => {
    scheda = p; C.memo.set("schedaStudio", p);
    dove.querySelectorAll(".sv-schede button").forEach((b) => { b.classList.toggle("on", b.dataset.p === p); b.setAttribute("aria-selected", String(b.dataset.p === p)); });
    clearInterval(giro);
    return p === "tr" ? mostraTrascrizione() : mostraAppunti();
  };
  dove.querySelectorAll(".sv-schede button").forEach((b) => b.onclick = () => apri(b.dataset.p));

  async function mostraTrascrizione() {
    corpo.innerHTML = `<p class="sv-attesa">…</p>`;
    tr = await trascrizione(v.id);
    if (chiuso || scheda !== "tr") return;
    if (!tr.righe?.length) return mancante();
    corpo.innerHTML = `<div class="tr-barra"><input type="search" id="trQ" placeholder="${s("cercaQui")}" aria-label="${s("cercaQui")}">
        <span class="tr-n" id="trN"></span><button class="bott piccolo" id="trSu" aria-label="↑">↑</button><button class="bott piccolo" id="trGiu" aria-label="↓">↓</button>
        <label class="tr-segui"><input type="checkbox" id="trSegui" ${C.memo.get("trSegui", true) ? "checked" : ""}> ${s("segui")}</label></div>
      <div class="tr-righe" id="trRighe">${tr.righe.map(([t, x], i) => `<div class="tr-riga" data-i="${i}"><button class="tc" data-t="${t}">${tempo(t)}</button><span class="tx">${esc(x)}</span><button class="tr-nota" data-t="${t}" title="${s("nuovoAppunto", tempo(t))}" aria-label="${s("nuovoAppunto", tempo(t))}">✎</button></div>`).join("")}</div>
      <p class="tr-fonte">${esc(s("fonte")[tr.fonte] || "")}${tr.lingua ? ` · ${tr.lingua.toUpperCase()}` : ""}</p>`;
    const box = $("#trRighe", corpo), righe = [...box.querySelectorAll(".tr-riga")];
    box.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.classList.contains("tr-nota")) { apri("ap").then(() => moduloAppunto({ da: Number(b.dataset.t) })); return; }
      vai(Number(b.dataset.t));
    };
    // cerca dentro questa trascrizione (senza accenti)
    const norm = (x) => x.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
    const testi = tr.righe.map(([, x]) => norm(x));
    let trovate = [], qui = 0;
    const evidenzia = () => {
      righe.forEach((r) => r.classList.remove("trovata", "questa"));
      trovate.forEach((i) => righe[i].classList.add("trovata"));
      if (trovate.length) { righe[trovate[qui]].classList.add("questa"); righe[trovate[qui]].scrollIntoView({ block: "center", behavior: "smooth" }); }
      $("#trN", corpo).textContent = $("#trQ", corpo).value.trim().length > 1 ? (trovate.length ? `${qui + 1} / ${trovate.length}` : s("nienteQui")) : "";
    };
    $("#trQ", corpo).oninput = (e) => {
      const q = norm(e.target.value.trim());
      trovate = q.length > 1 ? testi.map((x, i) => (x.includes(q) ? i : -1)).filter((i) => i >= 0) : [];
      qui = 0; evidenzia();
    };
    $("#trQ", corpo).onkeydown = (e) => { if (e.key === "Enter" && trovate.length) { e.preventDefault(); vai(tr.righe[trovate[qui]][0]); } };
    $("#trSu", corpo).onclick = () => { if (trovate.length) { qui = (qui - 1 + trovate.length) % trovate.length; evidenzia(); } };
    $("#trGiu", corpo).onclick = () => { if (trovate.length) { qui = (qui + 1) % trovate.length; evidenzia(); } };
    $("#trSegui", corpo).onchange = (e) => C.memo.set("trSegui", e.target.checked);
    let ultima = -1;
    giro = setInterval(() => {
      const t = ora();
      let i = -1; for (let k = 0; k < tr.righe.length && tr.righe[k][0] <= t + 0.3; k++) i = k;
      if (i === ultima) return;
      righe[ultima]?.classList.remove("ora"); righe[i]?.classList.add("ora"); ultima = i;
      if ($("#trSegui", corpo)?.checked && i >= 0 && document.activeElement !== $("#trQ", corpo)) {
        const r = righe[i]; box.scrollTo({ top: r.offsetTop - box.offsetTop - box.clientHeight / 3, behavior: "smooth" });
      }
    }, 600);
  }

  function mancante() {
    chiediTrascrizione(corpo, v.id, tr.fonte, () => { if (!chiuso && scheda === "tr") mostraTrascrizione(); });
  }

  async function mostraAppunti() {
    const lista = await Q.appunti(v.id);
    if (chiuso || scheda !== "ap") return;
    contaAppunti();
    corpo.innerHTML = `<div class="ap-barra"><button class="bott on" id="apNuovo">${s("nuovoAppunto", tempo(ora()))}</button><span id="apEsporta"></span></div>
      <div id="apModulo"></div>
      ${C.io() ? "" : `<p class="ap-nota">${s("localeNota")}</p>`}
      <div class="ap-lista" id="apLista">${lista.length ? "" : `<p class="sotto">${s("nessunAppunto")}</p>`}</div>`;
    clearInterval(giro);
    giro = setInterval(() => { const b = $("#apNuovo", corpo); if (b) b.textContent = s("nuovoAppunto", tempo(ora())); }, 1000);
    $("#apNuovo", corpo).onclick = () => moduloAppunto({ da: Math.max(0, Math.floor(ora()) - 5) });
    if (lista.length) menuEsporta($("#apEsporta", corpo), (f) => esportaAppunti(lista, f, `${s("appuntiDi")} — ${v.titolo}`));
    const box = $("#apLista", corpo);
    for (const p of lista) {
      const el = document.createElement("div");
      el.className = "ap"; el.dataset.id = p.id;
      el.innerHTML = `<button class="ap-foto" aria-label="${s("vai")} ${tempo(p.da)}"><span class="ap-tc">${tempo(p.da)}${p.a > p.da ? `–${tempo(p.a)}` : ""}</span></button>
        <div class="ap-testo">${p.testo ? `<p>${esc(p.testo)}</p>` : ""}${p.estratto ? `<blockquote>${esc(p.estratto)}</blockquote>` : ""}
        <div class="ap-azioni"><button class="link" data-a="vai">▶ ${s("vai")}</button><button class="link" data-a="mod">${s("modifica")}</button>
        <button class="link" data-a="lez">${s("allaLezione")}</button><button class="link" data-a="via">${s("togli")}</button></div><div class="ap-dove"></div></div>`;
      box.appendChild(el);
      fotogramma(p.video, p.da, v.durata).then((f) => { if (f) el.querySelector(".ap-foto").style.backgroundImage = `url(${f.src})`; });
      el.onclick = async (e) => {
        const a = e.target.closest("[data-a]")?.dataset.a || (e.target.closest(".ap-foto") ? "vai" : "");
        if (a === "vai") vai(p.da);
        if (a === "mod") moduloAppunto(p);
        if (a === "via") { await Q.togli(p.id); mostraAppunti(); }
        if (a === "lez") sceltaLezione(el.querySelector(".ap-dove"), bloccoDaAppunto(p));
      };
    }
  }

  async function moduloAppunto(p) {
    const m = $("#apModulo", corpo);
    if (!m) return;
    const nuovo = !p.id;
    const righe = (await trascrizione(v.id)).righe || [];
    const da0 = p.da ?? Math.floor(ora()), a0 = p.a ?? da0 + 30;
    m.innerHTML = `<form class="ap-form" id="apForm">
      <div class="ap-tempi"><label>${s("da")} <input name="da" value="${tempo(da0)}" inputmode="numeric" size="7"></label><button type="button" class="link" data-adesso="da">⟲ ${s("adesso")}</button>
        <label>${s("a")} <input name="a" value="${tempo(a0)}" inputmode="numeric" size="7"></label><button type="button" class="link" data-adesso="a">⟲ ${s("adesso")}</button></div>
      <div class="ap-anteprima"><img id="apFoto" alt=""><div><label class="vh" for="apTesto">${s("commento")}</label>
        <textarea name="testo" id="apTesto" rows="3" placeholder="${s("commentoPh")}">${esc(p.testo || "")}</textarea></div></div>
      ${righe.length ? `<p class="ap-estr-t">${s("estratto")}</p><blockquote class="ap-estr" id="apEstr"></blockquote>` : ""}
      <div><button class="bott on">${s("salva")}</button> <button type="button" class="bott" id="apAnnulla">${s("annulla")}</button></div></form>`;
    const f = $("#apForm", m);
    const leggi = () => ({ da: secondi(f.da.value), a: secondi(f.a.value) });
    const aggiorna = async () => {
      const { da, a } = leggi();
      if ($("#apEstr", m)) $("#apEstr", m).textContent = Number.isFinite(da) ? estrattoDa(righe, da, a) : "";
      const fo = Number.isFinite(da) ? await fotogramma(v.id, da, v.durata) : null;
      if ($("#apFoto", m)) { $("#apFoto", m).src = fo?.src || ""; $("#apFoto", m).hidden = !fo; }
    };
    f.da.onchange = f.a.onchange = aggiorna; aggiorna();
    m.querySelectorAll("[data-adesso]").forEach((b) => b.onclick = () => { f[b.dataset.adesso].value = tempo(ora()); aggiorna(); });
    $("#apAnnulla", m).onclick = () => { m.innerHTML = ""; };
    f.querySelector("textarea").focus();
    f.onsubmit = async (e) => {
      e.preventDefault();
      let { da, a } = leggi();
      if (!Number.isFinite(da)) { f.da.focus(); return; }
      if (!Number.isFinite(a) || a <= da) a = 0;
      const x = { ...(nuovo ? { id: nuovoId(), tipo: "appunto", creato: new Date().toISOString() } : p),
        video: v.id, titoloVideo: v.titolo, nomeCanale: v.nomeCanale || "", durata: v.durata || 0,
        da, a, testo: f.testo.value.trim(), estratto: estrattoDa(righe, da, a || da + 30) };
      await Q.salva(x);
      m.innerHTML = "";
      mostraAppunti();
    };
  }

  apri(scheda);
  contaAppunti();
  return { chiudi() { chiuso = true; clearInterval(giro); }, video(nv) { Object.assign(v, nv); } };
}

// ——— un appunto → un blocco di lezione ———
const bloccoDaAppunto = (p) => ({ tipo: "video", video: p.video, titoloVideo: p.titoloVideo, nomeCanale: p.nomeCanale, durata: p.durata, da: p.da, a: p.a || p.da + 30, commento: p.testo, estratto: p.estratto, mostraTesto: false });
async function sceltaLezione(dove, blocco) {
  const lezioni = await Q.lezioni();
  dove.innerHTML = `<label>${s("scegliLezione")} <select><option value="">…</option>
    ${lezioni.map((l) => `<option value="${l.id}">${esc(l.titolo || s("senzaTitolo"))}</option>`).join("")}
    <option value="+">＋ ${s("nuovaLezioneDa")}</option></select></label>`;
  dove.querySelector("select").onchange = async (e) => {
    const v = e.target.value; if (!v) return;
    let l = v === "+" ? nuovaLezione() : lezioni.find((x) => x.id === v);
    l.blocchi.push({ ...blocco, id: nuovoId() });
    await Q.salva(l);
    dove.innerHTML = `<span class="ok-agg">${esc(s("aggiuntoA", l.titolo || s("senzaTitolo")))} · <a class="link" href="#/lezione/${l.id}/monta">→</a></span>`;
  };
}
const nuovaLezione = () => ({ id: nuovoId(), tipo: "lezione", titolo: "", sottotitolo: "", autore: C.io()?.nome || "", blocchi: [], creato: new Date().toISOString() });

// ——— nella ricerca: i momenti esatti in cui se ne parla ———
export async function sezioneParlato(box, q) {
  box.innerHTML = "";
  const d = await fetch(`/api/parlato?q=${encodeURIComponent(q)}`).then((r) => r.json()).catch(() => []);
  if (!box.isConnected || !d.length) return;
  const norm = (x) => x.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const parole = norm(q).split(/[^\p{L}\p{N}]+/u).filter((p) => p.length >= 2);
  const radici = parole.map((p) => { const r = p.replace(/(es|s)$/, "").replace(/h?[aeiouy]+$/, ""); return r.length >= 3 ? r : p; });
  const segna = (x) => esc(x).split(/(\s+)/).map((w) => radici.some((p) => norm(w).startsWith(p)) ? `<mark>${w}</mark>` : w).join("");
  box.innerHTML = `<h2 class="blocco">${s("nelParlato")} <small>${s("nelParlatoSotto")}</small></h2>
    <div class="parlato-esiti">${d.map((x, i) => `<a class="pe" href="#/v/${x.id}" data-i="${i}">
      <span class="pe-foto" style="background-image:url(https://i.ytimg.com/vi/${x.id}/mqdefault.jpg)"><span class="pe-tc">${tempo(x.da)}</span></span>
      <span class="pe-testo"><strong>${esc(x.titolo || "…")}</strong><small>${esc(x.nomeCanale || "")}</small><span class="pe-estr">«${segna(x.estratto)}»</span></span></a>`).join("")}</div>`;
  box.onclick = (e) => {
    const a = e.target.closest("a.pe"); if (!a) return;
    e.preventDefault();
    const x = d[a.dataset.i];
    C.apriVideo(x.id, x.da);
  };
  // titoli dei video che non sono nell'indice
  d.forEach((x, i) => { if (!x.titolo) fetch(`/api/video/${x.id}`).then((r) => r.json()).then((v) => { const el = box.querySelector(`[data-i="${i}"] strong`); if (el && v.titolo) { el.textContent = v.titolo; box.querySelector(`[data-i="${i}"] small`).textContent = v.nomeCanale || ""; } }).catch(() => {}); });
}

// ——— Scuola ———
export async function vistaScuola() {
  C.schede("scuola");
  const vista = C.vista;
  vista.innerHTML = `<h1>✎ ${s("scuola")}</h1><p class="sotto">${s("scuolaSotto")}</p>
    <div class="scuola-porte">
      <section class="porta porta-una"><h2>${s("creaLezione")}</h2><p>${s("creaLezioneSotto")}</p><button class="bott on grande" data-nuova="1">＋ ${s("nuovaLezione")}</button></section>
    </div>
    ${C.io() ? "" : `<p class="ap-nota">${s("localeNota")}</p>`}
    <section><h2 class="blocco">${s("leMieLezioni")}</h2><div id="sLez" class="s-lista"></div></section>
    <section><h2 class="blocco">${s("iMieiAppunti")} <small id="sApN"></small> <span id="sApEsporta"></span></h2><div id="sAp"></div></section>`;
  vista.querySelectorAll("[data-nuova]").forEach((b) => b.onclick = async () => {
    const l = nuovaLezione();
    await Q.salva(l);
    location.hash = `#/lezione/${l.id}/argomento`;
  });
  const lezioni = await Q.lezioni();
  const voce = (l) => `<a class="s-voce" href="#/lezione/${l.id}"><strong>${esc(l.titolo || s("senzaTitolo"))}</strong>
    <small>${esc(l.sottotitolo || "")}${l.sottotitolo ? " · " : ""}${l.blocchi.length} · ${new Date(l.aggiornato || l.creato).toLocaleDateString(C.ui() === "it" ? "it-IT" : "en-GB")}${l.pubblico ? " · 🔗" : ""}</small></a>`;
  const lez = lezioni;
  $("#sLez").innerHTML = lez.length ? lez.map(voce).join("") : `<p class="sotto">${s("nessunaLezione")}</p>`;
  const ap = await Q.appunti();
  $("#sApN").textContent = ap.length || "";
  if (!ap.length) { $("#sAp").innerHTML = `<p class="sotto">${s("nessunaLezione")}</p>`; return; }
  menuEsporta($("#sApEsporta"), (f) => esportaAppunti(ap, f, s("iMieiAppunti")));
  const perVideo = new Map();
  for (const p of ap) { if (!perVideo.has(p.video)) perVideo.set(p.video, []); perVideo.get(p.video).push(p); }
  $("#sAp").innerHTML = [...perVideo].map(([id, ps]) => `<div class="s-video"><a href="#/v/${id}"><strong>${esc(ps[0].titoloVideo || id)}</strong></a> <small>${esc(ps[0].nomeCanale || "")}</small>
    <ul>${ps.map((p) => `<li><a class="link" href="#/v/${id}" data-v="${id}" data-t="${p.da}">${tempo(p.da)}${p.a > p.da ? `–${tempo(p.a)}` : ""}</a> ${esc(p.testo || p.estratto || "").slice(0, 160)}</li>`).join("")}</ul></div>`).join("");
  $("#sAp").onclick = (e) => { const a = e.target.closest("[data-t]"); if (a) { e.preventDefault(); C.apriVideo(a.dataset.v, Number(a.dataset.t)); } };
}

// ——— strumenti didattici della lezione: mappa mentale, glossario, linea del tempo, domande per ripassare ———
// Si scrivono come testo semplice (una riga per voce) e si vedono subito disegnati; l'AI può fare una prima proposta dai video.
const STRUMENTI = ["mappa", "glossario", "tempo", "domande"];
const PAROLE_S = {
  en: {
    pStrumenti: "Tools", vaiAStrumenti: "Next: learning tools →",
    g35: "Add the tools that help to study the topic. Write them as simple lines, or let Lavagna propose them from the pieces of video you chose, then fix them as you like. All optional.",
    mappa: "Mind map", glossario: "Glossary", tempo: "Timeline", domande: "Review questions",
    mappaGuida: "One idea per line. Indent with two spaces to go one level deeper. The centre is the title of the lesson.",
    glossarioGuida: "One word per line: word: explanation", tempoGuida: "One event per line: date: what happened", domandeGuida: "One per line: question? answer",
    mappaEs: "Gravity\n  bends space-time\n  tides\nBlack hole\n  event horizon\n  spaghettification",
    glossarioEs: "Event horizon: the border beyond which nothing comes back", tempoEs: "1915: Einstein publishes general relativity", domandeEs: "What is the event horizon? The border beyond which not even light comes back",
    proponi: "✨ Propose from the videos", proponendo: "Reading the pieces of video…", proposto: "Here is a proposal: check the facts (AI can be wrong) and change it as you like.",
    erroreAI: "The proposal did not work now. Try again in a while, or write it yourself.", troppeAI: "Enough proposals from here for today. Try again tomorrow.",
    serveMateriale: "Add some video pieces (or text) first: the proposal is made from them.",
    mostraRisposta: "Show the answer", anteprimaT: "How it looks",
  },
  it: {
    pStrumenti: "Strumenti", vaiAStrumenti: "Avanti: strumenti per studiare →",
    g35: "Aggiungi gli strumenti che aiutano a studiare l'argomento. Si scrivono come righe semplici, oppure Lavagna li propone dai pezzi di video che hai scelto e tu li sistemi come vuoi. Tutti facoltativi.",
    mappa: "Mappa mentale", glossario: "Glossario", tempo: "Linea del tempo", domande: "Domande per ripassare",
    mappaGuida: "Un'idea per riga. Rientra di due spazi per scendere di un livello. Al centro c'è il titolo della lezione.",
    glossarioGuida: "Una parola per riga: parola: spiegazione", tempoGuida: "Un fatto per riga: data: cosa è successo", domandeGuida: "Una per riga: domanda? risposta",
    mappaEs: "Gravità\n  curva lo spazio-tempo\n  maree\nBuco nero\n  orizzonte degli eventi\n  spaghettificazione",
    glossarioEs: "Orizzonte degli eventi: il confine oltre il quale niente torna indietro", tempoEs: "1915: Einstein pubblica la relatività generale", domandeEs: "Che cos'è l'orizzonte degli eventi? Il confine oltre il quale nemmeno la luce torna indietro",
    proponi: "✨ Proponi dai video", proponendo: "Leggo i pezzi di video…", proposto: "Ecco una proposta: controlla i fatti (l'AI può sbagliare) e cambiala come vuoi.",
    erroreAI: "La proposta ora non è riuscita. Riprova fra un po', o scrivila tu.", troppeAI: "Basta proposte da qui per oggi. Riprova domani.",
    serveMateriale: "Prima aggiungi qualche pezzo di video (o un testo): la proposta si fa da lì.",
    mostraRisposta: "Mostra la risposta", anteprimaT: "Come viene",
  },
};
const ws = (k) => PAROLE_S[C.ui()]?.[k] ?? PAROLE_S.en[k];
const righeDi = (t) => String(t || "").split("\n").map((x) => x.replace(/\s+$/, "")).filter((x) => x.trim());
const coppia = (r, sep) => { const i = r.indexOf(sep); return i > 0 ? [r.slice(0, i + (sep === "?" ? 1 : 0)).trim(), r.slice(i + 1).trim()] : [r.trim(), ""]; };
export const glossarioDa = (t) => righeDi(t).map((r) => coppia(r.replace(/^\s*[-*•]\s*/, ""), ":"));
export const tempoDa = (t) => righeDi(t).map((r) => coppia(r.replace(/^\s*[-*•]\s*/, ""), ":"));
export const domandeDa = (t) => righeDi(t).map((r) => { r = r.replace(/^\s*[-*•\d.)]+\s*/, ""); return r.includes("|") ? r.split("|").map((x) => x.trim()) : coppia(r, "?"); });
function alberoDa(testo, radice) {
  const root = { t: radice, f: [] }, pila = [{ liv: -1, n: root }];
  for (const riga of righeDi(testo)) {
    const m = riga.replace(/\t/g, "  ").match(/^(\s*)(?:[-*•]\s*)?(.*)$/);
    const liv = Math.floor(m[1].length / 2), t = m[2].trim();
    if (!t) continue;
    while (pila.at(-1).liv >= liv) pila.pop();
    const n = { t, f: [] };
    pila.at(-1).n.f.push(n); pila.push({ liv, n });
  }
  return root;
}
const COLORI = ["#c4572e", "#2f6f8f", "#6f8a2a", "#8a4f9a", "#b8892a", "#2f8a6f", "#9a4f5f", "#4f5f9a"];
// la mappa: il titolo al centro, i rami metà a destra e metà a sinistra
export function svgMappa(testo, titolo) {
  const root = alberoDa(testo, titolo || "…");
  const W = 170, COL = 214, GAP = 10;
  const a_capo = (t, n) => { const out = []; let r = ""; for (const p of t.split(/\s+/)) { if ((r + " " + p).trim().length > n && r) { out.push(r); r = p; } else r = (r + " " + p).trim(); } if (r) out.push(r); return out.slice(0, 4); };
  const misura = (n) => { n.r = a_capo(n.t, n === root ? 20 : 21); n.h = n.r.length * 16 + 16; n.f.forEach(misura); const sotto = n.f.reduce((a, c) => a + c.H, 0) + GAP * Math.max(0, n.f.length - 1); n.H = Math.max(n.h, sotto); n.S = sotto; };
  misura(root);
  const k = root.f.length, destra = root.f.slice(0, Math.ceil(k / 2)), sinistra = root.f.slice(Math.ceil(k / 2));
  const alt = (l) => l.reduce((a, c) => a + c.H, 0) + GAP * 2 * Math.max(0, l.length - 1);
  const prof = (n) => 1 + Math.max(0, ...n.f.map(prof));
  const pd = Math.max(0, ...destra.map(prof)), ps = Math.max(0, ...sinistra.map(prof));
  const H = Math.max(root.h, alt(destra), alt(sinistra)) + 40, Wt = (pd + ps) * COL + W + 60;
  const cx = 30 + ps * COL + W / 2, cy = H / 2;
  const linee = [], nodi = [];
  const nodo = (n, x, y, col, liv) => {
    const w = liv === 0 ? W + 16 : W, fondo = liv === 0 ? "#253b32" : liv === 1 ? col : "#fbf9f3", testo = liv <= 1 ? "#ffffff" : "#1d2420";
    nodi.push(`<rect x="${x - w / 2}" y="${y - n.h / 2}" width="${w}" height="${n.h}" rx="10" fill="${fondo}" stroke="${liv > 1 ? col : liv === 0 ? "#e07a50" : fondo}" stroke-width="${liv === 0 ? 2 : 1.5}"/>`
      + n.r.map((r, i) => `<text x="${x}" y="${y - n.h / 2 + 20 + i * 16}" text-anchor="middle" font-size="${liv === 0 ? 14 : 13}" font-weight="${liv <= 1 ? 600 : 400}" fill="${testo}">${esc(r)}</text>`).join(""));
  };
  const disponi = (n, x, y, col, liv, dir, px, py) => {
    const x0 = px + dir * (liv === 1 ? (W + 16) / 2 : W / 2), x1 = x - dir * W / 2, xm = (x0 + x1) / 2;
    linee.push(`<path d="M${x0},${py} C${xm},${py} ${xm},${y} ${x1},${y}" fill="none" stroke="${col}" stroke-width="2" opacity=".8"/>`);
    nodo(n, x, y, col, liv);
    let yy = y - n.S / 2;
    for (const c of n.f) { disponi(c, x + dir * COL, yy + c.H / 2, col, liv + 1, dir, x, y); yy += c.H + GAP; }
  };
  const lato = (lista, dir, primo) => { let y = cy - alt(lista) / 2; lista.forEach((n, i) => { disponi(n, cx + dir * COL, y + n.H / 2, COLORI[(primo + i) % COLORI.length], 1, dir, cx, cy); y += n.H + GAP * 2; }); };
  lato(destra, 1, 0); lato(sinistra, -1, destra.length);
  nodo(root, cx, cy, "", 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Wt} ${H}" width="${Wt}" height="${H}" font-family="system-ui, -apple-system, sans-serif" role="img" aria-label="${esc(titolo || "")}">${linee.join("")}${nodi.join("")}</svg>`;
}
export function htmlStrumento(tipo, testo, titolo, statico = false) {
  if (!righeDi(testo).length) return "";
  if (tipo === "mappa") return `<div class="st-mappa">${svgMappa(testo, titolo)}</div>`;
  if (tipo === "glossario") return `<dl class="st-glossario">${glossarioDa(testo).map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl>`;
  if (tipo === "tempo") return `<ol class="st-tempo">${tempoDa(testo).map(([a, b]) => `<li><b>${esc(a)}</b><span>${esc(b)}</span></li>`).join("")}</ol>`;
  if (statico) return `<div class="st-domande">${domandeDa(testo).map(([a, b]) => `<p><b>${esc(a)}</b><br><i>${esc(b)}</i></p>`).join("")}</div>`;
  return `<div class="st-domande">${domandeDa(testo).map(([a, b]) => `<details><summary>${esc(a)}</summary><p>${esc(b)}</p></details>`).join("")}</div>`;
}
const strumentiDi = (l) => STRUMENTI.filter((k) => righeDi(l.strumenti?.[k]).length && !l.blocchi.some((b) => b.tipo === "strumento" && b.k === k));
function mdStrumento(k, testo) {
  if (k === "mappa") return righeDi(testo).map((r) => { const m = r.replace(/\t/g, "  ").match(/^(\s*)(?:[-*•]\s*)?(.*)$/); return `${"  ".repeat(Math.floor(m[1].length / 2))}- ${m[2].trim()}`; }).join("\n");
  if (k === "domande") return domandeDa(testo).map(([a, b]) => `**${a}**  \n${b}`).join("\n\n");
  return (k === "glossario" ? glossarioDa(testo) : tempoDa(testo)).map(([a, b]) => `- **${a}**${b ? `: ${b}` : ""}`).join("\n");
}
const materialeDi = (l) => [l.titolo, l.sottotitolo, ...l.blocchi.map((b) => b.tipo === "video" ? `[${b.titoloVideo}] ${b.commento || ""} ${b.estratto || ""}` : b.tipo === "strumento" ? "" : b.testo)].filter(Boolean).join("\n").slice(0, 9000);

// ——— costruire una lezione / ricerca, passo per passo ———
// 1 argomento → 2 scegli i video (proposti sull'argomento, cerca, link, appunti) → 3 monta (ordine, pezzi, titoli, domande) → 4 pubblica
const PASSI = ["argomento", "video", "monta", "pubblica"]; // gli strumenti (mappa, glossario…) stanno nella linea del montaggio
const PAROLE_W = {
  en: {
    passo: (n) => `Step ${n}`, pArgomento: "Topic", pVideo: "Choose videos", pMonta: "Put it together", pPubblica: "Publish",
    g1: "What is it about? The title is used to find videos for you. Add a few search words if the title is not enough.",
    paroleCerca: "Words to search for (optional)", paroleEs: "e.g. black hole, general relativity",
    g2: (t) => `Videos about «${t}». Add the ones you need: you will pick the exact piece in the next step. You can also search other words, paste a link or use your notes.`,
    cerca: "Search", dettoNei: "Said in videos", inLavagna: "In Lavagna", suYouTube: "On YouTube", mieiAppunti: "My notes", unLink: "A link",
    dettoSotto: "the exact moment where it is said: the piece is ready", lavagnaSotto: "hand-picked videos", ytSotto: "everything on YouTube, no Shorts",
    aggiungi: "＋ Add", nellaLezione: "In the lesson · remove", anteprima: "▶ Preview", chiudiAnteprima: "Close preview",
    cesto: (n) => `In the lesson: ${n} video${n === 1 ? "" : "s"}`, cestoVuoto: "Nothing yet: add videos from the list.",
    nienteQui: "Nothing here. Try other words or another tab.", cercando: "Searching…",
    incolla: "Paste a YouTube link (with or without the minute)", aggiungiLink: "Add",
    g3: "For each video choose the piece to show: «✂ Choose the piece» if it has a transcript (search a word, tap where it starts and where it ends), or «▶ Watch and mark». Several pieces of the same video: «＋ Another piece». Order with ↑ ↓; between blocks you can add a title, a text or a question.",
    scegliPezzo: "✂ Choose the piece", chiudiPezzo: "Close", tocca: "Tap the sentence where the piece starts, then the one where it ends.",
    toccaFine: "Now tap where it ends.", provaPezzo: "▶ Try the piece", senzaTrascrizione: "No transcript for this video: type the minutes, or try the piece to find them.",
    qui: "Here:", altroVideo: "＋ Video",
    guardaSegna: "▶ Watch and mark", altroPezzo: "＋ Another piece of this video",
    sp1: "Search a word (or scroll).", sp2: "Tap the sentence where the piece starts.", sp3: "Tap the sentence where it ends. Need more pieces? «＋ Another piece».",
    fatto: (a, b) => `Piece: ${a}–${b}.`, oppureGuarda: "Meanwhile you can use «▶ Watch and mark»: play the video and press «Start here» and «End here».",
    guardaIstr: "Play the video; when the piece starts press «Start here», when it ends «End here».", inizioQui: "⏱ Start here", fineQui: "⏱ End here",
    g4: "Try it as your class will see it, then publish it: you get a link to send. You can also download it.",
    riepilogo: (b, v, d) => `${b} blocks · ${v} video excerpts · ${d} of video`,
    prova: "▶ Try the presentation", pubblicaLink: "Publish with a link", pubblicata: "Published. Send this link:", copia: "Copy",
    entraPrima: "To publish with a link you need your own Lavagna: one tap with a passkey, no email. Then come back here.", creaLaMia: "Create my Lavagna →",
    scarica: "Download", altro: "Other", indietro: "← Back", avanti: "Next →",
    vaiAVideo: "Next: choose the videos →", vaiAMonta: "Next: put it together →", vaiAPubblica: "Next: publish →",
    serveTitolo: "Write a title first.", serveVideo: "Add at least one video, or go on and use only text.",
  },
  it: {
    passo: (n) => `Passo ${n}`, pArgomento: "Argomento", pVideo: "Scegli i video", pMonta: "Monta", pPubblica: "Pubblica",
    g1: "Di cosa parla? Il titolo serve a cercarti i video. Aggiungi qualche parola di ricerca se il titolo non basta.",
    paroleCerca: "Parole da cercare (facoltative)", paroleEs: "es. buco nero, relatività generale",
    g2: (t) => `Video che parlano di «${t}». Aggiungi quelli che servono: il pezzo esatto lo scegli al passo dopo. Puoi anche cercare altre parole, incollare un link o usare i tuoi appunti.`,
    cerca: "Cerca", dettoNei: "Detto nei video", inLavagna: "In Lavagna", suYouTube: "Su YouTube", mieiAppunti: "I miei appunti", unLink: "Un link",
    dettoSotto: "il momento esatto in cui se ne parla: il pezzo è già pronto", lavagnaSotto: "video scelti a mano", ytSotto: "tutto YouTube, senza Shorts",
    aggiungi: "＋ Aggiungi", nellaLezione: "Nella lezione · togli", anteprima: "▶ Anteprima", chiudiAnteprima: "Chiudi anteprima",
    cesto: (n) => `Nella lezione: ${n} video`, cestoVuoto: "Ancora niente: aggiungi video dall'elenco.",
    nienteQui: "Niente qui. Prova altre parole o un'altra scheda.", cercando: "Cerco…",
    incolla: "Incolla un link di YouTube (anche con il minuto)", aggiungiLink: "Aggiungi",
    g3: "Per ogni video scegli il pezzo da mostrare: «✂ Scegli il pezzo» se ha la trascrizione (cerca una parola, tocca dove comincia e dove finisce), oppure «▶ Guarda e segna». Più pezzi dello stesso video: «＋ Un altro pezzo». L'ordine si cambia con ↑ ↓; fra un blocco e l'altro puoi mettere un titolo, un testo o una domanda.",
    scegliPezzo: "✂ Scegli il pezzo", chiudiPezzo: "Chiudi", tocca: "Tocca la frase dove comincia il pezzo, poi quella dove finisce.",
    toccaFine: "Ora tocca dove finisce.", provaPezzo: "▶ Prova il pezzo", senzaTrascrizione: "Questo video non ha la trascrizione: scrivi i minuti, oppure prova il pezzo per trovarli.",
    qui: "Qui:", altroVideo: "＋ Video",
    guardaSegna: "▶ Guarda e segna", altroPezzo: "＋ Un altro pezzo di questo video",
    sp1: "Cerca una parola (o scorri).", sp2: "Tocca la frase dove comincia il pezzo.", sp3: "Tocca la frase dove finisce. Servono altri pezzi? «＋ Un altro pezzo».",
    fatto: (a, b) => `Pezzo: ${a}–${b}.`, oppureGuarda: "Intanto puoi usare «▶ Guarda e segna»: fai partire il video e premi «Inizio qui» e «Fine qui».",
    guardaIstr: "Fai partire il video; quando comincia il pezzo premi «Inizio qui», quando finisce «Fine qui».", inizioQui: "⏱ Inizio qui", fineQui: "⏱ Fine qui",
    g4: "Provala come la vedrà la classe, poi pubblicala: avrai un link da mandare. Puoi anche scaricarla.",
    riepilogo: (b, v, d) => `${b} blocchi · ${v} estratti di video · ${d} di video`,
    prova: "▶ Prova la presentazione", pubblicaLink: "Pubblica con un link", pubblicata: "Pubblicata. Manda questo link:", copia: "Copia",
    entraPrima: "Per pubblicare con un link serve la tua Lavagna: un tocco con la passkey, niente email. Poi torna qui.", creaLaMia: "Crea la mia Lavagna →",
    scarica: "Scarica", altro: "Altro", indietro: "← Indietro", avanti: "Avanti →",
    vaiAVideo: "Avanti: scegli i video →", vaiAMonta: "Avanti: monta la lezione →", vaiAPubblica: "Avanti: pubblica →",
    serveTitolo: "Prima scrivi un titolo.", serveVideo: "Aggiungi almeno un video, oppure vai avanti e usa solo testo.",
  },
};
const w = (k, ...a) => { const v = PAROLE_W[C.ui()]?.[k] ?? PAROLE_S[C.ui()]?.[k] ?? PAROLE_W.en[k] ?? PAROLE_S.en[k]; return typeof v === "function" ? v(...a) : v; };
const pulisciDescr = (x = "") => String(x).replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim().slice(0, 180);

export async function vistaLezione(arg) {
  C.schede("scuola");
  const [id, chiesto] = String(arg).split("/");
  const vista = C.vista;
  const l = (await Q.lezioni()).find((x) => x.id === id);
  if (!l) { vista.innerHTML = `<p class="vuoto">${s("nonTrovata")}</p>`; return; }
  const passo = PASSI.includes(chiesto) ? chiesto : PASSI.includes(l.passo) ? l.passo : l.passo === "strumenti" ? "monta" : "argomento";
  const n = PASSI.indexOf(passo);
  const studente = false; // insegnanti e studenti creano allo stesso modo
  let timer = null;
  const salvaPresto = (subito) => {
    const st = $("#lStato"); if (st) st.textContent = s("salvaInCorso");
    clearTimeout(timer);
    timer = setTimeout(async () => { timer = null; try { await Q.salva(l); const st2 = $("#lStato"); if (st2) st2.textContent = s("salvato"); } catch (e) { const st2 = $("#lStato"); if (st2) st2.textContent = e.message; } }, subito ? 0 : 700);
  };
  let chiudiPasso = () => {};
  C.pulisci(() => { chiudiPasso(); if (timer) { clearTimeout(timer); Q.salva(l).catch(() => {}); } });
  if (l.passo !== passo) { l.passo = passo; salvaPresto(true); }
  const nomi = ["pArgomento", "pVideo", "pMonta", "pPubblica"];
  vista.innerHTML = `<div class="guidata">
    <p class="l-su"><a class="link" href="#/scuola">← ${s("scuola")}</a> <span class="l-tipo">${s(studente ? "ricerca" : "lezione")}</span>
      <strong class="l-nome">${esc(l.titolo || s("senzaTitolo"))}</strong> <span class="l-stato" id="lStato"></span></p>
    <ol class="passi">${PASSI.map((p, i) => `<li class="${i === n ? "on" : i < n ? "fatto" : ""}"><a href="#/lezione/${l.id}/${p}"><span class="pn">${i + 1}</span>${w(nomi[i])}</a></li>`).join("")}</ol>
    <section class="passo" id="passo"></section>
    <div class="passo-nav">${n > 0 ? `<a class="bott" href="#/lezione/${l.id}/${PASSI[n - 1]}">${w("indietro")}</a>` : "<span></span>"}
      ${n < PASSI.length - 1 ? `<button class="bott on grande" id="avanti">${w(["vaiAVideo", "vaiAMonta", "vaiAPubblica"][n])}</button>` : ""}</div>
    <p class="msg" id="pMsg" role="status"></p></div>`;
  const avanti = $("#avanti");
  if (avanti) avanti.onclick = () => {
    if (passo === "argomento" && !l.titolo.trim()) { $("#pMsg").textContent = w("serveTitolo"); $("#lTitolo")?.focus(); return; }
    if (timer) { clearTimeout(timer); timer = null; Q.salva(l).catch(() => {}); }
    location.hash = `#/lezione/${l.id}/${PASSI[n + 1]}`;
  };
  const box = $("#passo");
  const titoloPasso = (g) => `<h2 class="passo-t">${w("passo", n + 1)} · ${w(nomi[n])}</h2><p class="guida">${g}</p>`;
  if (passo === "argomento") return passoArgomento(box, l, salvaPresto, titoloPasso, studente);
  if (passo === "video") chiudiPasso = await passoVideo(box, l, salvaPresto, titoloPasso);
  if (passo === "monta") chiudiPasso = await passoMonta(box, l, salvaPresto, titoloPasso);
  if (passo === "pubblica") passoPubblica(box, l, salvaPresto, titoloPasso);
}

function passoArgomento(box, l, salvaPresto, titoloPasso, studente) {
  box.innerHTML = titoloPasso(w("g1")) + `<div class="l-testa">
    <label>${s(studente ? "titoloRicerca" : "titoloLezione")}<input class="l-titolo" id="lTitolo" value="${esc(l.titolo)}"></label>
    <label>${s(studente ? "domandaRicerca" : "classe")}<input id="lSotto" value="${esc(l.sottotitolo)}"></label>
    <label>${s("autore")}<input id="lAutore" value="${esc(l.autore)}"></label>
    <label>${w("paroleCerca")}<input id="lParole" placeholder="${w("paroleEs")}" value="${esc(l.parole || "")}"></label></div>`;
  const campo = (sel, k) => { $(sel).oninput = (e) => { l[k] = e.target.value; if (k === "titolo") $(".l-nome").textContent = l.titolo || s("senzaTitolo"); salvaPresto(); }; };
  campo("#lTitolo", "titolo"); campo("#lSotto", "sottotitolo"); campo("#lAutore", "autore"); campo("#lParole", "parole");
  $("#lTitolo").focus();
  box.querySelectorAll("input").forEach((i) => i.addEventListener("keydown", (e) => { if (e.key === "Enter") $("#avanti").click(); }));
}

// il pezzo di partenza: dal momento trovato nel parlato, oppure l'inizio (video brevi: tutto)
function bloccoVideo(v, da) {
  const dur = Number(v.durata) || 0;
  let inizio = Number.isFinite(da) && da > 0 ? Math.max(0, Math.floor(da) - 3) : 0;
  let fine = inizio ? inizio + 60 : dur && dur <= 300 ? dur : 60;
  if (dur && fine > dur) fine = dur;
  return { id: nuovoId(), tipo: "video", video: v.id, titoloVideo: v.titolo || v.id, nomeCanale: v.nomeCanale || "", durata: dur, da: inizio, a: fine, commento: "", estratto: v.estratto || "", mostraTesto: false };
}

async function passoVideo(box, l, salvaPresto, titoloPasso) {
  const q0 = (l.parole || l.titolo || "").trim();
  let scheda = "detto", q = q0, risultati = {}, chiuso = false;
  box.innerHTML = titoloPasso(w("g2", esc(l.titolo || q0))) + `<div class="sv-griglia">
    <div><form class="cerca-l" id="wCerca"><input id="wQ" value="${esc(q)}" aria-label="${w("cerca")}"><button class="bott on">${w("cerca")}</button></form>
      <div class="w-schede" id="wSchede" role="tablist"></div><p class="w-sotto" id="wSotto"></p><div id="wRisultati"></div></div>
    <aside class="cesto" id="wCesto"></aside></div>`;
  const dentro = () => new Set(l.blocchi.filter((b) => b.tipo === "video").map((b) => b.video));
  const cesto = () => {
    const v = l.blocchi.filter((b) => b.tipo === "video" && b.video);
    $("#wCesto").innerHTML = `<h3>${w("cesto", v.length)}</h3>${v.length ? `<ol>${v.map((b) => `<li><img src="https://i.ytimg.com/vi/${b.video}/default.jpg" alt=""><span>${esc(b.titoloVideo)}<small>${tempo(b.da)}–${tempo(b.a)}</small></span><button class="link" data-togli="${b.id}" aria-label="${s("togli")}">✕</button></li>`).join("")}</ol>` : `<p class="sotto">${w("cestoVuoto")}</p>`}`;
  };
  $("#wCesto").onclick = (e) => { const b = e.target.closest("[data-togli]"); if (!b) return; l.blocchi = l.blocchi.filter((x) => x.id !== b.dataset.togli); salvaPresto(); cesto(); disegna(); };
  const SCHEDE = [["detto", "dettoNei", "dettoSotto"], ["lavagna", "inLavagna", "lavagnaSotto"], ["yt", "suYouTube", "ytSotto"], ["appunti", "mieiAppunti", ""], ["link", "unLink", ""]];
  const schede = () => {
    $("#wSchede").innerHTML = SCHEDE.map(([k, nome]) => { const r = risultati[k]; const c = Array.isArray(r) ? ` <small>${r.length}</small>` : ""; return `<button role="tab" data-k="${k}" class="${k === scheda ? "on" : ""}">${w(nome)}${c}</button>`; }).join("");
    $("#wSotto").textContent = w(SCHEDE.find((x) => x[0] === scheda)[2]) || "";
  };
  $("#wSchede").onclick = (e) => { const b = e.target.closest("[data-k]"); if (b) { scheda = b.dataset.k; schede(); disegna(); } };
  const carta = (v, i) => {
    const gia = dentro().has(v.id);
    return `<div class="w-carta${gia ? " gia" : ""}" data-i="${i}"><div class="w-foto" style="background-image:url(https://i.ytimg.com/vi/${v.id}/mqdefault.jpg)">${v.da ? `<span class="pe-tc">${tempo(v.da)}</span>` : v.durata ? `<span class="pe-tc">${tempo(v.durata)}</span>` : ""}</div>
      <div class="w-testo"><strong>${esc(v.titolo || v.id)}</strong><small>${esc(v.nomeCanale || "")}${v.quando ? ` · ${esc(v.quando)}` : ""}</small>
      ${v.estratto ? `<span class="pe-estr">«${esc(v.estratto)}»</span>` : v.descr ? `<span class="w-descr">${esc(v.descr)}</span>` : ""}
      <div class="w-azioni"><button class="bott ${gia ? "" : "on"} piccolo" data-a="agg">${gia ? w("nellaLezione") : w("aggiungi")}</button><button class="bott piccolo" data-a="ant">${w("anteprima")}</button></div></div></div>`;
  };
  async function disegna() {
    const out = $("#wRisultati"); if (!out) return;
    if (scheda === "link") {
      out.innerHTML = `<form class="cerca-l" id="wLink"><input id="wL" placeholder="${w("incolla")}"><button class="bott on">${w("aggiungiLink")}</button></form><p class="msg" id="wLMsg"></p>`;
      $("#wLink").onsubmit = async (e) => {
        e.preventDefault();
        const x = idDaLink($("#wL").value); if (!x) { $("#wLMsg").textContent = s("videoNonValido"); return; }
        const info = await fetch(`/api/video/${x.id}`).then((r) => r.json()).catch(() => ({}));
        l.blocchi.push(bloccoVideo({ id: x.id, titolo: info.titolo, nomeCanale: info.nomeCanale, durata: info.durata }, x.da));
        salvaPresto(); cesto(); $("#wL").value = ""; $("#wLMsg").textContent = `${info.titolo || x.id} · ${w("nellaLezione").split(" · ")[0]}`;
      };
      return;
    }
    const lista = risultati[scheda];
    if (!Array.isArray(lista)) { out.innerHTML = `<p class="sotto">${w("cercando")}</p>`; return; }
    out.innerHTML = lista.length ? `<div class="w-lista">${lista.map(carta).join("")}</div>` : `<p class="sotto">${w("nienteQui")}</p>`;
    out.onclick = async (e) => {
      const b = e.target.closest("[data-a]"); if (!b) return;
      const el = b.closest(".w-carta"), v = lista[el.dataset.i];
      if (b.dataset.a === "ant") {
        const f = el.querySelector(".w-foto");
        if (f.querySelector("iframe")) { f.innerHTML = ""; b.textContent = w("anteprima"); return; }
        f.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&start=${Math.floor(v.da || 0)}&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="${esc(v.titolo || "")}"></iframe>`;
        b.textContent = w("chiudiAnteprima");
        return;
      }
      if (dentro().has(v.id)) l.blocchi = l.blocchi.filter((x) => !(x.tipo === "video" && x.video === v.id));
      else {
        const blocco = v.blocco ? { ...v.blocco, id: nuovoId() } : bloccoVideo(v, v.da);
        if (!v.titolo) fetch(`/api/video/${v.id}`).then((r) => r.json()).then((i) => { Object.assign(blocco, { titoloVideo: i.titolo || v.id, nomeCanale: i.nomeCanale || "", durata: i.durata || 0 }); salvaPresto(); if (!chiuso) cesto(); }).catch(() => {});
        l.blocchi.push(blocco);
        if (!blocco.estratto) trascrizione(v.id).then((t) => { if (t.righe?.length) { blocco.estratto = estrattoDa(t.righe, blocco.da, blocco.a); salvaPresto(); } });
      }
      salvaPresto(); cesto(); disegna();
    };
  }
  async function cerca() {
    risultati = {};
    schede(); disegna();
    const ui = C.ui();
    const appunti = await Q.appunti();
    const parole = q.toLowerCase().split(/\s+/).filter((x) => x.length > 2);
    risultati.appunti = appunti.map((p) => ({ id: p.video, titolo: p.titoloVideo, nomeCanale: p.nomeCanale, durata: p.durata, da: p.da, estratto: p.testo || p.estratto, blocco: bloccoDaAppunto(p) }))
      .sort((a, b) => Number(parole.some((x) => `${b.titolo} ${b.estratto}`.toLowerCase().includes(x))) - Number(parole.some((x) => `${a.titolo} ${a.estratto}`.toLowerCase().includes(x))));
    const lavori = [
      fetch(`/api/parlato?q=${encodeURIComponent(q)}`).then((r) => r.json()).catch(() => []).then((d) => {
        const visti = new Set();
        risultati.detto = d.filter((x) => !visti.has(x.id) && visti.add(x.id)).map((x) => ({ id: x.id, titolo: x.titolo, nomeCanale: x.nomeCanale, durata: x.durata, da: x.da, estratto: x.estratto }));
        // video fuori dall'indice: titolo e canale si leggono a parte
        risultati.detto.filter((x) => !x.titolo).forEach((x) => fetch(`/api/video/${x.id}`).then((r) => r.json()).then((v) => {
          Object.assign(x, { titolo: v.titolo || x.id, nomeCanale: v.nomeCanale || "", durata: v.durata || 0 });
          l.blocchi.filter((b) => b.video === x.id && b.titoloVideo === x.id).forEach((b) => Object.assign(b, { titoloVideo: x.titolo, nomeCanale: x.nomeCanale, durata: x.durata }));
          if (!chiuso) { cesto(); if (scheda === "detto") disegna(); }
        }).catch(() => {}));
      }),
      fetch(`/api/cerca?${new URLSearchParams({ q, cat: "", durata: "", fonte: "yt", ordine: "data", lingua: "" })}`).then((r) => r.json()).catch(() => ({})).then((d) => {
        const visti = new Set();
        risultati.lavagna = [...(d.parole || []), ...(d.significato || [])].filter((x) => /^[\w-]{11}$/.test(x.id) && !visti.has(x.id) && visti.add(x.id)).slice(0, 24)
          .map((x) => ({ id: x.id, titolo: x.titolo, nomeCanale: x.nomeCanale, durata: x.durata, descr: pulisciDescr(x.descrizione) }));
      }),
      fetch(`/api/youtube?q=${encodeURIComponent(q)}&ui=${ui}`).then((r) => r.json()).catch(() => ({})).then((d) => {
        risultati.yt = (d.video || []).map((x) => ({ id: x.id, titolo: x.titolo, nomeCanale: x.nomeCanale, durata: x.durata, quando: x.quando, descr: pulisciDescr(x.descrizione) }));
      }),
    ];
    lavori.forEach((p) => p.then(() => { if (chiuso) return; schede(); disegna(); }));
    await Promise.all(lavori);
    if (chiuso) return;
    // si apre la prima scheda che ha qualcosa
    if (!risultati[scheda]?.length) { scheda = ["detto", "lavagna", "yt", "appunti"].find((k) => risultati[k]?.length) || "detto"; schede(); disegna(); }
  }
  $("#wCerca").onsubmit = (e) => { e.preventDefault(); q = $("#wQ").value.trim(); if (q.length > 1) cerca(); };
  cesto();
  if (q.length > 1) cerca(); else { schede(); disegna(); }
  return () => { chiuso = true; };
}

function passoMonta(box, l, salvaPresto, titoloPasso) {
  return montatore(box, l, salvaPresto, titoloPasso, { C, esc, s, tempo, secondi, nuovoId, estrattoDa, trascrizione, fotogramma, chiediTrascrizione, Q, idDaLink, htmlStrumento, ws, STRUMENTI, materialeDi });
}

function passoPubblica(box, l, salvaPresto, titoloPasso) {
  const video = l.blocchi.filter((b) => b.tipo === "video" && b.video);
  const durata = video.reduce((n, b) => n + Math.max(0, b.a - b.da), 0);
  box.innerHTML = titoloPasso(w("g4")) + `<p class="riepilogo">${w("riepilogo", l.blocchi.length, video.length, tempo(durata))}</p>
    <div class="pubblica-carte">
      <div class="porta"><h3>1 · ${w("prova").replace("▶ ", "")}</h3><a class="bott on grande" href="#/presenta/${l.id}">${w("prova")}</a></div>
      <div class="porta"><h3>2 · ${w("pubblicaLink")}</h3><div id="pLink"></div></div>
      <div class="porta"><h3>${w("scarica")}</h3><span id="lEsporta"></span></div>
    </div>
    <p class="l-altro">${w("altro")}: <button class="link" id="lDuplica">${s("duplica")}</button> · <button class="link" id="lElimina">${s("elimina")}</button></p>`;
  menuEsporta($("#lEsporta"), (f) => esportaLezione(l, f), { csv: false });
  const link = () => {
    const d = $("#pLink");
    if (!C.io()) { d.innerHTML = `<p class="sotto">${w("entraPrima")}</p><a class="bott on" href="#/mia">${w("creaLaMia")}</a>`; return; }
    if (!l.pubblico) { d.innerHTML = `<button class="bott on grande" id="pPubblica">${w("pubblicaLink")}</button>`; $("#pPubblica").onclick = cambia; return; }
    const url = `${location.origin}/l/${l.pubblico}`;
    d.innerHTML = `<p>${w("pubblicata")}</p><div class="link-pronto"><input readonly value="${url}" aria-label="link"><button class="bott on" id="pCopia">${w("copia")}</button></div>
      <p><button class="link" id="pTogli">${s("togliLink")}</button></p>`;
    $("#pCopia").onclick = async () => { try { await navigator.clipboard.writeText(url); C.avvisa(s("linkCopiato")); } catch { d.querySelector("input").select(); } };
    $("#pTogli").onclick = cambia;
  };
  async function cambia() {
    await Q.salva(l);
    const d = await C.mio("quaderno-condividi", { id: l.id, togli: !!l.pubblico });
    l.pubblico = d.pubblico || undefined;
    link();
  }
  link();
  $("#lDuplica").onclick = async () => {
    const c = { ...structuredClone(l), id: nuovoId(), pubblico: undefined, passo: "monta", titolo: `${l.titolo || s("senzaTitolo")} (2)`, creato: new Date().toISOString() };
    await Q.salva(c); location.hash = `#/lezione/${c.id}/monta`;
  };
  $("#lElimina").onclick = async () => { if (!confirm(s("eliminaChiedi"))) return; await Q.togli(l.id); location.hash = "#/scuola"; };
}

// ——— esportare una lezione ———
async function esportaLezione(l, formato) {
  const titolo = l.titolo || s("senzaTitolo");
  const video = l.blocchi.filter((b) => b.tipo === "video" && b.video);
  if (formato === "md") {
    let md = `# ${titolo}\n${l.sottotitolo ? `\n*${l.sottotitolo}*\n` : ""}${l.autore ? `\n${l.autore}\n` : ""}`;
    for (const b of l.blocchi) {
      if (b.tipo === "titolo") md += `\n## ${b.testo}\n`;
      if (b.tipo === "testo") md += `\n${b.testo}\n`;
      if (b.tipo === "domanda") md += `\n> **${s("tDomanda")}:** ${b.testo}\n`;
      if (b.tipo === "strumento" && righeDi(b.testo).length) md += `\n## ${ws(b.k)}\n\n${mdStrumento(b.k, b.testo)}\n`;
      if (b.tipo === "video" && b.video) md += `\n**[${b.titoloVideo} · ${tempo(b.da)}–${tempo(b.a)}](${linkYT(b.video, b.da)})**${b.nomeCanale ? ` — ${b.nomeCanale}` : ""}\n${b.commento ? `\n${b.commento}\n` : ""}${b.estratto ? `\n> ${b.estratto}\n` : ""}`;
    }
    for (const k of strumentiDi(l)) md += `\n## ${ws(k)}\n\n${mdStrumento(k, l.strumenti[k])}\n`;
    if (video.length) md += `\n## ${s("fonti")}\n\n${fonti(video).map((f) => `- ${f.titolo}${f.canale ? `, ${f.canale}` : ""} — ${f.tempi} — ${linkYT(f.id)}`).join("\n")}\n`;
    return scarica(`${nomeFile(titolo)}.md`, md, "text/markdown;charset=utf-8");
  }
  let corpo = `<h1>${esc(titolo)}</h1><p class="sotto">${esc([l.sottotitolo, l.autore].filter(Boolean).join(" · "))}</p>`;
  for (const b of l.blocchi) {
    if (b.tipo === "titolo") corpo += `<h2>${esc(b.testo)}</h2>`;
    if (b.tipo === "testo") corpo += `<p class="testo">${esc(b.testo)}</p>`;
    if (b.tipo === "domanda") corpo += `<p class="domanda"><strong>${s("tDomanda")}:</strong> ${esc(b.testo)}</p>`;
    if (b.tipo === "strumento" && righeDi(b.testo).length) corpo += `<h2>${ws(b.k)}</h2>${htmlStrumento(b.k, b.testo, l.titolo, true)}`;
    if (b.tipo === "video" && b.video) corpo += `<p><strong>${esc(b.titoloVideo || b.video)}</strong>${b.nomeCanale ? ` — ${esc(b.nomeCanale)}` : ""}</p>` + await pezzoHTML({ ...b, testo: b.commento });
  }
  for (const k of strumentiDi(l)) corpo += `<h2>${ws(k)}</h2>${htmlStrumento(k, l.strumenti[k], l.titolo, true)}`;
  if (video.length) corpo += `<h2>${s("fonti")}</h2><ul class="fonti">${fonti(video).map((f) => `<li>${esc(f.titolo)}${f.canale ? `, ${esc(f.canale)}` : ""} — ${f.tempi} — <a href="${linkYT(f.id)}">${linkYT(f.id)}</a></li>`).join("")}</ul>`;
  const html = paginaExport(titolo, corpo);
  if (formato === "stampa") return stampa(html);
  return scarica(`${nomeFile(titolo)}.html`, html, "text/html;charset=utf-8");
}
function fonti(video) {
  const m = new Map();
  for (const b of video) {
    if (!m.has(b.video)) m.set(b.video, { id: b.video, titolo: b.titoloVideo || b.video, canale: b.nomeCanale || "", pezzi: [] });
    m.get(b.video).pezzi.push(`${tempo(b.da)}–${tempo(b.a)}`);
  }
  return [...m.values()].map((f) => ({ ...f, tempi: f.pezzi.join(", ") }));
}

// ——— una lezione condivisa: si guarda, si presenta, si copia nel proprio quaderno ———
export async function vistaLezionePubblica(pub) {
  C.schede("scuola");
  const vista = C.vista;
  const l = await fetch(`/api/lezione/${pub}`).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  if (!l) { vista.innerHTML = `<p class="vuoto">${s("nonTrovata")}</p>`; return; }
  document.title = `${l.titolo || s("senzaTitolo")} — Lavagna`;
  vista.innerHTML = `<div class="l-pubblica"><p class="l-su"><span class="l-tipo">${s("lezione")}</span></p>
    <h1>${esc(l.titolo || s("senzaTitolo"))}</h1><p class="sotto">${esc([l.sottotitolo, l.autore].filter(Boolean).join(" · "))}</p>
    <div class="l-strumenti"><a class="bott on" href="#/presenta-l/${pub}">${s("presenta")}</a><button class="bott" id="lCopia">${s("copiaMia")}</button><span id="lEsporta"></span></div>
    <div class="l-leggi">${l.blocchi.map((b) => b.tipo === "titolo" ? `<h2 class="blocco">${esc(b.testo)}</h2>`
      : b.tipo === "testo" ? `<p class="testo">${esc(b.testo)}</p>`
      : b.tipo === "domanda" ? `<p class="domanda"><strong>${s("tDomanda")}:</strong> ${esc(b.testo)}</p>`
      : b.tipo === "strumento" ? (righeDi(b.testo).length ? `<h2 class="blocco">${ws(b.k)}</h2>${htmlStrumento(b.k, b.testo, l.titolo)}` : "")
      : b.video ? `<div class="l-pezzo"><a href="#/v/${b.video}" data-v="${b.video}" data-t="${b.da}" class="l-pfoto" style="background-image:url(https://i.ytimg.com/vi/${b.video}/mqdefault.jpg)"><span class="pe-tc">${tempo(b.da)}–${tempo(b.a)}</span></a>
          <div><strong>${esc(b.titoloVideo || "")}</strong> <small>${esc(b.nomeCanale || "")}</small>${b.commento ? `<p>${esc(b.commento)}</p>` : ""}${b.estratto ? `<blockquote>${esc(b.estratto)}</blockquote>` : ""}</div></div>` : "").join("")}
    ${strumentiDi(l).map((k) => `<h2 class="blocco">${ws(k)}</h2>${htmlStrumento(k, l.strumenti[k], l.titolo)}`).join("")}</div></div>`;
  vista.querySelector(".l-leggi").onclick = (e) => { const a = e.target.closest("[data-t]"); if (a) { e.preventDefault(); C.apriVideo(a.dataset.v, Number(a.dataset.t)); } };
  menuEsporta($("#lEsporta"), (f) => esportaLezione(l, f), { csv: false });
  $("#lCopia").onclick = async () => {
    const c = { ...l, id: nuovoId(), tipo: "lezione", pubblico: undefined, aggiornato: undefined, creato: new Date().toISOString(), blocchi: l.blocchi.map((b) => ({ ...b, id: nuovoId() })) };
    await Q.salva(c); C.avvisa(s("copiata")); location.hash = `#/lezione/${c.id}/monta`;
  };
}

// ——— presentare: a tutto schermo, un blocco per volta; gli estratti partono e finiscono dove devono ———
export async function vistaPresenta(id, pubblica = false) {
  const l = pubblica ? await fetch(`/api/lezione/${id}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) : (await Q.lezioni()).find((x) => x.id === id);
  const indietro = pubblica ? `#/l/${id}` : `#/lezione/${id}`;
  if (!l) { C.vista.innerHTML = `<p class="vuoto">${s("nonTrovata")}</p>`; return; }
  const video = l.blocchi.filter((b) => b.tipo === "video" && b.video);
  const pagine = [{ tipo: "copertina" }, ...l.blocchi.filter((b) => b.tipo !== "video" || b.video), ...strumentiDi(l).map((k) => ({ tipo: "st", k })), ...(video.length ? [{ tipo: "fonti" }] : [{ tipo: "fine" }])];
  let i = 0, player = null, auto = C.memo.get("presentaAuto", false);
  const box = document.createElement("div");
  box.className = "presenta"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", l.titolo || s("presenta"));
  box.innerHTML = `<div class="pr-scena" id="prScena"></div>
    <div class="pr-barra"><button class="pr-b" id="prPrima" aria-label="←">←</button><span id="prN"></span><button class="pr-b" id="prDopo" aria-label="→">→</button>
      <label class="pr-auto"><input type="checkbox" id="prAuto" ${auto ? "checked" : ""}> ${s("auto")}</label>
      <button class="pr-b" id="prSchermo" title="${s("schermoIntero")}" aria-label="${s("schermoIntero")}">⛶</button><button class="pr-b" id="prEsci" title="${s("esci")}" aria-label="${s("esci")}">✕</button></div>`;
  document.body.appendChild(box);
  document.body.classList.add("presentando");
  const chiudiPlayer = () => { try { player?.destroy(); } catch {} player = null; };
  const tasti = (e) => {
    if (e.target.closest?.("input, textarea")) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); vai(i + 1); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); vai(i - 1); }
    if (e.key === "Escape" && !document.fullscreenElement) esci();
  };
  const esci = () => { location.hash = indietro; };
  C.pulisci(() => { chiudiPlayer(); document.removeEventListener("keydown", tasti); box.remove(); document.body.classList.remove("presentando"); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); });
  document.addEventListener("keydown", tasti);
  $("#prPrima", box).onclick = () => vai(i - 1);
  $("#prDopo", box).onclick = () => vai(i + 1);
  $("#prEsci", box).onclick = esci;
  $("#prAuto", box).onchange = (e) => { auto = e.target.checked; C.memo.set("presentaAuto", auto); };
  $("#prSchermo", box).onclick = () => (document.fullscreenElement ? document.exitFullscreen() : box.requestFullscreen?.()).catch?.(() => {});

  async function vai(n) {
    if (n < 0 || n >= pagine.length) return;
    i = n; chiudiPlayer();
    $("#prN", box).textContent = `${i + 1} / ${pagine.length}`;
    $("#prPrima", box).disabled = i === 0; $("#prDopo", box).disabled = i === pagine.length - 1;
    const p = pagine[i], scena = $("#prScena", box);
    scena.className = `pr-scena pr-${p.tipo}`;
    if (p.tipo === "copertina") scena.innerHTML = `<div class="pr-centro"><p class="pr-tipo">${s("lezione")}</p><h1>${esc(l.titolo || s("senzaTitolo"))}</h1>${l.sottotitolo ? `<p class="pr-sotto">${esc(l.sottotitolo)}</p>` : ""}${l.autore ? `<p class="pr-autore">${esc(l.autore)}</p>` : ""}</div>`;
    if (p.tipo === "titolo") scena.innerHTML = `<div class="pr-centro"><h2>${esc(p.testo)}</h2></div>`;
    if (p.tipo === "testo") scena.innerHTML = `<div class="pr-centro"><p class="pr-testo">${esc(p.testo)}</p></div>`;
    if (p.tipo === "domanda") scena.innerHTML = `<div class="pr-centro"><p class="pr-tipo">${s("tDomanda")}</p><p class="pr-domanda">${esc(p.testo)}</p></div>`;
    if (p.tipo === "strumento") scena.innerHTML = `<div class="pr-centro pr-st pr-st-${p.k}"><p class="pr-tipo">${ws(p.k)}</p>${htmlStrumento(p.k, p.testo, l.titolo)}</div>`;
    if (p.tipo === "st") scena.innerHTML = `<div class="pr-centro pr-st pr-st-${p.k}"><p class="pr-tipo">${ws(p.k)}</p>${htmlStrumento(p.k, l.strumenti[p.k], l.titolo)}</div>`;
    if (["titolo", "testo", "domanda", "strumento"].includes(p.tipo) && auto && p.sec) setTimeout(() => pagine[i] === p && auto && vai(i + 1), p.sec * 1000);
    if (p.tipo === "fine") scena.innerHTML = `<div class="pr-centro"><h2>${s("fine")}</h2></div>`;
    if (p.tipo === "fonti") scena.innerHTML = `<div class="pr-centro pr-fonti"><h2>${s("fonti")}</h2><ul>${fonti(video).map((f) => `<li><strong>${esc(f.titolo)}</strong>${f.canale ? ` — ${esc(f.canale)}` : ""} <span>${f.tempi}</span></li>`).join("")}</ul></div>`;
    if (p.tipo === "video") {
      scena.innerHTML = `<div class="pr-video"><div class="pr-schermo"><div id="prPlayer"></div><div class="mo-scritte pr-scritte"></div></div>
        <div class="pr-dida"><p class="pr-vt">${esc(p.titoloVideo || "")} <span>${esc(p.nomeCanale || "")} · ${tempo(p.da)}–${tempo(p.a)}</span></p>
        ${p.commento ? `<p class="pr-commento">${esc(p.commento)}</p>` : ""}${p.mostraTesto && p.estratto ? `<blockquote>${esc(p.estratto)}</blockquote>` : ""}</div></div>`;
      await C.caricaScript("https://www.youtube.com/iframe_api", "onYouTubeIframeAPIReady");
      if (pagine[i] !== p) return;
      const ls = C.linguaSottotitoli();
      player = new YT.Player($("#prPlayer", box), {
        host: "https://www.youtube-nocookie.com", videoId: p.video,
        playerVars: { autoplay: 1, start: Math.floor(p.da), end: Math.ceil(p.a), rel: 0, playsinline: 1, iv_load_policy: 3, hl: ls || C.ui(), cc_lang_pref: ls || C.ui(), cc_load_policy: ls ? 1 : 0 },
        events: {
          onReady: (e) => {
            e.target.playVideo(); e.target.setPlaybackRate?.(C.memo.get("velocita", 1));
            // le scritte sopra il video, ognuna nel suo tempo
            const scritte = p.scritte || (p.scritta ? [{ testo: p.scritta, da: p.da, a: p.a, stile: "sotto" }] : []);
            if (!scritte.length) return;
            const g = setInterval(() => {
              const c = scena.querySelector(".pr-scritte");
              if (pagine[i] !== p || !c) { clearInterval(g); return; }
              const t = player?.getCurrentTime?.() || 0;
              const h = scritte.filter((o) => t >= o.da && t < o.a).map((o) => `<p class="mo-s mo-s-${o.stile || "sotto"}">${esc(o.testo || "")}</p>`).join("");
              if (c.dataset.h !== h) { c.innerHTML = h; c.dataset.h = h; }
            }, 150);
          },
          onStateChange: (e) => { if (e.data === YT.PlayerState.ENDED && auto && pagine[i] === p) setTimeout(() => pagine[i] === p && vai(i + 1), 1200); },
        },
      });
    }
  }
  vai(0);
}
