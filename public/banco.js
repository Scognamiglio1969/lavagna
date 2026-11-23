// SCHOOL · Banco — sotto ogni video, una riga di grandi icone con tutto quello che serve per studiare:
// trascrizione, appunti, spiegamelo semplice, altri che ne parlano, chi parla e fonti, il contrario,
// sottotitoli in due lingue, modalità studio, il percorso dell'argomento. Ogni icona apre il suo pannello sotto la riga.
// Qui anche livello e tappa di un video (per i Percorsi e il filtro per livello nelle pagine argomento).

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tempo = (x) => { x = Math.max(0, Math.floor(Number(x) || 0)); const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s = String(x % 60).padStart(2, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`; };

const P = {
  en: {
    entraT: "SCHOOL is for those who have their own Lavagna", entraSotto: "Create it here in one tap, then add your free Gemini key and everything works.",
    chiaveT: "Your Gemini key (free)", chiaveSotto: "SCHOOL's tools use Gemini, Google's AI. Everyone uses their own key: it is free and takes a minute.",
    passi: ["Open <a href=\"https://aistudio.google.com/apikey\" target=\"_blank\" rel=\"noopener\">Google AI Studio ↗</a> and sign in with your Google account.", "Press «Create API key».", "If it asks, choose «Create API key in new project».", "Press «Copy key» (the key is one long line: it starts with «AQ.» or «AIza») and paste it here."],
    incollaChiave: "Paste your key (AIza… or AQ.…)", salvaChiave: "Save and continue", verifico: "Checking the key with Google…",
    chiaveNote: "No credit card: Google's free plan is enough to study every day. The key stays only in this browser: Lavagna does not keep it, only a fingerprint to check that each key is used by one person only. On the free plan Google may use what you send to improve its services. You can remove it whenever you like.",
    errFormato: "This does not look like a key: it is one long line that starts with AIza or AQ., with no spaces.", errNonValida: "Google says this key does not work: check you copied all of it.",
    errGiaUsata: "This key is already linked to another Lavagna: everyone must use their own.", errQuota: "Your key has used up today's free requests: try again tomorrow.",
    chiaveOk: "Gemini key: ready", cambiaChiave: "change", togliChiave: "remove", chiaveAltroDispositivo: "On this device your key is missing: paste it again (the same as before is fine).",
    giaPronto: "Already made for this video", schema: "outline", aspetto: "Still waiting for:", esportatoSenza: (x) => `Done, the file is in your downloads, but without: ${x} (Gemini did not answer in time; try again later and they will be ready).`,
    rispostaGoogle: "Google answered:", lento: "Gemini is slow right now. I keep going: you can close this, the answer will be ready next time you open it.",
    esporta: "Export", esportaSotto: "Choose what to put in the document. What is not ready yet gets made now (it can take half a minute).", preparo: "Preparing…",
    esportato: "Done: the file is in your downloads.", erroreEsporta: "The export did not work: try again.", pdfTipo: "Study sheet", creatoIl: "Created on",
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
    entraT: "SCHOOL è per chi ha la sua Lavagna", entraSotto: "La crei qui con un tocco, poi aggiungi la tua chiave Gemini gratuita e funziona tutto.",
    chiaveT: "La tua chiave Gemini (gratuita)", chiaveSotto: "Gli strumenti di SCHOOL usano Gemini, l'intelligenza artificiale di Google. Ognuno usa la sua chiave: è gratuita e si fa in un minuto.",
    passi: ["Apri <a href=\"https://aistudio.google.com/apikey\" target=\"_blank\" rel=\"noopener\">Google AI Studio ↗</a> ed entra con il tuo account Google.", "Premi «Create API key» (Crea chiave API).", "Se te lo chiede, scegli «Create API key in new project» (in un nuovo progetto).", "Premi «Copy key» (la chiave è una riga lunga che comincia con «AQ.» oppure «AIza») e incollala qui."],
    incollaChiave: "Incolla la tua chiave (AIza… o AQ.…)", salvaChiave: "Salva e continua", verifico: "Controllo la chiave con Google…",
    chiaveNote: "Niente carta di credito: il piano gratuito di Google basta per studiare ogni giorno. La chiave resta solo in questo browser: Lavagna non la conserva, tiene solo un'impronta per controllare che ogni chiave sia usata da una sola persona. Con il piano gratuito Google può usare i testi inviati per migliorare i suoi servizi. Puoi toglierla quando vuoi.",
    errFormato: "Non sembra una chiave: è una riga lunga che comincia con AIza oppure con AQ., senza spazi.", errNonValida: "Google dice che questa chiave non funziona: controlla di averla copiata tutta.",
    errGiaUsata: "Questa chiave è già collegata a un'altra Lavagna: ognuno deve usare la sua.", errQuota: "La tua chiave ha finito le richieste gratuite di oggi: riprova domani.",
    chiaveOk: "Chiave Gemini: pronta", cambiaChiave: "cambia", togliChiave: "togli", chiaveAltroDispositivo: "Su questo dispositivo la tua chiave non c'è: incollala di nuovo (va bene la stessa di prima).",
    giaPronto: "Già fatto per questo video", schema: "schema", aspetto: "Aspetto ancora:", esportatoSenza: (x) => `Fatto, il file è nei tuoi download, ma senza: ${x} (Gemini non ha risposto in tempo; riprova più tardi e saranno pronti).`,
    rispostaGoogle: "Risposta di Google:", lento: "Gemini in questo momento è lento. Vado avanti: puoi anche chiudere, la risposta sarà pronta la prossima volta che lo apri.",
    esporta: "Esporta", esportaSotto: "Scegli cosa mettere nel documento. Quello che non è ancora pronto si prepara adesso (può volerci mezzo minuto).", preparo: "Preparo…",
    esportato: "Fatto: il file è nei tuoi download.", erroreEsporta: "L'export non è riuscito: riprova.", pdfTipo: "Scheda di studio", creatoIl: "Creata il",
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
    yt && ["simili", "⇄"], yt && ["dibattiti", "attualita", "filosofia"].includes(v.cat) && ["contrario", "⚖"], yt && ["esporta", "⤓"], ["studio", "◐"],
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
    // se Gemini è lento lo si dice, invece di far girare la rotellina all'infinito
    if (AI.includes(k)) setTimeout(() => { const w = pannello.querySelector(".bp-attesa"); if (aperto === k && w && !w.dataset.lento) { w.dataset.lento = "1"; w.insertAdjacentHTML("afterend", `<p class="bp-nota">${p("lento")}</p>`); } }, 45000);
    if (k === "tr" || k === "ap") { A.memo.set("schedaStudio", k); const x = A.pannelloVideo(pannello, { id: v.id, titolo: v.titolo, nomeCanale: v.nomeCanale, durata: v.durata }, A.lettore); x.video?.(v); chiudiPannello = () => x.chiudi(); return; }
    return ({ semplice, tre, mappa, domande, tempo: lineaTempo, simili, contrario, esporta })[k]?.();
  };
  // la porta di SCHOOL: prima la propria Lavagna (passkey), poi la propria chiave Gemini per gli strumenti con l'AI
  const CON_AI = [...AI, "esporta"];
  const chiaveQui = () => A.memo.get("chiaveGemini", "");
  const pronta = () => !!(A.io()?.gemini && chiaveQui());
  function porta(k) {
    if (!A.io()) { mostraEntra(k); return false; }
    if (CON_AI.includes(k) && !pronta()) { mostraChiave(k); return false; }
    return true;
  }
  function apriPannello(k) { chiudiPannello(); chiudiPannello = () => {}; aperto = k; pannello.hidden = false; segna(); }
  function mostraEntra(k) {
    apriPannello(k);
    pannello.innerHTML = `<div class="bp-porta"><h3>🔑 ${p("entraT")}</h3><p>${p("entraSotto")}</p><div id="bpConto"></div></div>`;
    A.moduloConto(pannello.querySelector("#bpConto"), async () => { await A.caricaIo(); disegnaStato(); aperto = null; if (porta(k)) apri(k); });
  }
  function mostraChiave(k, avviso = "") {
    apriPannello(k);
    const altrove = A.io()?.gemini && !chiaveQui();
    pannello.innerHTML = `<div class="bp-porta"><h3>✦ ${p("chiaveT")}</h3><p>${p("chiaveSotto")}</p>
      ${altrove || avviso ? `<p class="bp-avviso">${avviso || p("chiaveAltroDispositivo")}</p>` : ""}
      <ol class="bp-passi">${p("passi").map((x) => `<li>${x}</li>`).join("")}</ol>
      <form class="bp-chiave"><input type="password" autocomplete="off" spellcheck="false" placeholder="${p("incollaChiave")}" aria-label="${p("incollaChiave")}" required>
        <button class="bott on">${p("salvaChiave")}</button></form><p class="msg" role="status"></p>
      <p class="bp-nota">${p("chiaveNote")}</p></div>`;
    const f = pannello.querySelector(".bp-chiave"), msg = pannello.querySelector(".msg");
    f.onsubmit = async (e) => {
      e.preventDefault();
      const chiave = f.querySelector("input").value.replace(/\s+/g, "");
      if (!/^[\w.-]{30,200}$/.test(chiave)) { msg.textContent = p("errFormato"); return; }
      msg.textContent = p("verifico"); f.querySelector("button").disabled = true;
      const r = await fetch("/api/conto/gemini", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ chiave }) }).catch(() => null);
      const d = await r?.json().catch(() => ({})) || {};
      f.querySelector("button").disabled = false;
      if (!r?.ok) { msg.textContent = { formato: p("errFormato"), nonValida: p("errNonValida"), giaUsata: p("errGiaUsata") }[d.errore] || p("erroreAI"); return; }
      A.memo.set("chiaveGemini", chiave); if (A.io()) A.io().gemini = true;
      disegnaStato(); aperto = null; apri(k);
    };
  }
  // in alto a destra nel Desk: lo stato della chiave, da cambiare o togliere
  function disegnaStato() {
    const st = dove.querySelector(".banco-stato"); if (!st) return;
    st.innerHTML = pronta() ? `✓ ${p("chiaveOk")} · <button class="link" data-c="cambia">${p("cambiaChiave")}</button> · <button class="link" data-c="togli">${p("togliChiave")}</button>` : "";
  }
  dove.querySelector(".banco-t").insertAdjacentHTML("beforeend", `<span class="banco-stato"></span>`);
  dove.querySelector(".banco-stato").onclick = async (e) => {
    const c = e.target.closest("[data-c]")?.dataset.c; if (!c) return;
    if (c === "cambia") return mostraChiave(aperto && CON_AI.includes(aperto) ? aperto : "semplice");
    await fetch("/api/conto/gemini-togli", { method: "POST" }).catch(() => {});
    A.memo.set("chiaveGemini", ""); if (A.io()) A.io().gemini = false; disegnaStato();
    if (aperto && CON_AI.includes(aperto)) mostraChiave(aperto);
  };
  disegnaStato();
  // ✓ sulle icone degli strumenti già fatti per questo video (nella lingua dell'interfaccia), e su Appunti/Trascrizione se ci sono
  const fatti = new Set();
  const spunta = (k) => { fatti.add(k); const b = dove.querySelector(`.bi[data-k="${k}"]`); if (b && !b.querySelector(".bi-fatto")) b.insertAdjacentHTML("beforeend", `<span class="bi-fatto" title="${p("giaPronto")}" aria-label="${p("giaPronto")}">✓</span>`); };
  if (yt) {
    fetch(`/api/banco/pronti/${v.id}?ui=${A.ui()}`).then((r) => (r.ok ? r.json() : { pronti: [] })).then((x) => (x.pronti || []).forEach(spunta)).catch(() => {});
    A.trascrizione(v.id).then((t) => { if (t?.righe?.length) spunta("tr"); }).catch(() => {});
    A.appuntiDi?.(v.id).then((l) => { if (l?.length) spunta("ap"); }).catch(() => {});
  }
  dove.querySelector(".banco-riga").onclick = (e) => {
    const b = e.target.closest(".bi"); if (!b) return;
    if (b.dataset.k === "studio") return studio(!inStudio());
    if (aperto === b.dataset.k) return apri(b.dataset.k);
    if (porta(b.dataset.k)) apri(b.dataset.k);
  };
  const chiedi = async (cosa) => {
    const r = await fetch(`/api/banco/${cosa}/${v.id}?ui=${A.ui()}`, { headers: { "x-gemini-key": chiaveQui() } }).catch(() => null);
    const d = await r?.json().catch(() => ({})) || {};
    return { ok: !!r?.ok, stato: r?.status || 0, d };
  };
  // una risposta dell'AI: se manca la trascrizione si chiede, se non va si dice perché
  async function daAI(cosa, disegna) {
    const { ok, stato, d } = await chiedi(cosa);
    if (aperto !== cosa && !(cosa === "tempo" && aperto === "tempo")) return;
    if (ok) { spunta(cosa); return disegna(d); }
    if (d.errore === "trascrizione") { const t = await A.trascrizione(v.id); return A.chiediTrascrizione(pannello, v.id, t.fonte, () => { if (aperto === cosa) apri(cosa, true); }); }
    if (stato === 401) return mostraEntra(cosa);
    if (d.errore === "chiave" || d.errore === "nonValida") return mostraChiave(cosa, d.errore === "nonValida" ? p("errNonValida") : "");
    pannello.innerHTML = `<p class="sotto">${d.errore === "quota" ? p("errQuota") : stato === 429 ? p("troppe") : p("erroreAI")}</p>${d.dettaglio ? `<p class="bp-nota">${p("rispostaGoogle")} ${esc(d.dettaglio)}</p>` : ""}`;
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
    if (stato === 401) return mostraEntra("simili");
    if (!ok) { pannello.innerHTML = `<p class="sotto">${stato === 429 ? p("troppe") : p("erroreAI")}</p>`; return; }
    spunta("simili");
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

  // ⤓ esporta: un vero PDF o un vero Word con tutto quello che il Desk sa fare per questo video, più gli appunti
  async function esporta() {
    const E = await import("./esporta.js");
    if (aperto !== "esporta") return;
    const voci = E.PARTI.filter((k) => k !== "contrario" || ICONE.some(([x]) => x === "contrario"));
    const nome = (k) => p({ appunti: "ap", trascrizione: "tr" }[k] || k);
    pannello.innerHTML = `<p>${p("esportaSotto")}</p>
      <div class="bp-scelte">${voci.map((k) => `<label><input type="checkbox" value="${k}" ${k !== "trascrizione" ? "checked" : ""}> ${nome(k)}</label>`).join("")}</div>
      <div class="bp-esporta"><button class="bott on grande" data-f="pdf">⤓ PDF</button><button class="bott grande" data-f="docx">⤓ Word (.docx)</button></div>
      <p class="msg" id="bpEsMsg" role="status"></p>`;
    pannello.querySelector(".bp-esporta").onclick = async (e) => {
      const f = e.target.closest("[data-f]")?.dataset.f; if (!f) return;
      const scelte = [...pannello.querySelectorAll(".bp-scelte input:checked")].map((x) => x.value);
      const msg = pannello.querySelector("#bpEsMsg"), bottoni = pannello.querySelectorAll(".bp-esporta button");
      bottoni.forEach((b) => (b.disabled = true));
      // si vede cosa è pronto e cosa si sta ancora aspettando
      const fatti = [], attesa = new Set(scelte);
      const scrivi = () => { if (msg.isConnected) msg.innerHTML = `<span class="bp-attesa">${p("preparo")}</span>${fatti.length ? ` ✓ ${fatti.join(" · ")}` : ""}${attesa.size ? `<br><small>${p("aspetto")} ${[...attesa].map(nome).join(" · ")}</small>` : ""}`; };
      scrivi();
      try {
        const d = await E.raccogli(v, A, scelte, (k, ok) => { attesa.delete(k); fatti.push(ok ? nome(k) : `✗ ${nome(k)}`); scrivi(); });
        await (f === "pdf" ? E.pdf(d, A, p) : E.word(d, A, p));
        if (msg.isConnected) msg.textContent = d.mancanti?.length ? p("esportatoSenza", d.mancanti.map(nome).join(", ")) : p("esportato");
      } catch (err) { console.error(err); if (msg.isConnected) msg.textContent = p("erroreEsporta"); }
      finally { bottoni.forEach((b) => (b.disabled = false)); }
    };
  }

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
