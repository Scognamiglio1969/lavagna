// L'indice di Lavagna: ogni video che il server incontra finisce nel database D1,
// così la ricerca guarda tutto l'archivio accumulato e non solo gli ultimi 15 video per canale.
// Tre lavori, fatti a turno ogni 10 minuti dal cron:
//   1. giro dei feed: un pezzo di canali per volta (il piano gratuito concede 50 richieste esterne a giro)
//   2. con la chiave YouTube (secret YT_KEY): durate e viste vere, e archivio completo dei canali, 50 video per pagina
//   3. vettori per la ricerca per significato (Workers AI, modello multilingue bge-m3)

const MODELLO = "@cf/baai/bge-m3";
const BUDGET_FEED = 38;      // richieste esterne per i feed a ogni giro
const MAX_VETTORI = 4500;    // il piano gratuito di Vectorize tiene 5 milioni di dimensioni: 4.500 vettori da 1024
const VETTORI_PER_GIRO = 30;  // giro ogni 5 minuti: 60 ogni 10 minuti, il ritmo scelto dall'utente
const PAGINE_ARCHIVIO = 2;   // canali YouTube di cui leggere una pagina di archivio (50 video) a ogni giro
const LIMITE_ARCHIVIO = 40000; // l'archivio vecchio si legge solo finché le scritture del giorno restano sotto questa soglia

const ora = () => new Date().toISOString();

// ——— freno sulle scritture ———
// Il piano gratuito di Cloudflare concede 100.000 righe scritte al giorno su D1 per account.
// Lavagna ora ha un account suo (separato da Sbobina), ma tiene comunque un margine:
// oltre questa soglia smette di scrivere fino al giorno dopo (UTC), così il sito non si blocca mai.
export const LIMITE_SCRITTURE = 60000;
const chiaveGiorno = () => `scritture:${new Date().toISOString().slice(0, 10)}`;
export async function scrittureOggi(env) {
  const r = await env.DB.prepare("SELECT valore FROM stato WHERE chiave = ?").bind(chiaveGiorno()).first();
  return r ? Number(r.valore) : 0;
}
export const possoScrivere = async (env) => (await scrittureOggi(env)) < LIMITE_SCRITTURE;
const righeScritte = (esiti) => [].concat(esiti).reduce((n, e) => n + (e?.meta?.rows_written || 0), 0);
async function conta(env, n) {
  if (!n) return;
  await env.DB.prepare("INSERT INTO stato (chiave, valore) VALUES (?, ?) ON CONFLICT(chiave) DO UPDATE SET valore = CAST(valore AS INTEGER) + excluded.valore")
    .bind(chiaveGiorno(), n + 1).run();
}

async function leggiStato(env, chiave, d = null) {
  const r = await env.DB.prepare("SELECT valore FROM stato WHERE chiave = ?").bind(chiave).first();
  return r ? JSON.parse(r.valore) : d;
}
const scriviStato = (env, chiave, valore) =>
  env.DB.prepare("INSERT INTO stato (chiave, valore) VALUES (?, ?) ON CONFLICT(chiave) DO UPDATE SET valore = excluded.valore")
    .bind(chiave, JSON.stringify(valore)).run();

// Salva una lista di video: i nuovi entrano anche nella ricerca a parole; per i vecchi si aggiornano solo viste e durata.
export async function salvaVideo(env, lista, { aggiorna = true } = {}) {
  if (!lista.length || !(await possoScrivere(env))) return 0;
  let nuovi = 0, scritte = 0;
  for (let i = 0; i < lista.length; i += 50) {
    const pezzo = lista.slice(i, i + 50);
    const segni = pezzo.map(() => "?").join(",");
    const { results } = await env.DB.prepare(`SELECT id FROM video WHERE id IN (${segni})`).bind(...pezzo.map((v) => v.id)).all();
    const gia = new Set(results.map((r) => r.id));
    const istruzioni = [];
    for (const v of pezzo) {
      if (gia.has(v.id)) {
        if (!aggiorna) continue; // dalle visite si aggiungono solo i nuovi: le scritture su D1 restano poche
        istruzioni.push(env.DB.prepare(
          // si riscrive solo se le viste sono cresciute di oltre il 10% o arriva la durata: le scritture su D1 restano poche
          "UPDATE video SET viste = ?, durata = COALESCE(?, durata) WHERE id = ? AND (? > viste * 1.1 + 10 OR (durata IS NULL AND ? IS NOT NULL))",
        ).bind(v.viste || 0, v.durata || null, v.id, v.viste || 0, v.durata || null));
        continue;
      }
      nuovi++;
      istruzioni.push(env.DB.prepare(
        `INSERT INTO video (id, fonte, titolo, descrizione, data, canale, nome_canale, lingua, cat, thumb, link, embed, durata, viste, visto_il)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING`,
      ).bind(v.id, v.fonte || "yt", v.titolo || "", v.descrizione || "", v.data || "", v.canale, v.nomeCanale || "", v.lingua || "",
        v.cat || "", v.thumb || null, v.link || null, v.embed || null, v.durata || null, v.viste || 0, ora()));
      istruzioni.push(env.DB.prepare("INSERT INTO parole (id, titolo, descrizione, nome_canale) VALUES (?, ?, ?, ?)")
        .bind(v.id, v.titolo || "", v.descrizione || "", v.nomeCanale || ""));
    }
    if (istruzioni.length) scritte += righeScritte(await env.DB.batch(istruzioni));
  }
  // contatore dei video tenuto a mano: contarli ogni volta costerebbe una lettura per riga
  if (nuovi) scritte += righeScritte(await env.DB.prepare(
    "INSERT INTO stato (chiave, valore) VALUES ('totale', ?) ON CONFLICT(chiave) DO UPDATE SET valore = CAST(valore AS INTEGER) + excluded.valore",
  ).bind(nuovi).run());
  await conta(env, scritte);
  return nuovi;
}

