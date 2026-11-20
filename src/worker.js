import { CATEGORIE } from "./canali.js";
import { PROPOSTE } from "./proposte.js";
import { gestisciConto, utenteDa } from "./conto.js";

const LINGUE = ["it", "en", "es", "de", "fr"]; // lingue dei canali
const PAESE = { it: "IT", es: "ES", de: "DE", fr: "FR" };
import { cercaSuYouTube, infoVideo, paginaCondivisa } from "./youtube.js";
import { lavoroPeriodico, salvaVideo, cerca, statoIndice, videoDiCategoria, videoDiCanale, togliCanale, spostaVideo, home } from "./indice.js";

const CACHE_SECONDI = 1800; // ogni feed si rilegge al massimo ogni mezz'ora
const YT = { "user-agent": "Mozilla/5.0", "accept-language": "it,en", cookie: "SOCS=CAI; CONSENT=YES+" };

const json = (dati, max = 0, stato = 200) =>
  new Response(JSON.stringify(dati), {
    status: stato,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": max ? `public, max-age=${max}` : "no-store" },
  });

const decodifica = (s = "") =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");

const tag = (xml, nome) => {
  const m = xml.match(new RegExp(`<${nome}[^>]*>([\\s\\S]*?)</${nome}>`));
  return m ? decodifica(m[1].trim()) : "";
};

// ——— elenco dei canali: quelli del file, più gli aggiunti dal sito, meno i tolti ———
async function modifiche(env) {
  const m = (await env.LAVAGNA.get("modifiche", "json")) || {};
  return { aggiunti: m.aggiunti || [], tolti: m.tolti || [], scartati: m.scartati || [], argomenti: m.argomenti || [] };
}
// Argomenti creati dal sito: {id, nome, segno, ricerche: [[testo, lingua], …]}; i loro canali stanno in `aggiunti`.
async function elenco(env) {
  const { aggiunti, tolti, argomenti } = await modifiche(env);
  const via = new Set(tolti);
  const nuovi = argomenti.map((a) => ({ id: a.id, nome: a.nome, segno: a.segno, canali: [], creato: true }));
  const fissi = CATEGORIE.map((c) => ({ id: c.id, nome: c.nome, segno: c.segno, canali: c.canali }));
  return [...fissi, ...nuovi].map((c) => ({
    id: c.id, nome: c.nome, segno: c.segno,
    canali: [
      ...c.canali.filter(([id]) => !via.has(id)).map(([id, nome, lingua]) => ({ id, nome, lingua })),
      ...aggiunti.filter((a) => a.cat === c.id).map(({ id, nome, lingua }) => ({ id, nome, lingua, aggiunto: true })),
    ],
    ...(c.creato ? { creato: true } : {}),
  }));
}

function leggiFeed(xml, canale, cat) {
  const video = [];
  for (const [, e] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const link = (e.match(/<link rel="alternate" href="([^"]+)"/) || [])[1] || "";
    if (link.includes("/shorts/")) continue; // niente Shorts
    const vid = tag(e, "yt:videoId");
    if (!vid) continue;
    video.push({
      id: vid,
      titolo: tag(e, "title"),
      data: tag(e, "published"),
      descrizione: tag(e, "media:description").slice(0, 1200),
      viste: Number((e.match(/<media:statistics views="(\d+)"/) || [])[1] || 0),
      canale: canale.id, nomeCanale: canale.nome, lingua: canale.lingua, cat,
    });
  }
  return video;
}

// La playlist UULF… contiene solo i video lunghi del canale (niente Shorts, niente dirette):
// così i 15 posti del feed vanno tutti a video veri. Se manca, si ripiega sul feed del canale.
// La cache è quella di Cloudflare sulla richiesta stessa: una sola richiesta esterna per canale.
async function xmlFeed(id) {
  const opz = { cf: { cacheTtlByStatus: { "200-299": CACHE_SECONDI, "404": 86400, "500-599": 0 } } };
  let r = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${id.slice(2)}`, opz);
  if (!r.ok) r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`, opz);
  return r.ok ? r.text() : "";
}
// ——— altre fonti: ognuna diventa lo stesso formato di video, con `fonte` per sapere come suonarlo ———
const GIORNO = { cf: { cacheTtl: 86400 } };
const MEZZORA = { cf: { cacheTtl: CACHE_SECONDI } };

// Internet Archive: i più scaricati della collezione, 15 diversi ogni giorno
async function feedArchive(canale, cat) {
  const coll = canale.id.slice(3);
  const url = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(`collection:(${coll}) AND mediatype:movies`)}`
    + "&fl[]=identifier&fl[]=title&fl[]=date&fl[]=publicdate&fl[]=description&fl[]=downloads&sort[]=downloads+desc&rows=300&output=json";
  const d = await (await fetch(url, GIORNO)).json();
  const giorno = Math.floor(Date.now() / 864e5);
  const peso = (s) => { let h = giorno; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  const testo = (x) => (Array.isArray(x) ? x.join(" ") : x || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return d.response.docs.sort((a, b) => peso(a.identifier) - peso(b.identifier)).slice(0, 15).map((x) => ({
    id: `ia:${x.identifier}`, fonte: "ia",
    titolo: testo(x.title), data: x.date || x.publicdate || "", descrizione: testo(x.description).slice(0, 1200),
    viste: x.downloads || 0, thumb: `https://archive.org/services/img/${x.identifier}`,
    canale: canale.id, nomeCanale: canale.nome, lingua: canale.lingua, cat,
  }));
}

