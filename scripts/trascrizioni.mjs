// Riempie l'archivio delle trascrizioni di Lavagna leggendo i sottotitoli di YouTube da questo computer
// (dai server Cloudflare YouTube non li dà: «conferma di non essere un bot»).
//
//   node scripts/trascrizioni.mjs              → 300 video, prima quelli che qualcuno ha aperto, poi i più visti
//   node scripts/trascrizioni.mjs 1000         → quanti video fare in questo giro
//   node scripts/trascrizioni.mjs 50 --locale  → verso il server di prova sul Mac (wrangler dev, porta 8797)
//   node scripts/trascrizioni.mjs --video ID   → un video solo
//
// Va piano apposta (un video ogni ~1,5 secondi). Ogni video costa ~20-40 righe scritte nel database:
// il piano gratuito ne permette 100.000 al giorno per tutto l'account, quindi meglio non più di ~1000 video al giorno.

import { readFileSync } from "node:fs";

const env = Object.fromEntries(readFileSync(new URL("../.env", import.meta.url), "utf8").split("\n")
  .map((r) => r.match(/^([A-Z_]+)=(.*)$/)).filter(Boolean).map((m) => [m[1], m[2].trim()]));
const argomenti = process.argv.slice(2);
const LOCALE = argomenti.includes("--locale");
const SITO = LOCALE ? "http://localhost:8797" : "https://lavagna.lavagna-video.workers.dev";
const SOLO = argomenti.includes("--video") ? argomenti[argomenti.indexOf("--video") + 1] : "";
const QUANTI = Number(argomenti.find((a) => /^\d+$/.test(a))) || 300;
const CHIAVE = env.SCRIPT_KEY;
if (!CHIAVE) { console.error("Manca SCRIPT_KEY in .env"); process.exit(1); }

const aspetta = (ms) => new Promise((r) => setTimeout(r, ms));
const CLIENT = { clientName: "ANDROID", clientVersion: "20.10.38", androidSdkVersion: 30, hl: "en" };
const UA = "com.google.android.youtube/20.10.38 (Linux; U; Android 11) gzip";

async function datiVideo(id) {
  const r = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST", headers: { "content-type": "application/json", "user-agent": UA },
    body: JSON.stringify({ context: { client: CLIENT }, videoId: id }),
  });
  const d = await r.json();
  const stato = d.playabilityStatus?.status;
  if (stato !== "OK") return { stato, motivo: d.playabilityStatus?.reason || "" };
  const tracce = d.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  const auto = tracce.find((t) => t.kind === "asr");
  const originale = auto?.languageCode;
  // prima i sottotitoli scritti a mano nella lingua in cui si parla, poi quelli automatici, poi qualunque sottotitolo a mano
  const scelta = tracce.find((t) => !t.kind && originale && t.languageCode.split("-")[0] === originale.split("-")[0]) || auto || tracce.find((t) => !t.kind);
  let righe = [];
  if (scelta) {
    const j = await fetch(scelta.baseUrl.replace(/&fmt=[^&]*/, "") + "&fmt=json3", { headers: { "user-agent": UA } }).then((x) => x.json()).catch(() => null);
    for (const e of j?.events || []) {
      const testo = (e.segs || []).map((s) => s.utf8 || "").join("").replace(/\s+/g, " ").trim();
      if (testo) righe.push([Math.round((e.tStartMs || 0) / 100) / 10, testo]);
    }
  }
  return {
    stato,
    lingua: (scelta?.languageCode || "").split("-")[0],
    fonte: scelta?.kind === "asr" ? "yt-auto" : "yt",
    righe,
    storyboard: d.storyboards?.playerStoryboardSpecRenderer?.spec || "",
  };
}

async function carica(id, dati) {
  const r = await fetch(`${SITO}/api/parlato/carica`, {
    method: "POST", headers: { "content-type": "application/json", "x-chiave-script": CHIAVE },
    body: JSON.stringify({ id, ...dati }),
  });
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json();
}

async function daFare() {
  if (SOLO) return [SOLO];
  const lista = [];
  let dopo = 0;
  while (lista.length < QUANTI && dopo < 20000) {
    const r = await fetch(`${SITO}/api/parlato/mancanti?n=${Math.min(200, QUANTI - lista.length)}&dopo=${dopo}`, { headers: { "x-chiave-script": CHIAVE } });
    if (!r.ok) throw new Error(`mancanti: ${r.status} ${await r.text()}`);
    const d = await r.json();
    for (const id of d.ids) if (!lista.includes(id)) lista.push(id);
    dopo = d.prossimo;
    if (!d.ids.length && dopo > 15000) break;
  }
  return lista.slice(0, QUANTI);
}

const lista = await daFare();
console.log(`${lista.length} video da trascrivere → ${SITO}`);
let fatti = 0, senza = 0, errori = 0;
for (const [i, id] of lista.entries()) {
  try {
    const d = await datiVideo(id);
    if (d.stato !== "OK") { console.log(`${i + 1}. ${id} — non disponibile (${d.stato} ${d.motivo})`); errori++; if (/bot/i.test(d.motivo)) { console.log("YouTube chiede di confermare: mi fermo, riprova più tardi."); break; } await aspetta(1500); continue; }
    await carica(id, d);
    if (d.righe.length) fatti++; else senza++;
    console.log(`${i + 1}. ${id} — ${d.righe.length ? `${d.righe.length} righe (${d.lingua}, ${d.fonte})` : "senza parlato/sottotitoli"}${d.storyboard ? " + fotogrammi" : ""}`);
  } catch (e) { errori++; console.log(`${i + 1}. ${id} — errore: ${e.message}`); }
  await aspetta(1200 + Math.random() * 800);
}
console.log(`\nFatto: ${fatti} con trascrizione, ${senza} senza, ${errori} errori.`);