// 1. giro dei feed
async function giroFeed(env, { elenco, feed }) {
  const canali = (await elenco(env)).flatMap((c) => c.canali.map((x) => ({ ...x, cat: c.id })));
  let da = (await leggiStato(env, "giro", 0)) % canali.length;
  let spesa = 0, letti = 0;
  const tutti = [];
  while (letti < canali.length) {
    const c = canali[(da + letti) % canali.length];
    const costo = c.id.startsWith("rai:") ? 3 : c.id.startsWith("UC") ? 2 : 1;
    if (spesa + costo > BUDGET_FEED) break;
    spesa += costo; letti++;
    tutti.push(...(await feed(c, c.cat).catch(() => [])));
  }
  await scriviStato(env, "giro", (da + letti) % canali.length);
  return { canali: letti, nuovi: await salvaVideo(env, tutti) };
}

// 2. YouTube Data API (solo se c'è la chiave)
const isoSecondi = (d = "") => {
  const m = d.match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || [];
  return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0);
};
async function yt(env, percorso, parametri) {
  const u = new URL(`https://www.googleapis.com/youtube/v3/${percorso}`);
  for (const [k, v] of Object.entries({ ...parametri, key: env.YT_KEY })) if (v) u.searchParams.set(k, v);
  const r = await fetch(u);
  if (!r.ok) throw new Error(`YouTube API ${r.status}`);
  return r.json();
}
async function durateYT(env, ids) {
  const fatti = [];
  for (let i = 0; i < ids.length; i += 50) {
    const d = await yt(env, "videos", { part: "contentDetails,statistics", id: ids.slice(i, i + 50).join(",") });
    for (const x of d.items || []) fatti.push({ id: x.id, durata: isoSecondi(x.contentDetails?.duration), viste: Number(x.statistics?.viewCount || 0) });
  }
  if (fatti.length) await conta(env, righeScritte(await env.DB.batch(fatti.map((f) => env.DB.prepare("UPDATE video SET durata = ?, viste = ? WHERE id = ?").bind(f.durata, f.viste, f.id)))));
  return fatti.length;
}
async function lavoriYT(env, { elenco }) {
  if (!env.YT_KEY) return null;
  if (!(await possoScrivere(env))) return { fermo: "limite di scritture del giorno raggiunto" };
  // durate e viste dei video che non le hanno ancora (i feed RSS non danno la durata)
  const { results } = await env.DB.prepare("SELECT id FROM video WHERE fonte = 'yt' AND durata IS NULL ORDER BY data DESC LIMIT 100").all();
  const durate = await durateYT(env, results.map((r) => r.id)).catch(() => 0);
  // archivio: una pagina in più per qualche canale, finché ogni canale non è letto tutto
  const canali = (await elenco(env)).flatMap((c) => c.canali.filter((x) => x.id.startsWith("UC")).map((x) => ({ ...x, cat: c.id })));
  const fatti = (await leggiStato(env, "archivio", {})) || {};
  const daFare = (await scrittureOggi(env)) < LIMITE_ARCHIVIO ? canali.filter((c) => fatti[c.id] !== "fine").slice(0, PAGINE_ARCHIVIO) : [];
  let archivio = 0;
  for (const c of daFare) {
    try {
      const pagina = await yt(env, "playlistItems", { part: "snippet", maxResults: 50, playlistId: `UULF${c.id.slice(2)}`, pageToken: fatti[c.id] || "" });
      const lista = (pagina.items || []).map(({ snippet: s }) => ({
        id: s.resourceId?.videoId, titolo: s.title, descrizione: (s.description || "").slice(0, 1200), data: s.publishedAt,
        canale: c.id, nomeCanale: c.nome, lingua: c.lingua, cat: c.cat, viste: 0,
      })).filter((v) => v.id && v.titolo !== "Private video" && v.titolo !== "Deleted video");
      archivio += await salvaVideo(env, lista);
      fatti[c.id] = pagina.nextPageToken || "fine";
    } catch { fatti[c.id] = "fine"; } // playlist dei video lunghi assente: si lascia perdere
  }
  await scriviStato(env, "archivio", fatti);
  return { durate, archivio, canaliFiniti: Object.values(fatti).filter((x) => x === "fine").length, canali: canali.length };
}

