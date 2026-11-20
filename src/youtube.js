// Cercare dentro YouTube da Lavagna, leggere le informazioni di un video qualsiasi e preparare i link da condividere.
// La ricerca legge la pagina dei risultati di YouTube (nessuna quota); gli Shorts e i video sotto i 2 minuti restano fuori.

const YT = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36", "accept-language": "it,en", cookie: "SOCS=CAI; CONSENT=YES+" };
const PAESE = { it: "IT", es: "ES", de: "DE", fr: "FR", en: "US" };
const MIN_SECONDI = 120;

const testo = (x) => x?.simpleText ?? (x?.runs || []).map((r) => r.text).join("") ?? "";
const secondi = (s = "") => s.split(":").reduce((n, x) => n * 60 + (Number(x) || 0), 0);
const numeroDa = (s = "") => {
  // «1,2 Mln di visualizzazioni», «35K views», «1.234.567 visualizzazioni»
  const m = String(s).replace(/\s/g, " ").match(/([\d.,]+)\s*(K|M|B|Mln|mln|Mrd|mila|k)?/);
  if (!m) return 0;
  const molt = { K: 1e3, k: 1e3, mila: 1e3, M: 1e6, Mln: 1e6, mln: 1e6, B: 1e9, Mrd: 1e9 }[m[2]] || 1;
  const n = molt > 1 ? parseFloat(m[1].replace(",", ".")) : Number(m[1].replace(/[.,]/g, ""));
  return Math.round((n || 0) * molt);
};

function datiIniziali(pagina) {
  for (const segno of ["var ytInitialData = ", 'window["ytInitialData"] = ', "ytInitialData = "]) {
    const a = pagina.indexOf(segno);
    if (a < 0) continue;
    const inizio = a + segno.length;
    const fine = pagina.indexOf(";</script>", inizio);
    try { return JSON.parse(pagina.slice(inizio, fine)); } catch {}
  }
  return null;
}
// YouTube manda i risultati in due formati (a sorte): il nuovo «lockup» si riporta alla forma del vecchio
function daLockup(l) {
  if (l.contentType !== "LOCKUP_CONTENT_TYPE_VIDEO" || !l.contentId) return null;
  const m = l.metadata?.lockupMetadataViewModel;
  const righe = m?.metadata?.contentMetadataViewModel?.metadataRows || [];
  const parti = (righe[0]?.metadataParts || []).map((p) => p.text?.content || p.avatarStack?.avatarStackViewModel?.text?.content || "");
  const descr = righe.find((r) => r.lockupContentMetadataRowExtension?.contentType === "METADATA_ROW_CONTENT_TYPE_DESCRIPTION")?.metadataParts?.[0]?.text?.content || "";
  const canale = (JSON.stringify(m || {}).match(/"browseId":"(UC[\w-]{22})"/) || [])[1] || "";
  const durata = (JSON.stringify(l.contentImage || {}).match(/"text":"(\d{1,2}(?::\d{2}){1,2})"/) || [])[1] || "";
  return {
    videoId: l.contentId, title: { simpleText: m?.title?.content || "" }, lengthText: { simpleText: durata },
    longBylineText: { runs: [{ text: parti[0] || "", navigationEndpoint: { browseEndpoint: { browseId: canale } } }] },
    viewCountText: { simpleText: parti[1] || "" }, publishedTimeText: { simpleText: parti[2] || "" }, descriptionSnippet: { simpleText: descr },
  };
}
// la pagina dei risultati; se torna vuota (capita), un secondo tentativo
async function risultati(url, ui = "en") {
  for (let i = 0; i < 2; i++) {
    const pagina = await fetch(url, { headers: { ...YT, "accept-language": ui === "it" ? "it,en" : "en,it" } }).then((r) => r.text()).catch(() => "");
    const d = datiIniziali(pagina);
    if (d) {
      const r = raccogli(d, ["videoRenderer", "channelRenderer", "lockupViewModel"]);
      r.videoRenderer.push(...r.lockupViewModel.map(daLockup).filter(Boolean));
      if (r.videoRenderer.length || r.channelRenderer.length) return r;
    }
  }
  return { videoRenderer: [], channelRenderer: [] };
}
// tutti gli oggetti con quella chiave, ovunque stiano
function raccogli(nodo, chiavi, fuori = { videoRenderer: [], channelRenderer: [], lockupViewModel: [] }) {
  if (Array.isArray(nodo)) { for (const x of nodo) raccogli(x, chiavi, fuori); return fuori; }
  if (nodo && typeof nodo === "object") {
    for (const [k, v] of Object.entries(nodo)) {
      if (k === "reelShelfRenderer" || k === "shortsLockupViewModel") continue; // Shorts: mai
      if (chiavi.includes(k)) fuori[k].push(v); else raccogli(v, chiavi, fuori);
    }
  }
  return fuori;
}