// Vimeo: feed RSS di un canale o di un utente
async function feedVimeo(canale, cat) {
  const xml = await (await fetch(`https://vimeo.com/${canale.id.slice(6)}/videos/rss`, { ...MEZZORA, headers: { "user-agent": "Mozilla/5.0" } })).text();
  const video = [];
  for (const [, e] of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const clip = (e.match(/clip(\d+)/) || [])[1];
    const player = (e.match(/<media:player url="([^"]+)"/) || [])[1];
    if (!clip || !player) continue;
    const autore = decodifica((e.match(/<media:credit[^>]*>([^<]*)</) || [])[1] || "");
    video.push({
      id: `vm:${clip}`, fonte: "vimeo", embed: decodifica(player),
      titolo: tag(e, "title"), data: new Date(tag(e, "pubDate")).toISOString(),
      descrizione: (autore ? `di ${autore}\n\n` : "") + decodifica(tag(e, "description")).replace(/&hellip;/g, "…"),
      durata: Number((e.match(/duration="(\d+)"/) || [])[1] || 0), viste: 0,
      thumb: decodifica((e.match(/<media:thumbnail[^>]*url="([^"]+)"/) || [])[1] || ""),
      canale: canale.id, nomeCanale: canale.nome, lingua: canale.lingua, cat,
    });
  }
  return video;
}

// PeerTube: video dell'istanza (solo locali) o di un suo canale; si tengono quelli visti almeno 200 volte
async function feedPeertube(canale, cat) {
  const [host, , handle] = canale.id.slice(3).split("/");
  const url = handle ? `https://${host}/api/v1/video-channels/${handle}/videos?sort=-publishedAt&count=40`
    : `https://${host}/api/v1/videos?sort=-publishedAt&count=60&isLocal=true&nsfw=false`;
  const d = await (await fetch(url, MEZZORA)).json();
  return (d.data || []).filter((v) => v.views >= 200 && !v.isLive).slice(0, 15).map((v) => ({
    id: `pt:${host}:${v.shortUUID || v.uuid}`, fonte: "pt", embed: `https://${host}${v.embedPath}`,
    titolo: v.name, data: v.publishedAt, descrizione: (v.description || "").slice(0, 1200),
    durata: v.duration, viste: v.views, thumb: `https://${host}${v.thumbnailPath}`,
    canale: canale.id, nomeCanale: `${canale.nome} · ${v.channel?.displayName || ""}`.replace(/ · $/, ""),
    lingua: canale.lingua, cat,
  }));
}

// RaiPlay: episodi più recenti di un programma. Non si possono suonare qui (serve l'accesso Rai,
// ci sono spot e limiti geografici): le schede aprono l'episodio su raiplay.it.
async function feedRai(canale, cat) {
  const base = "https://www.raiplay.it";
  const prog = await (await fetch(`${base}/programmi/${canale.id.slice(4)}.json`, { ...MEZZORA, headers: { "user-agent": "Mozilla/5.0" } })).json();
  const insiemi = (prog.blocks || []).flatMap((b) => b.sets || []).slice(0, 2);
  const liste = await Promise.all(insiemi.map((st) =>
    fetch(base + st.path_id, { ...MEZZORA, headers: { "user-agent": "Mozilla/5.0" } }).then((r) => r.json()).catch(() => ({}))));
  const visti = new Set();
  const dataDi = (x) => {
    const m = (x.name || "").match(/(\d{2})\/(\d{2})\/(\d{4})\s*$/);
    if (m) return `${m[3]}-${m[2]}-${m[1]}T20:00:00Z`;
    const p = (x.path_id || "").match(/\/video\/(\d{4})\/(\d{2})\//);
    return p ? `${p[1]}-${p[2]}-01T00:00:00Z` : "";
  };
  const secondi = (d = "") => d.split(":").reduce((n, x) => n * 60 + Number(x || 0), 0);
  return liste.flatMap((l) => l.items || []).filter((x) => x.weblink && !visti.has(x.id) && visti.add(x.id)).map((x) => ({
    id: `rai:${x.id}`, fonte: "rai", link: base + x.weblink,
    titolo: x.episode_title || x.toptitle || x.name, data: dataDi(x),
    descrizione: (x.description || "").slice(0, 1200), durata: secondi(x.duration), viste: 0,
    thumb: x.images?.landscape ? base + x.images.landscape : "",
    canale: canale.id, nomeCanale: canale.nome, lingua: canale.lingua, cat,
  })).sort((a, b) => b.data.localeCompare(a.data)).slice(0, 15);
}

async function feed(canale, cat) {
  if (canale.id.startsWith("rai:")) return feedRai(canale, cat);
  if (canale.id.startsWith("ia:")) return feedArchive(canale, cat);
  if (canale.id.startsWith("vimeo:")) return feedVimeo(canale, cat);
  if (canale.id.startsWith("pt:")) return feedPeertube(canale, cat);
  return leggiFeed(await xmlFeed(canale.id), canale, cat);
}

// Internet Archive: il file video vero da mettere nel lettore
async function fileArchive(ident) {
  const d = await (await fetch(`https://archive.org/metadata/${encodeURIComponent(ident)}`, GIORNO)).json();
  const file = d.files || [];
  const scegli = (f) => file.find((x) => f(x.format || "", x.name));
  const f = scegli((fmt) => fmt === "h.264") || scegli((fmt) => fmt === "h.264 IA") || scegli((fmt) => /MPEG4/i.test(fmt))
    || scegli((fmt, n) => n.endsWith(".mp4")) || scegli((fmt) => fmt === "Ogg Video");
  return f ? `https://archive.org/download/${encodeURIComponent(ident)}/${f.name.split("/").map(encodeURIComponent).join("/")}` : null;
}
const ordina = (v) => v.sort((a, b) => b.data.localeCompare(a.data));

// ——— da link, @nome o ID a canale vero ———
async function risolvi(testo) {
  testo = testo.trim();
  let id = (testo.match(/\b(UC[\w-]{22})\b/) || [])[1];
  if (!id) {
    const handle = (testo.match(/@([\w.\-À-ÿ]+)/) || [])[1] || (/^[\w.\-]+$/.test(testo) ? testo : "");
    const video = (testo.match(/(?:v=|youtu\.be\/|\/shorts\/|\/live\/)([\w-]{11})/) || [])[1];
    const url = handle ? `https://www.youtube.com/@${encodeURIComponent(handle)}`
      : video ? `https://www.youtube.com/watch?v=${video}` : "";
    if (!url) return null;
    const pagina = await (await fetch(url, { headers: YT })).text();
    id = (pagina.match(/"externalId":"(UC[\w-]{22})"/) || pagina.match(/"channelId":"(UC[\w-]{22})"/) || [])[1];
    if (!id) return null;
  }
  const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${id}`);
  if (!r.ok) return null;
  const xml = await r.text();
  const nome = tag(xml, "title");
  const ultimi = leggiFeed(await xmlFeed(id), { id, nome, lingua: "" }, "");
  return { id, nome, ultimi: ultimi.slice(0, 4).map(({ id, titolo, data }) => ({ id, titolo, data })), quanti: ultimi.length };
}

const mescola = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ——— scoperta di canali nuovi: ricerca su YouTube per categoria, poi controllo di qualità sul feed ———
const RICERCHE = {
  scienza: [["divulgazione scientifica", "it"], ["fisica spiegata", "it"], ["science explained", "en"], ["astronomy explained", "en"]],
  matematica: [["matematica spiegata", "it"], ["math explained", "en"]],
  scacchi: [["scacchi partite commentate", "it"], ["chess analysis", "en"]],
  dibattiti: [["dibattito conferenza", "it"], ["debate", "en"]],
  storia: [["storia documentario", "it"], ["history documentary", "en"]],
  filosofia: [["filosofia spiegata", "it"], ["philosophy explained", "en"]],
  ingegneria: [["ingegneria come funziona", "it"], ["engineering explained", "en"]],
  tech: [["recensione tecnologia", "it"], ["programmazione", "it"], ["tech review", "en"], ["programming", "en"]],
  auto: [["prova su strada auto", "it"], ["car review", "en"]],
  food: [["ricette cucina italiana", "it"], ["food science cooking", "en"]],
  attualita: [["geopolitica spiegata", "it"], ["economia spiegata", "it"], ["explained documentary", "en"]],
  lezioni: [["lezione universitaria", "it"], ["university lecture", "en"]],
  arte: [["storia dell'arte", "it"], ["museo conferenza arte", "it"], ["art history explained", "en"], ["architecture explained", "en"]],
  musica: [["teoria musicale", "it"], ["storia della musica", "it"], ["music theory", "en"], ["music analysis", "en"]],
  economia: [["economia spiegata", "it"], ["politica economica", "it"], ["economics explained", "en"], ["economic history", "en"]],
  cinema: [["analisi film", "it"], ["storia del cinema", "it"], ["film analysis video essay", "en"], ["cinematography explained", "en"]],
  diritto: [["diritto spiegato", "it"], ["diritto costituzionale lezione", "it"], ["law explained", "en"], ["constitutional law", "en"]],
  ai: [["intelligenza artificiale spiegata", "it"], ["reti neurali spiegate", "it"], ["artificial intelligence explained", "en"], ["machine learning lecture", "en"]],
  fashion: [["storia della moda", "it"], ["sartoria tecniche", "it"], ["fashion history", "en"], ["fashion industry explained", "en"]],
};
// tutte le parole chiave: quelle del codice più quelle degli argomenti creati dal sito
const ricercheDi = (argomenti) => ({ ...RICERCHE, ...Object.fromEntries(argomenti.map((a) => [a.id, a.ricerche])) });

async function scopri(presenti, quanti, ricerche = RICERCHE) {
  const voci = mescola(Object.entries(ricerche).flatMap(([cat, q]) => q.map(([testo, lingua]) => ({ cat, testo, lingua })))).slice(0, 3);
  const candidati = [];
  for (const { cat, testo, lingua } of voci) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(testo)}&sp=EgIQAg%253D%253D&hl=${lingua}&gl=${PAESE[lingua] || "US"}`;
    const pagina = await fetch(url, { headers: YT }).then((r) => r.text()).catch(() => "");
    for (const [, id, nome] of pagina.matchAll(/"channelId":"(UC[\w-]{22})","title":\{"simpleText":"((?:[^"\\]|\\.)+)"/g)) {
      if (!presenti.has(id) && !candidati.some((c) => c.id === id)) candidati.push({ id, nome: nomeSicuro(nome), lingua, cat });
    }
  }
  const buoni = [];
  for (const c of mescola(candidati).slice(0, 30)) {
    if (buoni.length >= quanti) break;
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${c.id.slice(2)}`, { cf: { cacheTtl: 86400 } }).catch(() => null);
    if (!r?.ok) continue;
    const ultimi = leggiFeed(await r.text(), c, "");
    const giorni = ultimi[0] ? (Date.now() - new Date(ultimi[0].data)) / 864e5 : 9999;
    const media = ultimi.reduce((n, v) => n + v.viste, 0) / (ultimi.length || 1);
    if (ultimi.length >= 8 && giorni <= 90 && media >= 5000) { buoni.push({ ...c, ultimi: ultimi.slice(0, 2), fonte: "scoperto" }); presenti.add(c.id); }
  }
  return buoni;
}

// Prima ricerca per un argomento: tutte le sue parole chiave, poi controllo di qualità sul feed dei video lunghi.
// Il piano gratuito concede 50 richieste esterne per volta: per ogni passata 3 ricerche di video + 3 di canali + al massimo 43 feed.
// La pagina fa due passate (parte 0 = ricerche in italiano, parte 1 = in inglese).
async function cercaPerArgomento(presenti, ricerche) {
  const candidati = [];
  const aggiungi = (id, nome, lingua) => { if (!presenti.has(id) && !candidati.some((c) => c.id === id)) candidati.push({ id, nome: nomeSicuro(nome), lingua }); };
  const pagine = await Promise.all(ricerche.slice(0, 3).flatMap(([testo, lingua]) => {
    const base = `https://www.youtube.com/results?search_query=${encodeURIComponent(testo)}&hl=${lingua}&gl=${PAESE[lingua] || "US"}`;
    // prima i video più pertinenti (i loro canali di solito sono quelli forti), poi la ricerca dei canali
    return [[`${base}&sp=EgIQAQ%253D%253D`, lingua, "video"], [`${base}&sp=EgIQAg%253D%253D`, lingua, "canali"]].map(([url, l, tipo]) =>
      fetch(url, { headers: YT }).then((r) => r.text()).catch(() => "").then((t) => ({ t, l, tipo })));
  }));
  for (const { t, l, tipo } of pagine) {
    if (tipo === "video") for (const [, nome, id] of t.matchAll(/"longBylineText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)+)","navigationEndpoint":\{[^{}]*"commandMetadata":\{"webCommandMetadata":\{[^{}]*\}\},"browseEndpoint":\{"browseId":"(UC[\w-]{22})"/g)) aggiungi(id, nome, l);
  }
  for (const { t, l, tipo } of pagine) {
    if (tipo === "canali") for (const [, id, nome] of t.matchAll(/"channelId":"(UC[\w-]{22})","title":\{"simpleText":"((?:[^"\\]|\\.)+)"/g)) aggiungi(id, nome, l);
  }
  // un po' da ogni ricerca, così italiano e inglese restano mescolati
  const scelti = candidati.slice(0, 43); // 6 ricerche + 43 feed: sotto le 50 richieste del piano gratuito
  const motivi = [];
  const esiti = await Promise.all(scelti.map(async (c) => {
    const r = await fetch(`https://www.youtube.com/feeds/videos.xml?playlist_id=UULF${c.id.slice(2)}`, { cf: { cacheTtl: 86400 } }).catch(() => null);
    if (!r?.ok) { motivi.push([c.nome, "feed " + (r ? r.status : "errore")]); return null; }
    const ultimi = leggiFeed(await r.text(), c, "");
    const giorni = ultimi[0] ? (Date.now() - new Date(ultimi[0].data)) / 864e5 : 9999;
    const media = Math.round(ultimi.reduce((n, v) => n + v.viste, 0) / (ultimi.length || 1));
    const buono = ultimi.length >= 6 && giorni <= 180 && media >= (c.lingua === "it" ? 1500 : 5000);
    if (!buono) motivi.push([c.nome, ultimi.length, Math.round(giorni), media]);
    return buono ? { ...c, media, ultimi: ultimi.slice(0, 2).map(({ id, titolo, data }) => ({ id, titolo, data })) } : null;
  }));
  const buoni = esiti.filter(Boolean).sort((a, b) => b.media - a.media);
  buoni.provati = scelti.length;
  buoni.motivi = motivi;
  return buoni;
}
// i nomi nelle pagine di YouTube sono stringhe JSON: a volte con virgolette o escape tagliati dalla ricerca
const nomeSicuro = (n) => { try { return JSON.parse(`"${n}"`); } catch { return n.replace(/\\(u[0-9a-fA-F]{4}|.)/g, " ").trim(); } };
// AI di Cloudflare (gratuita). Si prova un modello dopo l'altro: i modelli ogni tanto vengono ritirati.
const MODELLI_TESTO = ["@cf/mistralai/mistral-small-3.1-24b-instruct", "@cf/meta/llama-3.3-70b-instruct-fp8-fast", "@cf/openai/gpt-oss-20b"];
async function chiediJSON(env, sistema, domanda, max = 300, modelli = MODELLI_TESTO) {
  let ultimoErrore;
  for (const modello of modelli) {
    try {
      const r = await env.AI.run(modello, { messages: [{ role: "system", content: sistema }, { role: "user", content: domanda }], max_tokens: max });
      const testo = typeof r.response === "string" ? r.response : JSON.stringify(r.response ?? r);
      const a = testo.search(/[{[]/), z = Math.max(testo.lastIndexOf("}"), testo.lastIndexOf("]"));
      return JSON.parse(testo.slice(a, z + 1));
    } catch (e) { ultimoErrore = e; }
  }
  throw ultimoErrore;
}

// L'AI rilegge i canali trovati (nome + ultimi titoli) e tiene solo quelli in tema e seri
async function filtraConAI(env, nome, candidati) {
  if (!env.AI || candidati.length < 2) return candidati;
  try {
    const elenco = candidati.map((c, i) => `${i}. ${c.nome} — ${c.ultimi.map((v) => v.titolo).join(" | ")}`).join("\n");
    const j = await chiediJSON(env, "You curate an ad-free educational video site. Answer only with JSON.",
      `Topic: "${nome}". Below are YouTube channels with their latest video titles. Be strict. Keep a channel only if BOTH are true: (1) most titles are about this topic; (2) the tone is serious and trustworthy, like a good teacher, scientist, museum, university, expert craftsperson or quality documentary. Drop: sensational or alarmist titles, ALL-CAPS hype, "secret/hidden truth/they don't want you to know", conspiracies, aliens and paranormal, unsolved mysteries for thrills, fake news, music videos and songs, dance, gossip, shopping and hauls, product ads, kids content, gaming, and anything off-topic. When in doubt, drop it.\n${elenco}\nReply exactly as {"keep":[indexes]}`, 200,
      ["@cf/meta/llama-3.3-70b-instruct-fp8-fast", ...MODELLI_TESTO]);
    const tieni = new Set((j.keep || []).map(Number));
    return tieni.size ? candidati.filter((_, i) => tieni.has(i)) : candidati;
  } catch { return candidati; }
}

// Le parole chiave per un argomento nuovo le prepara l'AI: 3 ricerche in italiano e 3 in inglese
async function paroleChiave(env, nome) {
  const riserva = { it: [nome, `${nome} spiegato`, `storia ${nome}`], en: [`${nome} explained`, `${nome} history`, `${nome} documentary`] };
  if (!env.AI) return riserva;
  try {
    const j = await chiediJSON(env, "You help find high-quality educational YouTube channels. Answer only with JSON.",
      `Topic (may be Italian): "${nome}". Write 3 search phrases in Italian and 3 in English that a curious viewer would type on YouTube to find serious explanations of this topic: the topic itself plus words like "spiegato/explained", "storia/history", "lezione/lecture", or a classic subtopic. Example for "Astronomia": {"it":["astronomia spiegata","storia dell'astronomia","come nascono le stelle"],"en":["astronomy explained","history of astronomy","astronomy lecture"]}. Never use the words channel, canale, YouTube, video, educational. Translate the topic for the English phrases. Reply only with JSON in that shape.`, 200);
    const pulisci = (a) => (Array.isArray(a) ? a : []).map((x) => String(x).trim()).filter((x) => x && x.length < 60).slice(0, 3);
    const it = pulisci(j.it), en = pulisci(j.en);
    return { it: it.length ? it : riserva.it, en: en.length ? en : riserva.en };
  } catch (e) { return { ...riserva, errore: String(e).slice(0, 300) }; }
}
const lettere = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30);

function passwordGiusta(req, env) {
  const a = req.headers.get("x-password") || "";
  const b = env.ADMIN_PASSWORD || "";
  if (!b || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// ——— «La mia Lavagna»: canali e argomenti personali, visibili solo a chi li aggiunge ———
const MAX_MIEI_CANALI = 300, MAX_MIEI_ARGOMENTI = 30, MAX_RICERCHE_GIORNO = 12, MAX_MIEI_VIDEO = 500;
const comeMioVideo = (r) => ({ id: r.id, titolo: r.titolo, canale: r.canale, nomeCanale: r.nome_canale, lingua: r.lingua, cat: r.cat, durata: r.durata, data: r.data || r.creato, viste: 0, mio: true });
async function laMia(req, env, pathname) {
  const u = await utenteDa(req, env);
  if (!u) return json({ errore: "accesso" }, 0, 401);
  const azione = pathname.slice("/api/mio".length) || "/";
  const corpo = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const miei = async () => {
    const [c, a, v] = await Promise.all([
      env.DB.prepare("SELECT id, nome, lingua, cat FROM miei_canali WHERE utente = ? ORDER BY creato").bind(u.id).all(),
      env.DB.prepare("SELECT id, nome, segno, ricerche FROM miei_argomenti WHERE utente = ? ORDER BY creato").bind(u.id).all(),
      env.DB.prepare("SELECT * FROM miei_video WHERE utente = ? ORDER BY creato DESC").bind(u.id).all(),
    ]);
    return { canali: c.results, argomenti: a.results.map((x) => ({ ...x, ricerche: JSON.parse(x.ricerche) })), video: v.results.map(comeMioVideo) };
  };
  const sezioneValida = async (cat) => CATEGORIE.some((c) => c.id === cat) || (await modifiche(env)).argomenti.some((a) => a.id === cat)
    || !!(await env.DB.prepare("SELECT 1 FROM miei_argomenti WHERE utente = ? AND id = ?").bind(u.id, cat).first());
  const presentiPerMe = async () => new Set([...(await elenco(env)).flatMap((c) => c.canali.map((x) => x.id)), ...(await miei()).canali.map((x) => x.id)]);
  const quanti = async (tabella) => (await env.DB.prepare(`SELECT COUNT(*) AS n FROM ${tabella} WHERE utente = ?`).bind(u.id).first()).n;

  if (azione === "/" && req.method === "GET") return json({ nome: u.nome, ...(await miei()) });

  if (azione === "/risolvi") {
    const c = await risolvi(String(corpo.testo || "")).catch(() => null);
    if (!c) return json({ errore: "Not found. Try the channel page link or its @handle." }, 0, 404);
    const gia = (await elenco(env)).find((k) => k.canali.some((x) => x.id === c.id));
    const mio = (await miei()).canali.find((x) => x.id === c.id);
    return json({ ...c, gia: gia ? gia.nome : mio ? mio.cat : null });
  }

  if (azione === "/aggiungi" || azione === "/aggiungi-molti") {
    const lista = azione === "/aggiungi" ? [corpo] : (Array.isArray(corpo.canali) ? corpo.canali.map((x) => ({ ...x, cat: corpo.cat })) : []);
    const presenti = await presentiPerMe();
    let posto = MAX_MIEI_CANALI - (await quanti("miei_canali")), n = 0;
    const istruzioni = [];
    for (const c of lista.slice(0, 80)) {
      if (posto <= 0) break;
      if (!/^UC[\w-]{22}$/.test(c.id || "") || presenti.has(c.id) || !LINGUE.includes(c.lingua) || !(await sezioneValida(c.cat))) continue;
      istruzioni.push(env.DB.prepare("INSERT OR IGNORE INTO miei_canali (utente, id, nome, lingua, cat, creato) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(u.id, c.id, String(c.nome || c.id).trim().slice(0, 80), c.lingua, c.cat, new Date().toISOString()));
      presenti.add(c.id); posto--; n++;
    }
    if (istruzioni.length) await env.DB.batch(istruzioni);
    return json({ aggiunti: n, ...(posto <= 0 ? { pieno: true } : {}) });
  }

  // un video singolo trovato su YouTube: le informazioni le legge il server, non si prendono dalla pagina
  if (azione === "/video-aggiungi") {
    if (!(await sezioneValida(corpo.cat))) return json({ errore: "Unknown topic." }, 0, 400);
    if ((await quanti("miei_video")) >= MAX_MIEI_VIDEO) return json({ errore: `You already have ${MAX_MIEI_VIDEO} videos.` }, 0, 400);
    const v = await infoVideo(env, String(corpo.id || ""));
    if (!v) return json({ errore: "Video not found." }, 0, 404);
    const lin = LINGUE.includes(corpo.lingua) ? corpo.lingua : v.lingua || "en";
    await env.DB.prepare(`INSERT INTO miei_video (utente, id, titolo, canale, nome_canale, lingua, cat, durata, data, creato) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(utente, id) DO UPDATE SET cat = excluded.cat, lingua = excluded.lingua`)
      .bind(u.id, v.id, v.titolo.slice(0, 200), v.canale || "", (v.nomeCanale || "").slice(0, 80), lin, corpo.cat, v.durata || null, v.data || "", new Date().toISOString()).run();
    return json({ ok: true });
  }
  if (azione === "/video-togli") {
    await env.DB.prepare("DELETE FROM miei_video WHERE utente = ? AND id = ?").bind(u.id, String(corpo.id || "")).run();
    return json({ ok: true });
  }

  if (azione === "/togli") {
    await env.DB.prepare("DELETE FROM miei_canali WHERE utente = ? AND id = ?").bind(u.id, String(corpo.id || "")).run();
    return json({ ok: true });
  }
  if (azione === "/sposta") {
    if (!(await sezioneValida(corpo.cat))) return json({ errore: "Unknown topic." }, 0, 400);
    await env.DB.prepare("UPDATE miei_canali SET cat = ? WHERE utente = ? AND id = ?").bind(corpo.cat, u.id, String(corpo.id || "")).run();
    return json({ ok: true });
  }

  if (azione === "/argomento-crea") {
    const nome = String(corpo.nome || "").trim().slice(0, 40);
    if (!nome) return json({ errore: "Type a name for the topic." }, 0, 400);
    if ((await quanti("miei_argomenti")) >= MAX_MIEI_ARGOMENTI) return json({ errore: `You already have ${MAX_MIEI_ARGOMENTI} topics.` }, 0, 400);
    const usati = new Set([...(await elenco(env)).map((c) => c.id), ...(await miei()).argomenti.map((a) => a.id)]);
    let id = "m-" + (lettere(nome) || "argomento");
    while (usati.has(id)) id += "-2";
    const parole = (testo) => String(testo || "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 3);
    let it = parole(corpo.it), en = parole(corpo.en);
    if (!it.length || !en.length) { const ai = await paroleChiave(env, nome); if (!it.length) it = ai.it; if (!en.length) en = ai.en; }
    const ricerche = [...it.map((t) => [t, "it"]), ...en.map((t) => [t, "en"])];
    await env.DB.prepare("INSERT INTO miei_argomenti (utente, id, nome, segno, ricerche, creato) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(u.id, id, nome, String(corpo.segno || "◆").trim().slice(0, 2) || "◆", JSON.stringify(ricerche), new Date().toISOString()).run();
    return json({ id, ricerche });
  }

  if (azione === "/argomento-cerca") {
    // la ricerca usa YouTube e l'AI: qualche ricerca al giorno a testa
    const chiave = `cerche:${u.id}:${new Date().toISOString().slice(0, 10)}`;
    const fatte = Number(await env.LAVAGNA.get(chiave)) || 0;
    if (fatte >= MAX_RICERCHE_GIORNO) return json({ errore: "You've used today's channel searches. Try again tomorrow." }, 0, 429);
    await env.LAVAGNA.put(chiave, String(fatte + 1), { expirationTtl: 86400 });
    const mio = (await miei()).argomenti.find((a) => a.id === corpo.id);
    const fisso = (await modifiche(env)).argomenti.find((a) => a.id === corpo.id);
    const ricerche = mio?.ricerche || fisso?.ricerche || RICERCHE[corpo.id];
    if (!ricerche) return json({ errore: "Unknown topic." }, 0, 404);
    const parte = Number(corpo.parte) === 1 ? 1 : 0;
    const perLingua = ricerche.filter(([, l]) => l === (parte ? "en" : "it"));
    const presenti = await presentiPerMe();
    const trovati = await cercaPerArgomento(presenti, perLingua.length ? perLingua : ricerche.slice(parte * 3, parte * 3 + 3));
    const candidati = await filtraConAI(env, mio?.nome || corpo.id, trovati);
    return json({ candidati });
  }

  if (azione === "/argomento-togli") {
    const id = String(corpo.id || "");
    await env.DB.batch([
      env.DB.prepare("DELETE FROM miei_canali WHERE utente = ? AND cat = ?").bind(u.id, id),
      env.DB.prepare("DELETE FROM miei_video WHERE utente = ? AND cat = ?").bind(u.id, id),
      env.DB.prepare("DELETE FROM miei_argomenti WHERE utente = ? AND id = ?").bind(u.id, id),
    ]);
    return json({ ok: true });
  }

  // i video dei miei canali di una sezione, letti dal vivo (non entrano nell'indice di tutti)
  if (azione === "/feed") {
    const cat = new URL(req.url).searchParams.get("cat") || "";
    const { results } = await env.DB.prepare("SELECT id, nome, lingua, cat FROM miei_canali WHERE utente = ? AND cat = ? ORDER BY creato LIMIT 40").bind(u.id, cat).all();
    const [liste, singoli] = await Promise.all([
      Promise.all(results.map((c) => feed(c, cat).catch(() => []))),
      env.DB.prepare("SELECT * FROM miei_video WHERE utente = ? AND cat = ?").bind(u.id, cat).all(),
    ]);
    return json(ordina([...liste.flat(), ...singoli.results.map(comeMioVideo)]));
  }

  return json({ errore: "azione sconosciuta" }, 0, 404);
}

export default {
  async fetch(req, env, ctx) {
    const { pathname, origin } = new URL(req.url);
    // link condiviso: lavagna…/v/ID → anteprima con titolo e miniatura, poi il video in Lavagna
    const condiviso = pathname.match(/^\/v\/([\w-]{11})\/?$/);
    if (condiviso) return paginaCondivisa(env, condiviso[1], origin);

    // Liste di video: pronte in cache (10 minuti le sezioni, 2–5 il resto), così mille visite non rifanno mille volte lo stesso lavoro.
    // La chiave cambia quando cambiano i canali (aggiunti/tolti), quindi le modifiche si vedono subito.
    if (req.method === "GET" && /^\/api\/(cat\/|canale\/|cerca$|home$)/.test(pathname)) {
      const mod = await env.LAVAGNA.get("modifiche") || "";
      let h = 0; for (const c of mod) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const chiave = new Request(`https://cache.lavagna/${h}${pathname}${new URL(req.url).search}`);
      const pronta = await caches.default.match(chiave);
      if (pronta) return pronta;
      const r = await this.rispondi(req, env, pathname);
      if (r.ok && env.DB) {
        const dati = await r.clone().json().catch(() => null);
        if (Array.isArray(dati) && /^\/api\/(cat|canale)\//.test(pathname)) ctx.waitUntil(salvaVideo(env, dati, { aggiorna: false }).catch(() => {}));
      }
      if (r.ok) {
        const copia = new Response(r.body, r);
        copia.headers.set("cache-control", `public, max-age=${/^\/api\/(cat\/|home$)/.test(pathname) ? 600 : 120}`);
        ctx.waitUntil(caches.default.put(chiave, copia.clone()));
        return copia;
      }
      return r;
    }
    return this.rispondi(req, env, pathname);
  },

  // cron ogni 5 minuti: aggiorna l'indice
  async scheduled(evento, env, ctx) {
    ctx.waitUntil(lavoroPeriodico(env, { elenco, feed }));
  },

  async rispondi(req, env, pathname) {
    if (pathname.startsWith("/api/conto")) return gestisciConto(req, env, pathname);
    if (pathname.startsWith("/api/mio")) return laMia(req, env, pathname);
    if (pathname === "/api/cerca") {
      const p = Object.fromEntries(new URL(req.url).searchParams);
      return json(await cerca(env, p), p.q ? 300 : 120);
    }
    if (pathname === "/api/indice") return json(await statoIndice(env));
    // ricerca dentro YouTube (senza Shorts): i risultati di una stessa ricerca restano in cache un'ora
    if (pathname === "/api/youtube") {
      const p = new URL(req.url).searchParams;
      const q = (p.get("q") || "").trim().slice(0, 120);
      if (q.length < 2) return json({ video: [], canali: [] });
      const chiave = new Request(`https://cache.lavagna/yt?q=${encodeURIComponent(q.toLowerCase())}&l=${p.get("lingua") || ""}&ui=${p.get("ui") || ""}`);
      const pronta = await caches.default.match(chiave);
      if (pronta) return pronta;
      const r = await cercaSuYouTube(q, p.get("lingua") || "", p.get("ui") || "en").catch(() => null);
      if (!r) return json({ errore: "YouTube non risponde." }, 0, 502);
      // cosa c'è già in Lavagna
      const presenti = new Map((await elenco(env)).flatMap((c) => c.canali.map((x) => [x.id, c.id])));
      const ids = r.video.map((v) => v.id);
      const gia = ids.length && env.DB ? new Set((await env.DB.prepare(`SELECT id FROM video WHERE id IN (${ids.map(() => "?").join(",")})`).bind(...ids).all()).results.map((x) => x.id)) : new Set();
      for (const v of r.video) { v.gia = gia.has(v.id); v.canaleIn = presenti.get(v.canale) || null; }
      for (const c of r.canali) c.gia = presenti.get(c.id) || null;
      const risposta = json(r, 3600);
      await caches.default.put(chiave, risposta.clone()).catch(() => {});
      return risposta;
    }
    // le informazioni di un video YouTube qualsiasi (anche fuori da Lavagna)
    // anteprima di un canale non ancora in Lavagna: gli ultimi video lunghi
    const ma = pathname.match(/^\/api\/anteprima\/(UC[\w-]{22})$/);
    if (ma) {
      const xml = await xmlFeed(ma[1]);
      if (!xml) return json({ errore: "Canale non trovato." }, 0, 404);
      const nome = tag(xml.split("<entry>")[0], "name") || tag(xml, "name") || tag(xml, "title");
      return json({ id: ma[1], nome, video: leggiFeed(xml, { id: ma[1], nome, lingua: "" }, "") }, 600);
    }
    const mv = pathname.match(/^\/api\/video\/([\w-]{11})$/);
    if (mv) { const v = await infoVideo(env, mv[1]); return v ? json(v, 3600) : json({ errore: "Video non trovato." }, 0, 404); }
    if (pathname === "/api/home") return json(await home(env, await elenco(env), new URL(req.url).searchParams.get("lingua")), 300);

    if (pathname === "/api/categorie") return json(await elenco(env));

    let m = pathname.match(/^\/api\/cat\/([a-z0-9-]+)$/);
    if (m) {
      const cat = (await elenco(env)).find((c) => c.id === m[1]);
      if (!cat) return json({ errore: "categoria sconosciuta" }, 0, 404);
      // dall'indice: nessun limite al numero di canali. Se l'indice è ancora vuoto (appena creato) si ripiega
      // sui feed dal vivo dei primi 40 canali, il massimo che il piano gratuito permette in una richiesta.
      const dalIndice = env.DB ? await videoDiCategoria(env, cat.id).catch(() => []) : [];
      if (dalIndice.length >= 30) {
        // canali della sezione che nell'indice non hanno ancora video (appena aggiunti o spostati): letti subito dal vivo,
        // poi la visita li salva nell'indice. Al massimo 30 per volta, dentro le 50 richieste del piano gratuito.
        const { results } = await env.DB.prepare("SELECT DISTINCT canale FROM video WHERE cat = ?").bind(cat.id).all().catch(() => ({ results: [] }));
        const conVideo = new Set(results.map((r) => r.canale));
        const mancanti = cat.canali.filter((c) => !conVideo.has(c.id)).slice(0, 30);
        if (!mancanti.length) return json(dalIndice, 120);
        const nuovi = (await Promise.all(mancanti.map((c) => feed(c, cat.id).catch(() => [])))).flat();
        return json(ordina([...dalIndice, ...nuovi]), 120);
      }
      const liste = await Promise.all(cat.canali.slice(0, 40).map((c) => feed(c, cat.id).catch(() => [])));
      return json(ordina(liste.flat()), 120);
    }

    m = pathname.match(/^\/api\/canale\/(.+)$/);
    if (m) {
      const id = decodeURIComponent(m[1]);
      for (const cat of await elenco(env)) {
        const c = cat.canali.find((x) => x.id === id);
        if (!c) continue;
        const dalIndice = env.DB ? await videoDiCanale(env, id).catch(() => []) : [];
        if (dalIndice.length) return json(dalIndice, 120);
        const freschi = ordina(await feed(c, cat.id));
        if (env.DB) await salvaVideo(env, freschi).catch(() => {});
        return json(freschi, 120);
      }
      return json({ errore: "canale non in elenco" }, 0, 404);
    }

    if (pathname === "/api/diretta/iss") {
      // la diretta HD della NASA dalla Stazione Spaziale: il suo ID cambia quando la riavviano
      let id = "ROboUHfPUrU";
      const pagina = await fetch("https://www.youtube.com/channel/UCLA_DiR1FfKNvjuUpBHmylQ/live", { headers: YT, cf: { cacheTtl: 3600 } })
        .then((r) => r.text()).catch(() => "");
      const trovato = (pagina.match(/"videoId":"([\w-]{11})"/) || [])[1];
      if (trovato && pagina.includes('"isLive":true')) id = trovato;
      return json({ id }, 3600);
    }

    m = pathname.match(/^\/api\/file\/ia\/(.+)$/);
    if (m) {
      const url = await fileArchive(decodeURIComponent(m[1])).catch(() => null);
      return url ? json({ url }, 86400) : json({ errore: "file non trovato" }, 0, 404);
    }

    // ——— gestione dei canali (serve la password) ———
    if (pathname.startsWith("/api/gestione/")) {
      if (!passwordGiusta(req, env)) return json({ errore: "Password sbagliata." }, 0, 401);
      const azione = pathname.slice("/api/gestione/".length);
      const corpo = req.method === "POST" ? await req.json().catch(() => ({})) : {};

      if (azione === "prova") return json({ ok: true });

      // un giro dell'indice a comando (lo stesso che fa il cron ogni 5 minuti)
      if (azione === "giro") return json(await lavoroPeriodico(env, { elenco, feed }));

      if (azione === "risolvi") {
        const c = await risolvi(String(corpo.testo || "")).catch(() => null);
        if (!c) return json({ errore: "Non trovo il canale. Prova col link della pagina del canale o con @nome." }, 0, 404);
        const gia = (await elenco(env)).find((k) => k.canali.some((x) => x.id === c.id));
        return json({ ...c, gia: gia ? gia.nome : null });
      }

      // un video singolo per tutti: entra nell'indice nella sezione scelta
      if (azione === "video-aggiungi") {
        const tutte = await elenco(env);
        if (!tutte.some((c) => c.id === corpo.cat)) return json({ errore: "Sezione sconosciuta." }, 0, 400);
        const v = await infoVideo(env, String(corpo.id || ""));
        if (!v) return json({ errore: "Video non trovato." }, 0, 404);
        const lin = LINGUE.includes(corpo.lingua) ? corpo.lingua : v.lingua || "en";
        const gia = await env.DB.prepare("SELECT id FROM video WHERE id = ?").bind(v.id).first();
        if (gia) await env.DB.prepare("UPDATE video SET cat = ?, lingua = ? WHERE id = ?").bind(corpo.cat, lin, v.id).run();
        else await salvaVideo(env, [{ ...v, cat: corpo.cat, lingua: lin, data: v.data || new Date().toISOString() }]);
        // le liste in cache cambiano chiave: il video si vede subito
        const mod = await modifiche(env);
        await env.LAVAGNA.put("modifiche", JSON.stringify({ ...mod, versione: Date.now() }));
        return json({ ok: true });
      }
      if (azione === "aggiungi") {
        const { id, nome, lingua, cat } = corpo;
        const tutte = await elenco(env);
        const dove = tutte.find((c) => c.id === cat);
        if (!/^UC[\w-]{22}$/.test(id || "") || !dove || !LINGUE.includes(lingua) || !String(nome || "").trim())
          return json({ errore: "Dati del canale incompleti." }, 0, 400);
        if (tutte.some((c) => c.canali.some((x) => x.id === id))) return json({ errore: "Il canale è già in elenco." }, 0, 409);
        const mod = await modifiche(env);
        // un canale del file tolto prima e rimesso nella sua categoria torna com'era
        if ((CATEGORIE.find((c) => c.id === cat)?.canali || []).some(([x]) => x === id)) mod.tolti = mod.tolti.filter((x) => x !== id);
        else mod.aggiunti = [...mod.aggiunti.filter((a) => a.id !== id), { id, nome: String(nome).trim().slice(0, 80), lingua, cat }];
        await env.LAVAGNA.put("modifiche", JSON.stringify(mod));
        // i suoi video entrano subito nell'indice, senza aspettare il giro
        if (env.DB) await salvaVideo(env, await feed({ id, nome: String(nome).trim(), lingua }, cat).catch(() => [])).catch(() => {});
        return json({ ok: true });
      }

      if (azione === "proposte") {
        // 10 canali: prima dalla riserva fissa, poi scoperti cercando su YouTube.
        // Esclusi quelli già in elenco e quelli scartati.
        const mod = await modifiche(env);
        const presenti = new Set([...(await elenco(env)).flatMap((c) => c.canali.map((x) => x.id)), ...mod.scartati]);
        const liberi = mescola(PROPOSTE.filter(([id]) => !presenti.has(id)));
        const scelti = [];
        for (const [id, nome, lingua, cat] of liberi.slice(0, 10)) {
          const ultimi = leggiFeed(await xmlFeed(id).catch(() => ""), { id, nome, lingua }, "");
          scelti.push({ id, nome, lingua, cat, ultimi: ultimi.slice(0, 2), fonte: "riserva" });
          presenti.add(id);
        }
        if (scelti.length < 10) scelti.push(...(await scopri(presenti, 10 - scelti.length, ricercheDi(mod.argomenti))));
        return json({ proposte: scelti.map(({ ultimi, ...p }) => ({ ...p, ultimi: ultimi.map(({ id, titolo, data }) => ({ id, titolo, data })) })) });
      }

      if (azione === "scarta") {
        const mod = await modifiche(env);
        if (/^UC[\w-]{22}$/.test(corpo.id || "") && !mod.scartati.includes(corpo.id)) mod.scartati.push(corpo.id);
        await env.LAVAGNA.put("modifiche", JSON.stringify(mod));
        return json({ ok: true });
      }

      // spostare un canale in un'altra sezione (anche i canali scritti nel codice)
      if (azione === "sposta") {
        const { id, cat } = corpo;
        const tutte = await elenco(env);
        const dove = tutte.find((c) => c.id === cat);
        const da = tutte.find((c) => c.canali.some((x) => x.id === id));
        if (!dove || !da) return json({ errore: "Canale o sezione sconosciuti." }, 0, 400);
        if (da.id === cat) return json({ ok: true });
        const canale = da.canali.find((x) => x.id === id);
        const mod = await modifiche(env);
        const fisso = CATEGORIE.find((c) => c.canali.some(([x]) => x === id));
        mod.aggiunti = mod.aggiunti.filter((x) => x.id !== id);
        if (fisso && fisso.id === cat) mod.tolti = mod.tolti.filter((x) => x !== id); // torna dov'era nel codice
        else {
          if (fisso && !mod.tolti.includes(id)) mod.tolti.push(id); // toglie dalla sezione del codice…
          mod.aggiunti.push({ id, nome: canale.nome, lingua: canale.lingua, cat }); // …e lo mette nella nuova
        }
        await env.LAVAGNA.put("modifiche", JSON.stringify(mod));
        if (env.DB) await spostaVideo(env, id, cat).catch(() => {});
        return json({ ok: true, da: da.nome, a: dove.nome });
      }

      if (azione === "argomento-crea") {
        const nome = String(corpo.nome || "").trim().slice(0, 40);
        if (!nome) return json({ errore: "Scrivi il nome dell'argomento." }, 0, 400);
        const mod = await modifiche(env);
        const tutte = await elenco(env);
        let id = lettere(nome) || "argomento";
        while (tutte.some((c) => c.id === id)) id += "-2";
        const parole = (testo) => String(testo || "").split(",").map((x) => x.trim()).filter(Boolean).slice(0, 3);
        let it = parole(corpo.it), en = parole(corpo.en);
        // le parole chiave mancanti le prepara l'AI
        let ai = null;
        if (!it.length || !en.length) { ai = await paroleChiave(env, nome); if (!it.length) it = ai.it; if (!en.length) en = ai.en; }
        const ricerche = [...it.map((t) => [t, "it"]), ...en.map((t) => [t, "en"])];
        mod.argomenti.push({ id, nome, segno: String(corpo.segno || "◆").trim().slice(0, 2) || "◆", ricerche });
        await env.LAVAGNA.put("modifiche", JSON.stringify(mod));
        return json({ id, ricerche, ...(ai?.errore ? { avviso: "Parole chiave di riserva: l'AI non ha risposto." } : {}), ...(corpo.debug && ai?.errore ? { errore: ai.errore } : {}) });
      }

      if (azione === "argomento-cerca") {
        const mod = await modifiche(env);
        const a = mod.argomenti.find((x) => x.id === corpo.id);
        const ricerche = a ? a.ricerche : RICERCHE[corpo.id];
        if (!ricerche) return json({ errore: "Argomento sconosciuto." }, 0, 404);
        const presenti = new Set([...(await elenco(env)).flatMap((c) => c.canali.map((x) => x.id)), ...mod.scartati]);
        const parte = Number(corpo.parte) === 1 ? 1 : 0;
        const perLingua = ricerche.filter(([, l]) => l === (parte ? "en" : "it"));
        const trovati = await cercaPerArgomento(presenti, perLingua.length ? perLingua : ricerche.slice(parte * 3, parte * 3 + 3));
        const candidati = await filtraConAI(env, a?.nome || corpo.id, trovati);
        candidati.provati = trovati.provati; candidati.motivi = trovati.motivi; candidati.primaAI = trovati.length;
        return json({ candidati, provati: candidati.provati, primaAI: candidati.primaAI, ...(corpo.debug ? { motivi: candidati.motivi } : {}) });
      }

      if (azione === "aggiungi-molti") {
        const { cat, canali } = corpo;
        const tutte = await elenco(env);
        if (!tutte.some((c) => c.id === cat) || !Array.isArray(canali)) return json({ errore: "Dati incompleti." }, 0, 400);
        const presenti = new Set(tutte.flatMap((c) => c.canali.map((x) => x.id)));
        const mod = await modifiche(env);
        let n = 0;
        for (const c of canali.slice(0, 80)) {
          if (!/^UC[\w-]{22}$/.test(c.id || "") || presenti.has(c.id) || !LINGUE.includes(c.lingua)) continue;
          mod.aggiunti.push({ id: c.id, nome: String(c.nome || "").trim().slice(0, 80) || c.id, lingua: c.lingua, cat });
          presenti.add(c.id); n++;
        }
        await env.LAVAGNA.put("modifiche", JSON.stringify(mod));
        return json({ aggiunti: n }); // i video arrivano col giro ogni 5 minuti, e la sezione intanto legge i canali dal vivo
      }

      if (azione === "argomento-togli") {
        const mod = await modifiche(env);
        const a = mod.argomenti.find((x) => x.id === corpo.id);
        if (!a) return json({ errore: "Si possono togliere solo gli argomenti creati dal sito." }, 0, 400);
        const suoi = mod.aggiunti.filter((x) => x.cat === a.id).map((x) => x.id);
        mod.argomenti = mod.argomenti.filter((x) => x.id !== a.id);
        mod.aggiunti = mod.aggiunti.filter((x) => x.cat !== a.id);
        await env.LAVAGNA.put("modifiche", JSON.stringify(mod));
        if (env.DB) for (const id of suoi) await togliCanale(env, id).catch(() => {});
        return json({ ok: true, canali: suoi.length });
      }

      if (azione === "togli") {
        const { id } = corpo;
        const mod = await modifiche(env);
        mod.aggiunti = mod.aggiunti.filter((a) => a.id !== id);
        if (CATEGORIE.some((c) => c.canali.some(([x]) => x === id)) && !mod.tolti.includes(id)) mod.tolti.push(id);
        await env.LAVAGNA.put("modifiche", JSON.stringify(mod));
        if (env.DB && id) await togliCanale(env, id).catch(() => {});
        return json({ ok: true });
      }

      return json({ errore: "azione sconosciuta" }, 0, 404);
    }

    return env.ASSETS.fetch(req);
  },
};