// 3. vettori per il significato
// testo da trasformare in vettore: il taglio a 400 caratteri non deve spezzare emoji o caratteri doppi
const pulito = (t) => String(t || "").toWellFormed().replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, " ");
const testoDi = (v) => pulito(`${v.titolo}. ${v.nome_canale}. ${Array.from(v.descrizione || "").slice(0, 400).join("")}`);
async function vettori(env) {
  if (!env.AI || !env.VETTORI) return null;
  if (!(await possoScrivere(env))) return { fermo: "limite di scritture del giorno raggiunto" };
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM video WHERE vettore = 1").first();
  const posto = Math.min(VETTORI_PER_GIRO, MAX_VETTORI - n);
  await scriviStato(env, "vettori", n);
  if (posto <= 0) return { fatti: 0, totale: n, pieno: true };
  const { results } = await env.DB.prepare("SELECT id, titolo, descrizione, nome_canale, cat, lingua, fonte FROM video WHERE vettore = 0 ORDER BY data DESC LIMIT ?").bind(posto).all();
  if (!results.length) return { fatti: 0, totale: n };
  // prima tutto il blocco; se l'AI lo rifiuta, un video alla volta, e quelli che non passano si mettono da parte (vettore = 2)
  const fatti = [], scartati = [];
  try {
    const r = await env.AI.run(MODELLO, { text: results.map(testoDi) });
    const valori = r.data || r.response || [];
    results.forEach((v, i) => valori[i] ? fatti.push([v, valori[i]]) : scartati.push(v));
  } catch {
    for (const v of results) {
      try { const r = await env.AI.run(MODELLO, { text: [testoDi(v)] }); const x = (r.data || r.response || [])[0]; x ? fatti.push([v, x]) : scartati.push(v); }
      catch { scartati.push(v); }
    }
  }
  if (fatti.length) await env.VETTORI.upsert(fatti.map(([v, x]) => ({ id: v.id, values: x, metadata: { cat: v.cat, lingua: v.lingua, fonte: v.fonte } })));
  const segna = [...fatti.map(([v]) => [v.id, 1]), ...scartati.map((v) => [v.id, 2])];
  await conta(env, righeScritte(await env.DB.batch(segna.map(([id, x]) => env.DB.prepare("UPDATE video SET vettore = ? WHERE id = ?").bind(x, id)))));
  await scriviStato(env, "vettori", n + fatti.length); // letto dalla ricerca senza contare le righe
  return { fatti: fatti.length, scartati: scartati.length, totale: n + fatti.length };
}

export async function lavoroPeriodico(env, dip) {
  const scritte = await scrittureOggi(env);
  if (scritte >= LIMITE_SCRITTURE) {
    // fermo fino a domani: niente feed, niente vettori, niente archivio. Sbobina ha la precedenza.
    const esito = { fermo: true, scritteOggi: scritte, limite: LIMITE_SCRITTURE };
    await scriviStato(env, "ultimo_giro", { quando: ora(), ...esito });
    return esito;
  }
  const esito = { feed: await giroFeed(env, dip) };
  esito.youtube = await lavoriYT(env, dip).catch((e) => ({ errore: String(e) }));
  esito.vettori = await vettori(env).catch((e) => ({ errore: String(e) }));
  esito.scritteOggi = await scrittureOggi(env);
  esito.limite = LIMITE_SCRITTURE;
  await scriviStato(env, "ultimo_giro", { quando: ora(), ...esito });
  return esito;
}