export async function cercaSuYouTube(q, lingua = "", ui = "en") {
  const l = PAESE[lingua] ? lingua : "";
  // hl = lingua dell'interfaccia (per «3 anni fa»), gl = paese della lingua dei video
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&hl=${ui === "it" ? "it" : "en"}${l ? `&gl=${PAESE[l]}` : ""}`;
  // video e, a parte, solo canali (nella ricerca normale i canali compaiono di rado)
  const [tutto, soloCanali] = await Promise.all([risultati(url, ui), risultati(`${url}&sp=EgIQAg%253D%253D`, ui)]);
  const videoRenderer = tutto.videoRenderer;
  const channelRenderer = [...tutto.channelRenderer, ...soloCanali.channelRenderer].filter((c, i, a) => a.findIndex((x) => x.channelId === c.channelId) === i);
  const visti = new Set();
  const video = [];
  for (const v of videoRenderer) {
    if (!v.videoId || visti.has(v.videoId)) continue;
    visti.add(v.videoId);
    const durata = secondi(testo(v.lengthText));
    if (durata < MIN_SECONDI) continue; // live, Shorts e video brevissimi
    const autore = (v.longBylineText || v.ownerText)?.runs?.[0];
    const canale = autore?.navigationEndpoint?.browseEndpoint?.browseId || "";
    if (!canale.startsWith("UC")) continue;
    video.push({
      id: v.videoId, titolo: testo(v.title), canale, nomeCanale: autore.text || "", durata,
      viste: numeroDa(testo(v.viewCountText)), quando: testo(v.publishedTimeText),
      descrizione: (v.detailedMetadataSnippets?.[0] ? testo(v.detailedMetadataSnippets[0].snippetText) : testo(v.descriptionSnippet)).slice(0, 300),
    });
  }
  const canali = channelRenderer.filter((c) => c.channelId?.startsWith("UC")).map((c) => ({
    id: c.channelId, nome: testo(c.title),
    // YouTube a volte mette l'@nome dove ci si aspetta gli iscritti
    iscritti: [testo(c.videoCountText), testo(c.subscriberCountText)].find((s) => /iscritt|subscri|abonn|suscript|Abonnent/i.test(s)) || "",
    foto: (c.thumbnail?.thumbnails || []).at(-1)?.url?.replace(/^\/\//, "https://") || "",
    descrizione: testo(c.descriptionSnippet).slice(0, 200),
  }));
  return { video: video.slice(0, 24), canali: canali.slice(0, 6) };
}

// le informazioni di un video YouTube qualsiasi: prima l'indice, poi la chiave YouTube, poi oEmbed (titolo e autore soltanto)
export async function infoVideo(env, id) {
  if (!/^[\w-]{11}$/.test(id)) return null;
  const r = await env.DB?.prepare("SELECT * FROM video WHERE id = ?").bind(id).first().catch(() => null);
  if (r) return {
    id: r.id, fonte: r.fonte === "yt" ? undefined : r.fonte, titolo: r.titolo, descrizione: r.descrizione, data: r.data,
    canale: r.canale, nomeCanale: r.nome_canale, lingua: r.lingua, cat: r.cat, durata: r.durata, viste: r.viste, thumb: r.thumb || undefined,
  };
  if (env.YT_KEY) {
    const u = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${id}&key=${env.YT_KEY}`;
    const d = await fetch(u).then((x) => (x.ok ? x.json() : null)).catch(() => null);
    const x = d?.items?.[0];
    if (x) {
      const m = (x.contentDetails?.duration || "").match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || [];
      const lin = (x.snippet.defaultAudioLanguage || x.snippet.defaultLanguage || "").slice(0, 2);
      return {
        id, titolo: x.snippet.title, descrizione: (x.snippet.description || "").slice(0, 1500), data: x.snippet.publishedAt,
        canale: x.snippet.channelId, nomeCanale: x.snippet.channelTitle, lingua: ["it", "en", "es", "de", "fr"].includes(lin) ? lin : "",
        cat: "", durata: (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0),
        viste: Number(x.statistics?.viewCount || 0), fuori: true,
      };
    }
  }
  const o = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`).then((x) => (x.ok ? x.json() : null)).catch(() => null);
  if (!o) return null;
  return { id, titolo: o.title, nomeCanale: o.author_name, canale: "", descrizione: "", data: "", cat: "", lingua: "", fuori: true };
}

// La pagina che vede chi riceve il link: anteprima giusta (titolo e miniatura) per WhatsApp, Telegram, mail…, poi apre il video in Lavagna
const escH = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export async function paginaCondivisa(env, id, origine) {
  const v = /^[\w-]{11}$/.test(id) ? await infoVideo(env, id).catch(() => null) : null;
  const titolo = v ? `${v.titolo} — Lavagna` : "Lavagna";
  const descr = v ? `${v.nomeCanale ? v.nomeCanale + " · " : ""}Watch it on Lavagna: curated, calm, no Shorts, no algorithm.` : "Curated educational videos. Calm.";
  const img = v ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
  const dove = `/#/v/${encodeURIComponent(id)}`;
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escH(titolo)}</title>
<meta name="description" content="${escH(descr)}">
<meta property="og:type" content="video.other"><meta property="og:site_name" content="Lavagna">
<meta property="og:title" content="${escH(v?.titolo || "Lavagna")}"><meta property="og:description" content="${escH(descr)}">
<meta property="og:url" content="${escH(`${origine}/v/${id}`)}">${img ? `<meta property="og:image" content="${img}"><meta property="og:image:width" content="480"><meta property="og:image:height" content="360">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta http-equiv="refresh" content="0; url=${escH(dove)}">
<script>location.replace(${JSON.stringify(dove)})</script>
</head><body style="font-family:system-ui;background:#f6f3ec;color:#222;padding:24px"><p><a href="${escH(dove)}">${escH(v?.titolo || "Lavagna")}</a></p></body></html>`,
  { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
