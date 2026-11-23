// SCHOOL · Banco — sotto ogni video, una riga di grandi icone con tutto quello che serve per studiare:
// trascrizione, appunti, spiegamelo semplice, altri che ne parlano, chi parla e fonti, il contrario,
// sottotitoli in due lingue, modalità studio, il percorso dell'argomento. Ogni icona apre il suo pannello sotto la riga.
// Qui anche livello e tappa di un video (per i Percorsi e il filtro per livello nelle pagine argomento).

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tempo = (x) => { x = Math.max(0, Math.floor(Number(x) || 0)); const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s = String(x % 60).padStart(2, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`; };

const P = {
  en: {
    tre: "3 key points", mappa: "Mind map", domande: "Review questions", tempo: "Timeline", scaricaMappa: "Download the map (SVG)", ingrandisci: "Tap to enlarge, tap again to close", mostraRisposta: "Show the answer",
    nessunaData: "This video does not talk about dates: no timeline here.", vaiAlMinuto: "Play from here",
    banco: "Desk", tr: "Transcript", ap: "Notes", semplice: "Explain it simply", simili: "Others who talk about it", chi: "Who is speaking", contrario: "The other side",
    lingue: "Two languages", studio: "Study mode", percorso: "Topic path",
    attesa: "Reading the video…", attesaAI: "Reading the video… the first time takes about 20 seconds, then it is instant for everyone.", controlla: "Made by AI from the transcript: check the facts (AI can be wrong).", riassunto: "In short", punti: "Key ideas", glossario: "Words to know",
    troppe: "Enough for today from here: try again tomorrow.", erroreAI: "It did not work now: try again in a while.",
    nessunSimile: "No other transcribed video talks about this yet. The archive grows every day.", parlanoDi: "Moments in other videos about:",
    canale: "Channel", fonti: "Sources cited in the description", nessunaFonte: "The description cites no sources. That does not mean it is wrong: it means you can't check from here.",
    altriLink: (n) => `${n} other links (social, shop, sponsors) left out.`, ente: "Institution", sceltoAMano: "Lavagna's channels are chosen by hand; here you see what the video itself declares.",
    tesi: "What this video holds", opposta: "The other side", altraParte: "Videos in Lavagna on the other side", nessunaAltra: "No video in Lavagna holds this position yet.", cercaAltrove: "Search it →",
    lingueSotto: "Under the video: the words as they are said, and the translation. Choose the second language:", spegni: "Turn off", senzaTr: "This video has no transcript yet.",
    studioSotto: "Only the video, the transcript and your notes. Press Esc or the button to come back.", esciStudio: "✕ Leave study mode",
    percorsoVai: (n) => `Open the path of «${n}» →`,
  },
  it: {
    tre: "Tre punti", mappa: "Mappa mentale", domande: "Domande per ripassare", tempo: "Linea del tempo", scaricaMappa: "Scarica la mappa (SVG)", ingrandisci: "Tocca per ingrandire, tocca di nuovo per chiudere", mostraRisposta: "Mostra la risposta",
    nessunaData: "Questo video non parla di date: qui non c'è una linea del tempo.", vaiAlMinuto: "Guarda da qui",
    banco: "Banco", tr: "Trascrizione", ap: "Appunti", semplice: "Spiegamelo semplice", simili: "Altri che ne parlano", chi: "Chi parla", contrario: "Il contrario",
    lingue: "Due lingue", studio: "Modalità studio", percorso: "Percorso",
    attesa: "Leggo il video…", attesaAI: "Leggo il video… la prima volta ci vogliono circa 20 secondi, poi è subito pronto per tutti.", controlla: "Fatto dall'AI sulla trascrizione: controlla i fatti (l'AI può sbagliare).", riassunto: "In breve", punti: "Le idee chiave", glossario: "Parole da sapere",
    troppe: "Per oggi basta da qui: riprova domani.", erroreAI: "Ora non è riuscito: riprova fra un po'.",
    nessunSimile: "Nessun altro video trascritto ne parla ancora. L'archivio cresce ogni giorno.", parlanoDi: "Momenti di altri video su:",
    canale: "Canale", fonti: "Fonti citate nella descrizione", nessunaFonte: "La descrizione non cita fonti. Non vuol dire che sia sbagliato: vuol dire che da qui non lo puoi controllare.",
    altriLink: (n) => `${n} altri link (social, negozio, sponsor) lasciati fuori.`, ente: "Istituzione", sceltoAMano: "I canali di Lavagna sono scelti a mano; qui vedi cosa dichiara il video stesso.",
    tesi: "Cosa sostiene questo video", opposta: "L'altra parte", altraParte: "Video di Lavagna dall'altra parte", nessunaAltra: "Nessun video di Lavagna sostiene ancora questa posizione.", cercaAltrove: "Cercala →",
    lingueSotto: "Sotto il video: le parole come vengono dette, e la traduzione. Scegli la seconda lingua:", spegni: "Spegni", senzaTr: "Questo video non ha ancora la trascrizione.",
    studioSotto: "Solo il video, la trascrizione e i tuoi appunti. Premi Esc o il pulsante per tornare.", esciStudio: "✕ Esci dalla modalità studio",
    percorsoVai: (n) => `Apri il percorso di «${n}» →`,
  },
};
const NOMI_LINGUE = { it: "Italiano", en: "English", es: "Español", de: "Deutsch", fr: "Français" };

// ——— livello e tappa: dal titolo, dal canale, dalla descrizione e dalla durata ———
export const LIVELLI = ["medie", "liceo", "universita", "divulgazione"];
export function livello(v) {
  const x = `${v.titolo || ""} ${v.nomeCanale || ""} ${(v.descrizione || "").slice(0, 300)}`.toLowerCase();
  if (/scuola media|scuole medie|per bambini|bambini|kids|for kids|elementari|primaria|grundschule|niños|enfants|\beli5\b|to a 5 year old/.test(x)) return "medie";
  if (/universit|lecture|vorlesung|cours magistral|clase magistral|professor|seminar|colloquium|opencourseware|\bmit\b|stanford|harvard|yale|oxford|cambridge|lezione universitaria|corso di laurea/.test(x) || (v.durata || 0) > 3000) return "universita";
  if (/liceo|maturit|high school|a-level|gcse|\bap\b|abitur|bachillerato|selectividad|esame di stato|interrogazione|ripasso|per la scuola|lezione di|spiegazione/.test(x)) return "liceo";
  return "divulgazione";
}
// quanto è «da primi passi» (negativo) o «da approfondire» (positivo) un video: serve a ordinare i Percorsi
export function peso(v) {
  const x = `${v.titolo || ""}`.toLowerCase(), d = v.durata || 0, l = livello(v);
  let p = 0;
  if (/introduz|intro\b|cos'?è|che cos|what is|what are|explained|spiegat|in \d+ minut|basics|le basi|for beginners|principianti|semplice|easy|simple|qu'est-ce|was ist|qué es|in breve|in pillole|why do|perché|how does|come funziona/.test(x)) p -= 2;
  if (/approfond|deep dive|in depth|in-depth|lecture|corso|completa|full course|documentar|storia completa|seminar|vorlesung|conferenza/.test(x)) p += 2;
  if (d) p += d <= 480 ? -1 : d >= 2700 ? 2 : d >= 1500 ? 1 : 0;
  if (l === "universita") p += 2; if (l === "medie") p -= 2;
  return p;
}
// le tre tappe: dai più introduttivi ai più approfonditi, divisi in tre parti uguali (così nessuna resta vuota)
export function tappe(lista, quanti = 12) {
  const ord = [...lista].sort((a, b) => peso(a) - peso(b) || (a.durata || 0) - (b.durata || 0));
  const terzo = Math.ceil(ord.length / 3);
  return [0, 1, 2].map((i) => ord.slice(i * terzo, (i + 1) * terzo).sort((a, b) => (b.viste || 0) - (a.viste || 0)).slice(0, quanti));
}

// ——— la riga e i pannelli ———
export function banco(dove, v, A) {
  const p = (k, ...a) => { const x = P[A.ui()]?.[k] ?? P.en[k]; return typeof x === "function" ? x(...a) : x; };
  const yt = /^[\w-]{11}$/.test(v.id);
  const ICONE = [
    yt && ["tr", "☰"], yt && ["ap", "✎"], yt && ["semplice", "✧"], yt && ["tre", "③"], yt && ["mappa", "✺"], yt && ["domande", "?"], yt && ["tempo", "⟿"],
    yt && ["simili", "⇄"], yt && ["dibattiti", "attualita", "filosofia"].includes(v.cat) && ["contrario", "⚖"], ["studio", "◐"],
  ].filter(Boolean);
  const AI = ["semplice", "tre", "mappa", "domande", "tempo", "contrario"];
  let aperto = null, chiudiPannello = () => {};
  dove.innerHTML = `<section class="banco" aria-label="SCHOOL · ${p("banco")}">
    <h2 class="banco-t"><b>SCHOOL</b> · ${p("banco")}</h2>
    <div class="banco-riga" role="toolbar">${ICONE.map(([k, ic]) => `<button class="bi" data-k="${k}" aria-pressed="false"><span class="bi-ic" aria-hidden="true">${ic}</span><span class="bi-n">${p(k)}</span></button>`).join("")}</div>
    <div class="banco-pannello" id="bancoP" hidden></div></section>`;
  const pannello = dove.querySelector("#bancoP");
  const inStudio = () => document.body.classList.contains("modo-studio");
  const segna = () => dove.querySelectorAll(".bi").forEach((b) => {
    const on = b.dataset.k === aperto || (b.dataset.k === "studio" && inStudio());
    b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on));
  });
  const apri = async (k, forza = false) => {
    if (aperto === k && !forza) { chiudiPannello(); chiudiPannello = () => {}; aperto = null; pannello.hidden = true; pannello.innerHTML = ""; segna(); return; }
    chiudiPannello(); chiudiPannello = () => {};
    aperto = k; pannello.hidden = false; segna();
    pannello.innerHTML = `<p class="sotto bp-attesa">${p(AI.includes(k) ? "attesaAI" : "attesa")}</p>`;
    if (k === "tr" || k === "ap") { A.memo.set("schedaStudio", k); const x = A.pannelloVideo(pannello, { id: v.id, titolo: v.titolo, nomeCanale: v.nomeCanale, durata: v.durata }, A.lettore); x.video?.(v); chiudiPannello = () => x.chiudi(); return; }
    return ({ semplice, tre, mappa, domande, tempo: lineaTempo, simili, contrario })[k]?.();
  };
  dove.querySelector(".banco-riga").onclick = (e) => {
    const b = e.target.closest(".bi"); if (!b) return;
    if (b.dataset.k === "studio") return studio(!inStudio());
    apri(b.dataset.k);
  };
  const chiedi = async (cosa) => {
    const r = await fetch(`/api/banco/${cosa}/${v.id}?ui=${A.ui()}`).catch(() => null);
    const d = await r?.json().catch(() => ({})) || {};
    return { ok: !!r?.ok, stato: r?.status || 0, d };
  };
  // una risposta dell'AI: se manca la trascrizione si chiede, se non va si dice perché
  async function daAI(cosa, disegna) {
    const { ok, stato, d } = await chiedi(cosa);
    if (aperto !== cosa && !(cosa === "tempo" && aperto === "tempo")) return;
    if (ok) return disegna(d);
    if (d.errore === "trascrizione") { const t = await A.trascrizione(v.id); return A.chiediTrascrizione(pannello, v.id, t.fonte, () => { if (aperto === cosa) apri(cosa, true); }); }
    pannello.innerHTML = `<p class="sotto">${stato === 429 ? p("troppe") : p("erroreAI")}</p>`;
  }
  const nota = () => `<p class="bp-nota">${p("controlla")}</p>`;
  const vai = (sec) => { try { A.lettore()?.vai?.(sec); A.lettore()?.play?.(); } catch {} };

  // ✧ spiegamelo semplice
  const semplice = () => daAI("semplice", (d) => {
    pannello.innerHTML = `<div class="bp-semplice"><div><h3>${p("riassunto")}</h3><p class="bp-riass">${esc(d.riassunto)}</p>
        ${d.punti?.length ? `<h3>${p("punti")}</h3><ul>${d.punti.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div>
      ${d.glossario?.length ? `<div><h3>${p("glossario")}</h3><dl class="st-glossario">${d.glossario.map((g) => `<dt>${esc(g.termine)}</dt><dd>${esc(g.spiegazione)}</dd>`).join("")}</dl></div>` : ""}</div>${nota()}`;
  });
  // ③ tre punti
  const tre = () => daAI("tre", (d) => {
    pannello.innerHTML = `<ol class="bp-tre">${d.punti.map((x, i) => `<li><span class="bp-tre-n">${i + 1}</span><div>${x.titolo ? `<strong>${esc(x.titolo)}</strong>` : ""}<p>${esc(x.testo)}</p></div></li>`).join("")}</ol>${nota()}`;
  });
  // ✺ mappa mentale del video
  const mappa = () => daAI("mappa", (d) => {
    const svg = A.svgMappa(d.testo, d.centro || v.titolo);
    pannello.innerHTML = `<div class="bp-mappa">${svg}</div><p><button class="bott piccolo" id="bpScaricaMappa">⤓ ${p("scaricaMappa")}</button></p>${nota()}`;
    // un tocco sulla mappa la apre in grande, un altro la richiude
    const m = pannello.querySelector(".bp-mappa");
    m.title = p("ingrandisci"); m.onclick = () => m.classList.toggle("grande");
    pannello.querySelector("#bpScaricaMappa").onclick = () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      a.download = `mappa-${(v.titolo || v.id).normalize("NFD").replace(/[^\w]+/g, "-").slice(0, 50).toLowerCase()}.svg`;
      document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    };
  });
  // ? domande per ripassare: la risposta si apre, niente punteggi
  const domande = () => daAI("domande", (d) => {
    pannello.innerHTML = `<div class="st-domande bp-domande">${d.domande.map((x) => `<details><summary>${esc(x.d)}</summary><p>${esc(x.r)}</p></details>`).join("")}</div>${nota()}`;
  });
  // ⟿ linea del tempo, con il minuto del video in cui se ne parla
  const lineaTempo = () => daAI("tempo", (d) => {
    if (!d.eventi?.length) { pannello.innerHTML = `<p class="sotto">${p("nessunaData")}</p>`; return; }
    pannello.innerHTML = `<ol class="st-tempo bp-tempo">${d.eventi.map((e) => `<li><b>${esc(e.quando)}</b><span>${esc(e.cosa)}</span> ${e.sec ? `<button class="link" data-sec="${e.sec}" title="${p("vaiAlMinuto")}">▶ ${tempo(e.sec)}</button>` : ""}</li>`).join("")}</ol>${nota()}`;
    pannello.querySelector(".bp-tempo").onclick = (e) => { const b = e.target.closest("[data-sec]"); if (b) vai(Number(b.dataset.sec)); };
  });

  // ⇄ altri che ne parlano: i punti esatti di altri video
  async function simili() {
    const { ok, stato, d } = await chiedi("simili");
    if (aperto !== "simili") return;
    if (!ok) { pannello.innerHTML = `<p class="sotto">${stato === 429 ? p("troppe") : p("erroreAI")}</p>`; return; }
    if (!d.momenti?.length) { pannello.innerHTML = `<p class="sotto">${p("nessunSimile")}</p>`; return; }
    const re = d.parole?.length ? new RegExp(`(${d.parole.map((x) => x.slice(0, Math.max(4, x.length - 1)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi") : null;
    const evidenzia = (x) => (re ? esc(x).replace(re, "<mark>$1</mark>") : esc(x));
    pannello.innerHTML = `<p class="bp-parole">${p("parlanoDi")} ${d.parole.map((x) => `<span>${esc(x)}</span>`).join("")}</p>
      <div class="bp-momenti">${d.momenti.map((m) => `<a class="bp-m" href="#/v/${m.id}" data-v="${m.id}" data-t="${m.da}">
        <span class="bp-foto" style="background-image:url(https://i.ytimg.com/vi/${m.id}/mqdefault.jpg)"><span class="pe-tc">${tempo(m.da)}</span></span>
        <span class="bp-testo"><strong>${esc(m.titolo || m.id)}</strong><small>${esc(m.nomeCanale || "")}${m.lingua ? ` · ${m.lingua.toUpperCase()}` : ""}</small><span>«${evidenzia(m.estratto)}»</span></span></a>`).join("")}</div>`;
    pannello.querySelector(".bp-momenti").onclick = (e) => { const a = e.target.closest("[data-v]"); if (!a) return; e.preventDefault(); if (inStudio()) studio(false); A.apriVideo(a.dataset.v, Number(a.dataset.t)); };
  }

  // ⚖ il contrario
  const contrario = () => daAI("contrario", (d) => {
    pannello.innerHTML = `<div class="bp-due"><div class="bp-lato"><h3>${p("tesi")}</h3><p>${esc(d.tesi)}</p></div><div class="bp-lato altro"><h3>${p("opposta")}</h3><p>${esc(d.opposta)}</p></div></div>
      <h3>${p("altraParte")}</h3>
      ${d.video?.length ? `<div class="bp-momenti">${d.video.map((x) => `<a class="bp-m" href="#/v/${x.id}"><span class="bp-foto" style="background-image:url(https://i.ytimg.com/vi/${x.id}/mqdefault.jpg)"></span>
        <span class="bp-testo"><strong>${esc(x.titolo)}</strong><small>${esc(x.nomeCanale || "")}</small></span></a>`).join("")}</div>`
      : `<p class="sotto">${p("nessunaAltra")} ${d.ricerche?.[0] ? `<a class="link" href="#/cerca/${encodeURIComponent(d.ricerche[0])}">${p("cercaAltrove")}</a>` : ""}</p>`}${nota()}`;
  });

  // ◐ modalità studio: schermo intero, scuro, solo il video e SCHOOL · Desk aperto
  const fuoriDaSchermoIntero = () => { if (!document.fullscreenElement && inStudio()) studio(false); };
  const esci = (e) => { if (e.key === "Escape" && inStudio() && !document.fullscreenElement) studio(false); };
  function studio(on) {
    document.body.classList.toggle("modo-studio", on);
    document.querySelector(".esci-studio")?.remove();
    if (on) {
      document.body.insertAdjacentHTML("beforeend", `<button class="esci-studio">${p("esciStudio")}</button>`);
      document.querySelector(".esci-studio").onclick = () => studio(false);
      document.addEventListener("keydown", esci);
      document.addEventListener("fullscreenchange", fuoriDaSchermoIntero);
      document.documentElement.requestFullscreen?.().catch(() => {});
      if (!aperto) apri(yt ? "tr" : "studio");
      window.scrollTo(0, 0);
    } else {
      document.removeEventListener("keydown", esci);
      document.removeEventListener("fullscreenchange", fuoriDaSchermoIntero);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    }
    segna();
  }

  return { chiudi() { chiudiPannello(); if (inStudio()) studio(false); } };
}