// ——— ricerca ———
const DURATE = { breve: [0, 600], medio: [600, 2400], lungo: [2400, 1e9] };
export const comeVideo = (r) => ({
  id: r.id, fonte: r.fonte === "yt" ? undefined : r.fonte, titolo: r.titolo, descrizione: r.descrizione, data: r.data,
  canale: r.canale, nomeCanale: r.nome_canale, lingua: r.lingua, cat: r.cat, thumb: r.thumb || undefined,
  link: r.link || undefined, embed: r.embed || undefined, durata: r.durata, viste: r.viste,
});

function filtri(p) {
  const dove = [], valori = [];
  if (p.cat) { dove.push("v.cat = ?"); valori.push(p.cat); }
  if (["it", "en", "es", "de", "fr"].includes(p.lingua)) { dove.push("v.lingua = ?"); valori.push(p.lingua); }
  if (p.fonte) { dove.push("v.fonte = ?"); valori.push(p.fonte); }
  if (DURATE[p.durata]) { dove.push("v.durata >= ? AND v.durata < ?"); valori.push(...DURATE[p.durata]); }
  return { dove, valori };
}

export async function cerca(env, p) {
  const q = (p.q || "").trim().slice(0, 200);
  const { dove, valori } = filtri(p);
  const totale = Number(await leggiStato(env, "totale", 0));
  const conVettore = Number(await leggiStato(env, "vettori", 0));
  const esito = { totale, conVettore, maxVettori: MAX_VETTORI, parole: [], significato: [] };

  if (!q) { // niente parole: i più recenti (o i più visti) con i filtri scelti
    const ordine = p.ordine === "viste" ? "v.viste DESC" : "v.data DESC";
    const { results } = await env.DB.prepare(`SELECT v.* FROM video v ${dove.length ? "WHERE " + dove.join(" AND ") : ""} ORDER BY ${ordine} LIMIT 120`).bind(...valori).all();
    esito.parole = results.map(comeVideo);
    return esito;
  }

  // a parole: ogni parola anche come inizio di parola ("fisic" trova "fisica")
  const termini = q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  if (termini.length) {
    const match = termini.map((t) => `"${t}"*`).join(" ");
    const { results } = await env.DB.prepare(
      `SELECT v.* FROM parole JOIN video v ON v.id = parole.id WHERE parole MATCH ? ${dove.map((d) => "AND " + d).join(" ")} ORDER BY bm25(parole, 0, 10, 1, 4) LIMIT 60`,
    ).bind(match, ...valori).all();
    esito.parole = results.map(comeVideo);
  }

  // per significato
  if (env.AI && env.VETTORI && p.significato !== "0") {
    try {
      const r = await env.AI.run(MODELLO, { text: [q] });
      const vettore = (r.data || r.response || [])[0];
      const { matches } = await env.VETTORI.query(vettore, { topK: 50 });
      // si tengono solo i vicini veri: almeno 0,5 di somiglianza e non troppo lontani dal migliore
      const soglia = Math.max(0.5, (matches[0]?.score || 0) - 0.1);
      const buoni = matches.filter((m) => m.score >= soglia);
      if (p.debug) esito.debug = matches.slice(0, 5).map((m) => [m.id, m.score]);
      const gia = new Set(esito.parole.map((v) => v.id));
      const ids = buoni.map((m) => m.id).filter((id) => !gia.has(id));
      if (ids.length) {
        const { results } = await env.DB.prepare(
          `SELECT v.* FROM video v WHERE v.id IN (${ids.map(() => "?").join(",")}) ${dove.map((d) => "AND " + d).join(" ")}`,
        ).bind(...ids, ...valori).all();
        const pos = new Map(ids.map((id, i) => [id, i]));
        esito.significato = results.sort((a, b) => pos.get(a.id) - pos.get(b.id)).slice(0, 30).map(comeVideo);
      }
    } catch (e) { esito.erroreSignificato = String(e); }
  }
  return esito;
}

export async function statoIndice(env) {
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM video").first();
  const { v } = await env.DB.prepare("SELECT COUNT(*) AS v FROM video WHERE vettore = 1").first();
  const { d } = await env.DB.prepare("SELECT COUNT(*) AS d FROM video WHERE durata IS NOT NULL").first();
  return { video: n, conVettore: v, conDurata: d, maxVettori: MAX_VETTORI, chiaveYouTube: !!env.YT_KEY,
    scritteOggi: await scrittureOggi(env), limiteScritture: LIMITE_SCRITTURE, ultimoGiro: await leggiStato(env, "ultimo_giro") };
}

// ——— liste per le pagine, lette dall'indice (nessun limite al numero di canali per sezione) ———
export async function videoDiCategoria(env, cat, quanti = 240) {
  const { results } = await env.DB.prepare("SELECT * FROM video WHERE cat = ? ORDER BY data DESC LIMIT ?").bind(cat, quanti).all();
  return results.map((r) => ({ ...comeVideo(r), descrizione: (r.descrizione || "").slice(0, 600) }));
}
export async function videoDiCanale(env, canale, quanti = 60) {
  const { results } = await env.DB.prepare("SELECT * FROM video WHERE canale = ? ORDER BY data DESC LIMIT ?").bind(canale, quanti).all();
  return results.map(comeVideo);
}
// quando un canale si toglie, spariscono anche i suoi video dall'indice
export async function togliCanale(env, canale) {
  const { n } = await env.DB.prepare("SELECT COUNT(*) AS n FROM video WHERE canale = ?").bind(canale).first();
  if (!n) return 0;
  const esiti = await env.DB.batch([
    env.DB.prepare("DELETE FROM parole WHERE id IN (SELECT id FROM video WHERE canale = ?)").bind(canale),
    env.DB.prepare("DELETE FROM video WHERE canale = ?").bind(canale),
    env.DB.prepare("UPDATE stato SET valore = CAST(valore AS INTEGER) - ? WHERE chiave = 'totale'").bind(n),
  ]);
  await conta(env, righeScritte(esiti));
  return n;
}

// ——— la home: 3 in evidenza, 4 novità, 5 per ogni sezione ———
export async function home(env, categorie, lingua) {
  const lin = ["it", "en", "es", "de", "fr"].includes(lingua) ? lingua : "";
  const filtro = lin ? "AND lingua = ?" : "";
  const arg = lin ? [lin] : [];
  const corta = (r) => ({ ...comeVideo(r), descrizione: (r.descrizione || "").slice(0, 300) });
  const usati = new Set(), canaliUsati = new Set();
  const prendi = (righe, quanti, { unaPerSezione = false } = {}) => {
    const scelti = [], sezioni = new Set();
    for (const r of righe) {
      if (scelti.length >= quanti) break;
      if (usati.has(r.id) || canaliUsati.has(r.canale) || (unaPerSezione && sezioni.has(r.cat))) continue;
      scelti.push(corta(r)); usati.add(r.id); canaliUsati.add(r.canale); sezioni.add(r.cat);
    }
    return scelti;
  };
  const settimana = new Date(Date.now() - 7 * 864e5).toISOString();
  // in evidenza: i più visti degli ultimi 7 giorni (se mancano le viste, i più recenti)
  const { results: forti } = await env.DB.prepare(
    `SELECT * FROM video WHERE data >= ? ${filtro} ORDER BY viste DESC, data DESC LIMIT 80`).bind(settimana, ...arg).all();
  // una rosa di video forti (uno per sezione): la pagina ne pesca 3 a caso a ogni caricamento.
  // Se nell'ultima settimana sono pochi, si allarga all'ultimo mese.
  const evidenza = prendi(forti, 12, { unaPerSezione: true });
  if (evidenza.length < 9) {
    const mese = new Date(Date.now() - 30 * 864e5).toISOString();
    const { results: altri } = await env.DB.prepare(
      `SELECT * FROM video WHERE data >= ? ${filtro} ORDER BY viste DESC, data DESC LIMIT 120`).bind(mese, ...arg).all();
    const giaSezioni = new Set(evidenza.map((v) => v.cat));
    evidenza.push(...prendi(altri.filter((r) => !giaSezioni.has(r.cat)), 12 - evidenza.length, { unaPerSezione: true }));
  }
  const { results: nuovi } = await env.DB.prepare(`SELECT * FROM video WHERE 1 = 1 ${filtro} ORDER BY data DESC LIMIT 60`).bind(...arg).all();
  const novita = prendi(nuovi, 4);
  const sezioni = [];
  for (const c of categorie) {
    const { results } = await env.DB.prepare(`SELECT * FROM video WHERE cat = ? ${filtro} ORDER BY data DESC LIMIT 40`).bind(c.id, ...arg).all();
    canaliUsati.clear(); // in ogni fila canali diversi, ma lo stesso canale può tornare in un'altra sezione
    const video = prendi(results, 5);
    if (video.length) sezioni.push({ id: c.id, nome: c.nome, segno: c.segno, video });
  }
  return { evidenza, novita, sezioni };
}

// quando un canale cambia sezione, i suoi video già indicizzati la seguono
export async function spostaVideo(env, canale, cat) {
  const r = await env.DB.prepare("UPDATE video SET cat = ? WHERE canale = ?").bind(cat, canale).run();
  await conta(env, r?.meta?.rows_written || 0);
  return r?.meta?.changes || 0;
}
