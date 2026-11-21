// Il montaggio di una lezione, come in un programma video:
// in alto a sinistra i materiali (i video), al centro il monitor, a destra il pezzo scelto o le parole del video,
// sotto la linea del tempo dove i pezzi si trascinano, si accorciano tirando i bordi e si dividono con ✂.
// Il modello resta quello della lezione: l.blocchi in fila (video da–a, titolo, testo, domanda) + l.materiali.

const PAROLE = {
  en: {
    guida: "Like a video editor: pick a video on the left, mark the piece and put it on the timeline (or drag it there). Above the timeline: cuts, titles, texts on video and learning tools — hover a button to see what it does.",
    video: "Videos", appunti: "Notes", altri: "＋ Find more videos", incolla: "Paste a YouTube link", nessunMateriale: "No videos yet: paste a link or «Find more videos».",
    nessunAppunto: "No notes yet: you make them from any video page.",
    nellaLinea: (n) => (n ? `on the timeline ×${n}` : "not used yet"),
    scelto: "Chosen video", lezione: "Lesson", sceltoVuoto: "Choose a video on the left.",
    inizioQui: "[ Start here", fineQui: "End here ]", prova: "▶ Try the piece", metti: "＋ Put on the timeline", tutto: "⤢ The whole video", messo: "Put on the timeline",
    pezzo: "Piece", parole: "Words", nessunoScelto: "Tap a piece on the timeline to change it.",
    tasti: "Space ▶/❚❚ · S cut · Q / W delete before / after the playhead · Del remove · ⌘Z undo · ← → one frame (⇧ one second) · ⌘/ctrl + wheel zoom · I / O start and end of the chosen video",
    scritta: "Caption on the video", scrittaPh: "e.g. Who is speaking, a key word…",
    annulla: "Undo (⌘Z)", rifai: "Redo (⇧⌘Z)", cancPrima: "⇤ Delete before", cancDopo: "Delete after ⇥",
    cancPrimaT: "Delete the part of the piece before the playhead (Q)", cancDopoT: "Delete the part of the piece after the playhead (W)",
    scrittaB: "Aa Text on video", scritte: "Texts on the video", scrittaQui: "＋ Text here", togliScritta: "Remove this text", tornaPezzo: "← The piece",
    stili: { sotto: "Lower third", centro: "Big title", alto: "At the top" }, serveVideo: "Put the playhead on a video first.",
    strumentoB: "＋ Tool…", strumentoT: "Learning tool", proponiQui: "✨ Propose from the lesson videos",
    secondi: "Seconds on screen", duplica: "⧉ Duplicate", dividi: "✂ Cut", togli: "Remove",
    titolo: "T Title", testo: "¶ Text", domanda: "? Question", adatta: "Fit",
    lineaVuota: "The timeline is empty: choose a video on the left, mark the piece and press «＋ Put on the timeline» — or drag the video here.",
    toccaParole: "Tap the sentence where the piece starts, then the one where it ends. The time on the left plays from there.",
    toccaFine: "Now tap where it ends.", pezzoFatto: (a, b) => `Piece: ${a}–${b}`,
    perChi: (x) => `Changing: ${x}`, cercaParole: "Search the words…", nienteQui: "Not found",
    nienteDaVedere: "Nothing to show yet.",
  },
  it: {
    guida: "Come un programma di montaggio: scegli un video a sinistra, segna il pezzo e mettilo nella linea (o trascinalo lì). Sopra la linea: tagli, titoli, scritte sul video e strumenti per studiare — passa sopra a un tasto per sapere cosa fa.",
    video: "Video", appunti: "Appunti", altri: "＋ Cerca altri video", incolla: "Incolla un link di YouTube", nessunMateriale: "Ancora nessun video: incolla un link o «Cerca altri video».",
    nessunAppunto: "Ancora nessun appunto: si fanno dalla pagina di qualunque video.",
    nellaLinea: (n) => (n ? `nella linea ×${n}` : "non ancora usato"),
    scelto: "Video scelto", lezione: "Lezione", sceltoVuoto: "Scegli un video a sinistra.",
    inizioQui: "[ Inizio qui", fineQui: "Fine qui ]", prova: "▶ Prova il pezzo", metti: "＋ Metti nella linea", tutto: "⤢ Tutto il video", messo: "Messo nella linea",
    pezzo: "Pezzo", parole: "Parole", nessunoScelto: "Tocca un pezzo nella linea del tempo per cambiarlo.",
    tasti: "Spazio ▶/❚❚ · S taglia · Q / W cancella prima / dopo la testina · Canc toglie · ⌘Z annulla · ← → un fotogramma (⇧ un secondo) · ⌘/ctrl + rotella zoom · I / O inizio e fine del video scelto",
    scritta: "Scritta sul video", scrittaPh: "es. chi parla, una parola chiave…",
    annulla: "Annulla (⌘Z)", rifai: "Rifai (⇧⌘Z)", cancPrima: "⇤ Cancella prima", cancDopo: "Cancella dopo ⇥",
    cancPrimaT: "Cancella la parte del pezzo prima della testina (Q)", cancDopoT: "Cancella la parte del pezzo dopo la testina (W)",
    scrittaB: "Aa Scritta sul video", scritte: "Scritte sul video", scrittaQui: "＋ Scritta qui", togliScritta: "Togli questa scritta", tornaPezzo: "← Il pezzo",
    stili: { sotto: "Sottopancia", centro: "Titolo grande", alto: "In alto" }, serveVideo: "Prima metti la testina su un video.",
    strumentoB: "＋ Strumento…", strumentoT: "Strumento per studiare", proponiQui: "✨ Proponi dai video della lezione",
    secondi: "Secondi sullo schermo", duplica: "⧉ Duplica", dividi: "✂ Taglia", togli: "Togli",
    titolo: "T Titolo", testo: "¶ Testo", domanda: "? Domanda", adatta: "Adatta",
    lineaVuota: "La linea è vuota: scegli un video a sinistra, segna il pezzo e premi «＋ Metti nella linea», oppure trascina qui il video.",
    toccaParole: "Tocca la frase dove comincia il pezzo, poi quella dove finisce. Il minuto a sinistra fa partire il video da lì.",
    toccaFine: "Ora tocca dove finisce.", pezzoFatto: (a, b) => `Pezzo: ${a}–${b}`,
    perChi: (x) => `Stai cambiando: ${x}`, cercaParole: "Cerca nelle parole…", nienteQui: "Non c'è",
    nienteDaVedere: "Ancora niente da vedere.",
  },
};
const SEC = { titolo: 4, testo: 8, domanda: 10, strumento: 20 };
const FPS = 30; // fotogrammi al secondo di riferimento (YouTube: quasi sempre 24–30)
const fr = (x) => Math.round(x * FPS) / FPS;

export async function passoMonta(box, l, salvaPresto, titoloPasso, H) {
  const { C, esc, s, tempo, secondi, nuovoId, estrattoDa, trascrizione, fotogramma, chiediTrascrizione, Q, idDaLink, htmlStrumento, ws, STRUMENTI, materialeDi } = H;
  const m = (k, ...a) => { const v = PAROLE[C.ui()]?.[k] ?? PAROLE.en[k]; return typeof v === "function" ? v(...a) : v; };
  const $ = (q) => box.querySelector(q);
  const tc = (x) => { const f = Math.round(((Number(x) || 0) % 1) * FPS) % FPS; return zoom >= 40 ? `${tempo(x)} · ${f}f` : tempo(x); };
  // tempo con i decimali (per i campi Da/A): 1:23.40 = 1 minuto, 23 secondi e 4 decimi
  const tempoD = (x) => { x = Number(x) || 0; const c = Math.floor((x % 1) * 100 + 1e-6); return c ? `${tempo(x)}.${String(c).padStart(2, "0")}` : tempo(x); };
  const tipoNome = (t, b) => (t === "strumento" ? ws(b?.k || "mappa") : s({ titolo: "tTitolo", testo: "tTesto", domanda: "tDomanda", video: "tVideo" }[t]));

  // ——— i materiali: tutti i video passati per la lezione restano qui anche se tolti dalla linea ———
  l.materiali ||= [];
  const materiale = (id) => l.materiali.find((x) => x.video === id);
  for (const b of l.blocchi) if (b.tipo === "video" && b.video && !materiale(b.video)) l.materiali.push({ video: b.video, titolo: b.titoloVideo || b.video, nomeCanale: b.nomeCanale || "", durata: b.durata || 0 });
  l.materiali.filter((x) => !x.titolo || x.titolo === x.video).forEach((x) => fetch(`/api/video/${x.video}`).then((r) => r.json()).then((i) => {
    if (!i.titolo) return;
    Object.assign(x, { titolo: i.titolo, nomeCanale: i.nomeCanale || "", durata: x.durata || i.durata || 0 });
    l.blocchi.filter((b) => b.video === x.video).forEach((b) => Object.assign(b, { titoloVideo: x.titolo, nomeCanale: x.nomeCanale, durata: b.durata || x.durata }));
    if (!chiuso) { disegnaMateriali(); disegnaLinea(); }
  }).catch(() => {}));
  const appunti = await Q.appunti();
  // gli strumenti scritti nel vecchio passo a parte entrano in fondo alla linea
  for (const k of STRUMENTI) if (l.strumenti?.[k]?.trim() && !l.blocchi.some((b) => b.tipo === "strumento" && b.k === k)) l.blocchi.push({ id: nuovoId(), tipo: "strumento", k, testo: l.strumenti[k], sec: SEC.strumento });
  if (l.strumenti && Object.keys(l.strumenti).length) { l.strumenti = {}; salvaPresto(); }
  // la vecchia scritta unica diventa la prima della traccia delle scritte
  for (const b of l.blocchi) if (b.tipo === "video" && b.scritta && !b.scritte) { b.scritte = [{ id: nuovoId(), testo: b.scritta, da: b.da, a: b.a, stile: "sotto" }]; delete b.scritta; }

  // ——— annulla / ripeti: una fotografia dei blocchi prima di ogni cambiamento (l'estratto si ricalcola da solo) ———
  const fotografia = () => JSON.stringify(l.blocchi, (k, v) => (k === "estratto" ? undefined : v));
  let ultimaFoto = fotografia(), ultimoT = 0;
  const indietro = [], avanti = [];
  const salvaDavvero = salvaPresto;
  salvaPresto = (...a) => {
    const ora = fotografia();
    if (ora !== ultimaFoto) {
      if (Date.now() - ultimoT > 600 || !indietro.length) { indietro.push(ultimaFoto); if (indietro.length > 300) indietro.shift(); }
      avanti.length = 0; ultimaFoto = ora; ultimoT = Date.now();
    }
    salvaDavvero(...a); disegnaStoria();
  };
  function disegnaStoria() {
    const u = box.querySelector("[data-f=annulla]"), r = box.querySelector("[data-f=rifai]");
    if (u) u.disabled = !indietro.length; if (r) r.disabled = !avanti.length;
  }
  function annulla(rifai = false) {
    const da = rifai ? avanti : indietro, verso = rifai ? indietro : avanti;
    if (!da.length) return;
    verso.push(fotografia());
    const f = da.pop(), estratti = new Map(l.blocchi.map((b) => [b.id, b.estratto]));
    l.blocchi = JSON.parse(f);
    l.blocchi.forEach((b) => { if (b.tipo === "video") { b.estratto = estratti.get(b.id) || ""; if (!b.estratto) aggiornaEstratto(b); } });
    ultimaFoto = f; ultimoT = 0; salvaDavvero(); disegnaStoria();
    if (!l.blocchi.some((b) => b.id === sel)) sel = null;
    selS = null;
    disegnaLinea(); disegnaLato(); disegnaMateriali(); vaiLezione(Math.min(testina, totale()), false);
  }

  // ——— tempi della linea ———
  const durB = (b) => (b.tipo === "video" ? Math.max(0.5, (Number(b.a) || 0) - (Number(b.da) || 0)) : Math.max(1, Number(b.sec) || SEC[b.tipo] || 5));
  const inizi = () => { let t = 0; return l.blocchi.map((b) => { const x = t; t += durB(b); return x; }); };
  const totale = () => l.blocchi.reduce((n, b) => n + durB(b), 0);
  const bloccoA = (t) => { const st = inizi(); for (let i = l.blocchi.length - 1; i >= 0; i--) if (t >= st[i] - 1e-6) return i; return 0; };
  const conta = (id) => l.blocchi.filter((b) => b.video === id).length;

  let chiuso = false, selS = null, sel = null, testina = 0, zoom = 0, modo = "lezione", sorgente = null, lato = "pezzo", schedaMat = "video";
  let player = null, pronto = false, caricato = "", suona = false, corrente = -1, attesa = 0, ultimo = performance.now(), provaFine = false;

  box.innerHTML = titoloPasso(m("guida")) + `<div class="mt">
    <aside class="mt-mat"><div class="mt-schede" id="mtSchedeMat"></div><div class="mt-lista" id="mtLista"></div>
      <form class="mt-link" id="mtLink"><input placeholder="${m("incolla")}" aria-label="${m("incolla")}"><button class="bott piccolo">＋</button></form>
      <a class="link mt-altri" href="#/lezione/${l.id}/video">${m("altri")}</a></aside>
    <div class="mt-centro">
      <div class="mt-schede mt-modi" id="mtModi"><button data-modo="sorgente">${m("scelto")}</button><button data-modo="lezione">${m("lezione")}</button></div>
      <div class="mo"><div class="mo-lettore"><div id="moLettore"></div></div>
        <img class="mo-anteprima" id="moAnteprima" alt="" hidden><div class="mo-carta" id="moCarta" hidden></div>
        <div class="mo-scritte" id="moScritte"></div><div class="mo-vuoto" id="moVuoto" hidden></div><button class="mo-velo" id="moVelo" aria-label="▶/❚❚"></button></div>
      <div id="mtSotto"></div></div>
    <aside class="mt-lato"><div class="mt-schede" id="mtSchedeLato"></div><div id="mtLato"></div></aside>
    <div class="tl">
      <div class="tl-barra"><button class="bott piccolo on" id="tlPlay" aria-label="▶">▶</button><span class="tl-ora" id="tlOra">0:00 / 0:00</span>
        <span class="tl-sep"></span><button class="bott piccolo" data-f="annulla" title="${m("annulla")}" aria-label="${m("annulla")}" disabled>↶</button><button class="bott piccolo" data-f="rifai" title="${m("rifai")}" aria-label="${m("rifai")}" disabled>↷</button>
        <span class="tl-sep"></span><button class="bott piccolo icona" data-f="dividi" title="${m("dividi")} (S)" aria-label="${m("dividi")}">✂</button><button class="bott piccolo icona" data-f="prima" title="${m("cancPrimaT")}" aria-label="${m("cancPrimaT")}">⇤</button><button class="bott piccolo icona" data-f="dopo" title="${m("cancDopoT")}" aria-label="${m("cancDopoT")}">⇥</button><button class="bott piccolo icona" data-f="togli" title="${m("togli")} (Canc)" aria-label="${m("togli")}">🗑</button><button class="bott piccolo icona" data-f="duplica" title="${m("duplica")}" aria-label="${m("duplica")}">⧉</button>
        <span class="tl-sep"></span><button class="bott piccolo" data-f="titolo">${m("titolo")}</button><button class="bott piccolo" data-f="testo">${m("testo")}</button><button class="bott piccolo" data-f="domanda">${m("domanda")}</button><button class="bott piccolo" data-f="scritta">${m("scrittaB")}</button><select class="tl-strumento" id="tlStrumento" aria-label="${m("strumentoT")}"><option value="">${m("strumentoB")}</option>${STRUMENTI.map((k) => `<option value="${k}">${ws(k)}</option>`).join("")}</select>
        <span class="tl-zoom"><button class="bott piccolo" data-f="meno" aria-label="−">−</button><input type="range" id="tlZoom" min="0" max="100" step="1" aria-label="zoom"><button class="bott piccolo" data-f="adatta">${m("adatta")}</button><button class="bott piccolo" data-f="piu" aria-label="+">+</button></span></div>
      <div class="tl-scorri" id="tlScorri"><div class="tl-dentro" id="tlDentro"></div></div>
      <p class="tl-tasti">${m("tasti")}</p></div></div>`;
  box.closest(".guidata")?.classList.add("largo");
  const scorri = $("#tlScorri"), dentro = $("#tlDentro");

  // ——— materiali ———
  function disegnaMateriali() {
    $("#mtSchedeMat").innerHTML = [["video", m("video"), l.materiali.length], ["appunti", m("appunti"), appunti.length]]
      .map(([k, n, c]) => `<button data-k="${k}" class="${schedaMat === k ? "on" : ""}">${n} <small>${c}</small></button>`).join("");
    const voci = schedaMat === "video"
      ? l.materiali.map((x, i) => ({ i, video: x.video, titolo: x.titolo, sotto: `${x.durata ? tempo(x.durata) + " · " : ""}${m("nellaLinea", conta(x.video))}` }))
      : appunti.map((p, i) => ({ i, video: p.video, titolo: p.testo || p.titoloVideo, sotto: `${tempo(p.da)}–${tempo(p.a || p.da + 30)} · ${p.titoloVideo || ""}` }));
    $("#mtLista").innerHTML = voci.length ? voci.map((v) => `<div class="mt-voce${sorgente?.video === v.video && modo === "sorgente" ? " on" : ""}" draggable="true" data-i="${v.i}" tabindex="0">
        <img src="https://i.ytimg.com/vi/${v.video}/mqdefault.jpg" alt="" draggable="false"><span><strong>${esc(v.titolo || v.video)}</strong><small>${esc(v.sotto)}</small></span></div>`).join("")
      : `<p class="sotto">${m(schedaMat === "video" ? "nessunMateriale" : "nessunAppunto")}</p>`;
  }
  const daVoce = (i) => {
    if (schedaMat === "video") { const x = l.materiali[i]; return { video: x.video, titolo: x.titolo, nomeCanale: x.nomeCanale, durata: x.durata }; }
    const p = appunti[i];
    return { video: p.video, titolo: p.titoloVideo || p.video, nomeCanale: p.nomeCanale || "", durata: p.durata || 0, da: p.da, a: p.a || p.da + 30, commento: p.testo || "", estratto: p.estratto || "" };
  };
  $("#mtSchedeMat").onclick = (e) => { const b = e.target.closest("[data-k]"); if (b) { schedaMat = b.dataset.k; disegnaMateriali(); } };
  $("#mtLista").onclick = (e) => { const v = e.target.closest(".mt-voce"); if (v) apriSorgente(daVoce(Number(v.dataset.i))); };
  $("#mtLista").onkeydown = (e) => { if (e.key === "Enter") e.target.closest(".mt-voce")?.click(); };
  let trascinato = null;
  $("#mtLista").ondragstart = (e) => { const v = e.target.closest(".mt-voce"); if (!v) return; trascinato = daVoce(Number(v.dataset.i)); if (schedaMat === "video" && trascinato.durata) Object.assign(trascinato, { da: 0, a: trascinato.durata }); e.dataTransfer.setData("text/plain", trascinato.video); e.dataTransfer.effectAllowed = "copy"; };
  $("#mtLista").ondragend = () => { trascinato = null; segnaInserimento(null); };
  $("#mtLink").onsubmit = async (e) => {
    e.preventDefault();
    const inp = e.target.querySelector("input"), x = idDaLink(inp.value);
    if (!x) { C.avvisa(s("videoNonValido")); return; }
    inp.value = "";
    let mat = materiale(x.id);
    if (!mat) {
      const i = await fetch(`/api/video/${x.id}`).then((r) => r.json()).catch(() => ({}));
      mat = { video: x.id, titolo: i.titolo || x.id, nomeCanale: i.nomeCanale || "", durata: i.durata || 0 };
      l.materiali.push(mat); salvaPresto();
    }
    schedaMat = "video"; disegnaMateriali();
    apriSorgente({ ...mat, da: x.da || 0 });
  };

  // ——— il lettore ———
  const fermaLettore = () => { try { player?.pauseVideo(); } catch {} };
  function carica(id, sec, play) {
    if (!pronto) return;
    if (caricato !== id) { caricato = id; (play ? player.loadVideoById : player.cueVideoById).call(player, { videoId: id, startSeconds: sec }); }
    else { player.seekTo(sec, true); if (play) player.playVideo(); else setTimeout(() => { if (!suona && !provaFine) fermaLettore(); }, 250); }
    attesa = Date.now() + 450;
  }
  (async () => {
    try { await C.caricaScript("https://www.youtube.com/iframe_api", "onYouTubeIframeAPIReady"); } catch { return; }
    if (chiuso) return;
    player = new YT.Player($("#moLettore"), {
      host: "https://www.youtube-nocookie.com",
      playerVars: { rel: 0, playsinline: 1, iv_load_policy: 3, controls: 0, disablekb: 1, modestbranding: 1, cc_load_policy: 0 },
      events: {
        // niente sottotitoli di YouTube nel montaggio: coprirebbero le scritte
        onApiChange: () => { try { player.unloadModule("captions"); player.unloadModule("cc"); } catch {} },
        onReady: () => { pronto = true; if (modo === "sorgente" && sorgente) carica(sorgente.video, sorgente.da, false); else vaiLezione(testina, false); } },
    });
  })();

  // ——— monitor ———
  function disegnaModi() {
    $("#mtModi").querySelectorAll("[data-modo]").forEach((b) => b.classList.toggle("on", b.dataset.modo === modo));
    box.querySelector(".mt").dataset.modo = modo;
  }
  $("#mtModi").onclick = (e) => {
    const b = e.target.closest("[data-modo]"); if (!b) return;
    if (b.dataset.modo === "sorgente") { if (sorgente) apriSorgente(sorgente, sorgente.da, sorgente.a); else { modo = "sorgente"; suona = false; fermaLettore(); disegnaModi(); mostraMonitor(); disegnaSotto(); disegnaLato(); } }
    else vaiLezione(testina, false);
  };
  function mostraMonitor() {
    const carta = $("#moCarta"), vuoto = $("#moVuoto");
    carta.hidden = true; vuoto.hidden = true; mostraScritte();
    if (modo === "sorgente") { if (!sorgente) { vuoto.hidden = false; vuoto.textContent = m("sceltoVuoto"); } return; }
    const b = l.blocchi[corrente];
    if (!b) { vuoto.hidden = false; vuoto.textContent = m("nienteDaVedere"); return; }
    if (b.tipo !== "video") {
      carta.hidden = false; carta.className = `mo-carta mo-${b.tipo}`;
      carta.innerHTML = b.tipo === "strumento" ? `<p class="pr-tipo">${ws(b.k)}</p><div class="mo-st">${htmlStrumento(b.k, b.testo, l.titolo) || `<p class="sotto">${esc(ws(b.k + "Es")).replace(/\n/g, "<br>")}</p>`}</div>` : b.tipo === "domanda" ? `<p class="pr-tipo">${s("tDomanda")}</p><p>${esc(b.testo || "…")}</p>` : `<p>${esc(b.testo || "…")}</p>`;
    }
  }
  // le scritte che a questo punto della lezione stanno sopra il video
  function mostraScritte() {
    const c = $("#moScritte"); if (!c) return;
    let h = "";
    const b = l.blocchi[corrente];
    if (modo === "lezione" && b?.tipo === "video" && b.scritte?.length) {
      const t = b.da + (testina - inizi()[corrente]);
      h = b.scritte.filter((o) => t >= o.da - 0.001 && t < o.a).map((o) => `<p class="mo-s mo-s-${o.stile || "sotto"}">${esc(o.testo || "…")}</p>`).join("");
    }
    if (c.dataset.h !== h) { c.innerHTML = h; c.dataset.h = h; }
  }
  // scorrendo, il lettore va sul fotogramma vero (fermo); la miniatura solo finché il video non è pronto
  let ultimoScorri = 0, scorriTimer = null;
  function scorriA(id, sec) {
    if (!pronto || !id) { anteprima(id, sec); return; }
    if (caricato !== id) { anteprima(id, sec); caricato = id; player.cueVideoById({ videoId: id, startSeconds: sec }); return; }
    const fai = () => {
      ultimoScorri = Date.now(); scorriTimer = null;
      player.seekTo(sec, false);
      if (player.getPlayerState() !== 2) setTimeout(() => { if (!suona && !provaFine) fermaLettore(); }, 120);
      setTimeout(() => anteprima(null), 200);
    };
    clearTimeout(scorriTimer);
    if (Date.now() - ultimoScorri > 90) fai(); else scorriTimer = setTimeout(fai, 90);
  }
  function vaiLezione(t, play) {
    if (modo !== "lezione") { modo = "lezione"; disegnaModi(); disegnaSotto(); disegnaLato(); disegnaMateriali(); }
    provaFine = false;
    const tot = totale();
    testina = Math.max(0, Math.min(t, tot));
    corrente = l.blocchi.length ? bloccoA(testina) : -1;
    const b = l.blocchi[corrente];
    suona = !!(play && b);
    if (b?.tipo === "video") carica(b.video, b.da + (testina - inizi()[corrente]), suona);
    else fermaLettore();
    mostraMonitor(); posTestina(); orologio();
  }
  function playPausa() {
    if (modo === "sorgente") {
      if (!pronto || !sorgente) return;
      provaFine = false;
      player.getPlayerState() === 1 ? player.pauseVideo() : player.playVideo();
      return;
    }
    if (suona) { suona = false; fermaLettore(); orologio(); return; }
    vaiLezione(testina >= totale() - 0.05 ? 0 : testina, true);
  }
  $("#moVelo").onclick = playPausa;
  $("#tlPlay").onclick = () => { if (modo === "sorgente") vaiLezione(testina, true); else playPausa(); };
  function avanza() {
    const st = inizi();
    if (corrente + 1 < l.blocchi.length) vaiLezione(st[corrente + 1] + 0.001, true);
    else { suona = false; fermaLettore(); testina = totale(); orologio(); posTestina(); }
  }
  const giro = setInterval(() => {
    const ora = performance.now(), dt = (ora - ultimo) / 1000; ultimo = ora;
    if (chiuso) return;
    if (modo === "sorgente") {
      if (!pronto || !sorgente || Date.now() < attesa) return;
      const t = player.getCurrentTime?.() || 0;
      if (provaFine && t >= sorgente.a) { provaFine = false; fermaLettore(); }
      const o = $("#soOra"); if (o) { o.style.left = `${(100 * t) / durataSorgente()}%`; }
      const n = $("#soAdesso"); if (n) n.textContent = tempo(t);
      if (!sorgente.durata && player.getDuration?.() > 0) { sorgente.durata = player.getDuration(); const x = materiale(sorgente.video); if (x && !x.durata) { x.durata = sorgente.durata; salvaPresto(); } disegnaSorgente(); }
      return;
    }
    if (!suona) return;
    const b = l.blocchi[corrente];
    if (!b) { suona = false; orologio(); return; }
    const st = inizi()[corrente];
    if (b.tipo === "video") {
      if (!pronto || Date.now() < attesa) return;
      const stato = player.getPlayerState(), t = player.getCurrentTime() || 0;
      if (stato === 1) testina = st + Math.max(0, t - b.da);
      if (t >= b.a - 0.1 || stato === 0) return avanza();
    } else {
      testina += dt;
      if (testina >= st + durB(b)) return avanza();
    }
    posTestina(); orologio();
  }, 80);
  function orologio() {
    $("#tlOra").textContent = `${tc(testina)} / ${tempo(totale())}`;
    const p = $("#tlPlay"); p.textContent = suona && modo === "lezione" ? "❚❚" : "▶";
  }

  // ——— sotto il monitor: il video scelto (inizio, fine, metti nella linea) oppure niente ———
  const durataSorgente = () => Math.max(1, sorgente?.durata || player?.getDuration?.() || sorgente?.a || 60);
  function apriSorgente(x, da = x.da, a = x.a) {
    suona = false; modo = "sorgente"; provaFine = false;
    const d = Number(x.durata) || 0;
    da = Number.isFinite(da) ? da : 0;
    a = Number.isFinite(a) && a > da ? a : d ? Math.min(d, da + 60) : da + 60;
    sorgente = { ...x, da, a };
    if (!materiale(x.video)) { l.materiali.push({ video: x.video, titolo: x.titolo || x.video, nomeCanale: x.nomeCanale || "", durata: d }); salvaPresto(); }
    lato = "parole";
    carica(x.video, da, false);
    disegnaModi(); mostraMonitor(); disegnaSotto(); disegnaLato(); disegnaMateriali(); orologio();
  }
  function disegnaSotto() {
    const sotto = $("#mtSotto");
    if (modo !== "sorgente" || !sorgente) { sotto.innerHTML = ""; return; }
    sotto.innerHTML = `<div class="so"><p class="so-nome"><strong>${esc(sorgente.titolo || sorgente.video)}</strong> <small>${esc(sorgente.nomeCanale || "")}</small> <span class="so-adesso" id="soAdesso"></span></p>
      <div class="so-pista" id="soPista"><div class="so-film" id="soFilm"></div><div class="so-pezzo" id="soPezzo"><i class="so-h" data-h="da"></i><i class="so-h" data-h="a"></i></div><div class="so-ora" id="soOra"></div></div>
      <div class="so-tasti"><button class="bott piccolo" data-so="da">${m("inizioQui")}</button><span class="so-tempi" id="soTempi"></span><button class="bott piccolo" data-so="a">${m("fineQui")}</button>
        <button class="bott piccolo" data-so="prova">${m("prova")}</button><button class="bott piccolo" data-so="tutto">${m("tutto")}</button><button class="bott on" data-so="metti">${m("metti")}</button></div></div>`;
    disegnaSorgente();
    const film = $("#soFilm"), n = 10, d = durataSorgente();
    film.innerHTML = Array.from({ length: n }, () => `<img alt="">`).join("");
    [...film.children].forEach((img, k) => miniatura(sorgente.video, ((k + 0.5) * d) / n, sorgente.durata).then((src) => { if (src) img.src = src; }));
    sotto.querySelector(".so-tasti").onclick = (e) => {
      const k = e.target.closest("[data-so]")?.dataset.so; if (!k) return;
      if (k === "da" || k === "a") return segnaSorgente(k, player?.getCurrentTime?.() || 0);
      if (k === "prova") { if (!pronto) return; provaFine = true; carica(sorgente.video, sorgente.da, true); return; }
      if (k === "metti") metti();
      if (k === "tutto") metti(dopoScelto(), { ...sorgente, da: 0, a: durataSorgente() });
    };
    // la pista: un tocco porta il video lì, i due manici spostano inizio e fine
    const pista = $("#soPista");
    pista.onpointerdown = (e) => {
      const r = pista.getBoundingClientRect(), d = durataSorgente();
      const t = (x) => Math.max(0, Math.min(d, ((x - r.left) / r.width) * d));
      const h = e.target.closest("[data-h]")?.dataset.h;
      pista.setPointerCapture(e.pointerId);
      if (!h) { carica(sorgente.video, t(e.clientX), player?.getPlayerState?.() === 1); }
      pista.onpointermove = (ev) => { if (h) segnaSorgente(h, t(ev.clientX), true); else scorriA(sorgente.video, t(ev.clientX)); };
      pista.onpointerup = (ev) => { pista.onpointermove = pista.onpointerup = null; anteprima(null); if (h) segnaSorgente(h, t(ev.clientX)); else carica(sorgente.video, t(ev.clientX), player?.getPlayerState?.() === 1); };
    };
  }
  function disegnaSorgente() {
    if (!sorgente || !$("#soPezzo")) return;
    const d = durataSorgente();
    $("#soPezzo").style.left = `${(100 * sorgente.da) / d}%`;
    $("#soPezzo").style.width = `${(100 * Math.max(0.5, sorgente.a - sorgente.da)) / d}%`;
    $("#soTempi").textContent = `${tempo(sorgente.da)} – ${tempo(sorgente.a)} · ${tempo(sorgente.a - sorgente.da)}`;
  }
  function segnaSorgente(k, t, trascinando = false) {
    if (!sorgente) return;
    t = fr(t);
    if (k === "da") { sorgente.da = Math.max(0, t); if (sorgente.a <= sorgente.da) sorgente.a = Math.min(durataSorgente(), sorgente.da + 30); }
    else { sorgente.a = Math.min(durataSorgente(), Math.max(1, t)); if (sorgente.a <= sorgente.da) sorgente.da = Math.max(0, sorgente.a - 30); }
    disegnaSorgente();
    if (trascinando) scorriA(sorgente.video, t); else if (lato === "parole") segnaParole();
  }
  function nuovoBloccoVideo(x) {
    const d = Number(x.durata) || 0;
    const da = Number.isFinite(x.da) ? x.da : 0;
    const a = Number.isFinite(x.a) && x.a > da ? x.a : d ? Math.min(d, da + 60) : da + 60;
    const b = { id: nuovoId(), tipo: "video", video: x.video, titoloVideo: x.titolo || x.video, nomeCanale: x.nomeCanale || "", durata: d, da, a, commento: x.commento || "", estratto: x.estratto || "", mostraTesto: false };
    if (!b.estratto) trascrizione(b.video).then((t) => { if (t.righe?.length) { b.estratto = estrattoDa(t.righe, b.da, b.a); salvaPresto(); if (sel === b.id && !chiuso) disegnaLato(); } });
    return b;
  }
  const dopoScelto = () => { const i = l.blocchi.findIndex((b) => b.id === sel); return i >= 0 ? i + 1 : l.blocchi.length; };
  function metti(pos = dopoScelto(), x = sorgente) {
    if (!x) return;
    const b = nuovoBloccoVideo(x);
    l.blocchi.splice(pos, 0, b);
    sel = b.id; testina = inizi()[pos];
    salvaPresto(); disegnaLinea(); disegnaMateriali(); scopri(b.id);
    if (modo === "lezione") vaiLezione(testina, false); else disegnaLato();
    C.avvisa(`${m("messo")} · ${tempo(b.da)}–${tempo(b.a)}`);
  }

  // ——— miniature (dal foglio di fotogrammi di YouTube) ———
  const minis = new Map();
  function miniatura(id, sec, durata) {
    const k = `${id}@${Math.round(sec / 2) * 2}`;
    if (!minis.has(k)) minis.set(k, fotogramma(id, sec, durata).then((f) => f?.src || "").catch(() => ""));
    return minis.get(k);
  }
  let ultimaAnteprima = 0;
  function anteprima(id, sec) {
    const img = $("#moAnteprima");
    if (!id) { img.hidden = true; return; }
    const n = ++ultimaAnteprima;
    const d = id === sorgente?.video ? sorgente.durata : materiale(id)?.durata;
    miniatura(id, sec, d).then((src) => { if (n === ultimaAnteprima && src) { img.src = src; img.hidden = false; } });
  }

  // ——— la linea del tempo ———
  // il righello va dalle ore al singolo fotogramma; si disegna solo la parte che si vede
  const PASSI_R = [1 / FPS, 2 / FPS, 5 / FPS, 10 / FPS, 15 / FPS, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1200, 1800, 3600];
  const passoRighello = () => PASSI_R.find((p) => p * zoom >= 56) || 3600;
  const zoomMax = () => Math.min(FPS * 60, 8e6 / Math.max(1, totale() + 15));
  const ZMIN = 0.05;
  function adatta() { const tot = Math.max(30, totale()); zoom = Math.max(ZMIN, Math.min(40, (scorri.clientWidth - 40) / tot)); }
  function disegnaLinea() {
    if (!zoom) adatta();
    zoom = Math.min(zoom, zoomMax());
    const st = inizi(), tot = totale(), larg = Math.max(scorri.clientWidth - 2, (tot + 15) * zoom);
    dentro.style.width = `${larg}px`;
    const clip = l.blocchi.map((b, i) => {
      const nome = b.tipo === "video" ? `${esc(b.titoloVideo || b.video)} · ${tempo(b.da)}–${tempo(b.a)}` : b.tipo === "strumento" ? `${tipoNome(b.tipo, b)}` : `${tipoNome(b.tipo)}: ${esc(b.testo || "…")}`;
      return `<div class="cl cl-${b.tipo}${b.id === sel ? " sel" : ""}" data-id="${b.id}" data-i="${i}" title="${nome}">
        ${b.tipo === "video" ? `<div class="cl-film"></div>` : ""}<span class="cl-nome">${nome}</span><i class="cl-bordo sx" data-b="sx"></i><i class="cl-bordo dx" data-b="dx"></i></div>`;
    }).join("");
    const scritte = htmlScritte();
    dentro.innerHTML = `<div class="tl-righello"></div><div class="tl-traccia tl-scritte">${scritte}</div>
      <div class="tl-traccia tl-video">${clip}${l.blocchi.length ? "" : `<p class="tl-vuota">${m("lineaVuota")}</p>`}</div>
      <div class="tl-traccia tl-parole" title="${m("parole")}"></div>
      <div class="tl-ins" id="tlIns" hidden></div><div class="tl-testina" id="tlTestina"><b></b></div>`;
    posiziona(st);
    posTestina(); orologio(); disegnaZoom();
  }
  const htmlScritte = () => l.blocchi.flatMap((b) => (b.tipo === "video" ? b.scritte || [] : []).map((o) => `<div class="cs cs-${o.stile || "sotto"}${o.id === selS ? " sel" : ""}" data-o="${o.id}" data-bid="${b.id}" title="${esc(o.testo || "")}"><span>${esc(o.testo || "…")}</span><i class="cl-bordo sx" data-b="sx"></i><i class="cl-bordo dx" data-b="dx"></i></div>`)).join("");
  function posiziona(st = inizi()) {
    l.blocchi.forEach((b, i) => {
      const x = st[i] * zoom, wd = Math.max(4, durB(b) * zoom - 2);
      dentro.querySelectorAll(`.cl[data-id="${b.id}"]`).forEach((el) => { el.style.left = `${x}px`; el.style.width = `${wd}px`; });
    });
    dentro.querySelectorAll(".cs").forEach((el) => {
      const i = l.blocchi.findIndex((b) => b.id === el.dataset.bid), b = l.blocchi[i], o = b?.scritte?.find((x) => x.id === el.dataset.o);
      if (!o) return;
      const a = Math.max(o.da, b.da), z = Math.min(o.a, b.a);
      el.hidden = z <= a;
      el.style.left = `${(st[i] + a - b.da) * zoom}px`; el.style.width = `${Math.max(6, (z - a) * zoom - 1)}px`;
    });
    visibile();
  }
  let rafVis = 0;
  const visibile = () => { if (!rafVis) rafVis = requestAnimationFrame(() => { rafVis = 0; if (!chiuso) disegnaVisibile(); }); };
  scorri.addEventListener("scroll", visibile, { passive: true });
  const paroleCache = new Map();
  function disegnaVisibile() {
    const x0 = scorri.scrollLeft - 150, x1 = scorri.scrollLeft + scorri.clientWidth + 150, st = inizi();
    // righello
    const p = passoRighello();
    let tacche = "";
    for (let k = Math.max(0, Math.floor(x0 / zoom / p)); k * p * zoom < x1; k++) {
      const t = k * p, sec = Math.round(t * FPS) / FPS, f = Math.round((sec % 1) * FPS);
      tacche += `<span class="${f ? "fr" : ""}" style="left:${t * zoom}px">${f ? `${f}f` : tempo(sec)}</span>`;
    }
    const r = dentro.querySelector(".tl-righello"); if (r) r.innerHTML = tacche;
    // miniature dentro i pezzi: una ogni 90 px, solo dove si vede
    dentro.querySelectorAll(".cl-video").forEach((el) => {
      const i = Number(el.dataset.i), b = l.blocchi[i], f = el.querySelector(".cl-film"); if (!b || !f) return;
      const L = st[i] * zoom, W = durB(b) * zoom, a = Math.max(0, x0 - L), z = Math.min(W, x1 - L);
      if (z <= a) { f.innerHTML = ""; f.dataset.k = ""; return; }
      const P = 90, k0 = Math.floor(a / P), k1 = Math.ceil(z / P), chiave = `${zoom}|${b.da}|${k0}|${k1}`;
      if (f.dataset.k === chiave) return;
      f.dataset.k = chiave;
      let h = "";
      for (let k = k0; k < k1; k++) h += `<img style="left:${k * P}px;width:${P}px" data-t="${b.da + (k * P + P / 2) / zoom}" alt="">`;
      f.innerHTML = h;
      f.querySelectorAll("img").forEach((img) => miniatura(b.video, Number(img.dataset.t), b.durata).then((src) => { if (src) img.src = src; }));
    });
    // le parole dette, allineate al tempo di ogni pezzo
    let h = "";
    l.blocchi.forEach((b, i) => {
      if (b.tipo !== "video") return;
      const L = st[i] * zoom;
      if (L > x1 || L + durB(b) * zoom < x0) return;
      const righe = paroleCache.get(b.video);
      if (righe === undefined) { paroleCache.set(b.video, null); trascrizione(b.video).then((d) => { paroleCache.set(b.video, d.righe || []); if (!chiuso) visibile(); }); return; }
      if (!righe) return;
      righe.forEach(([tt, tx], k) => {
        const fine = Math.min(righe[k + 1]?.[0] ?? tt + 4, b.a);
        if (fine <= b.da || tt >= b.a) return;
        const da = Math.max(tt, b.da), x = L + (da - b.da) * zoom, w = (fine - da) * zoom;
        if (x > x1 || x + w < x0) return;
        const pad = Math.max(0, Math.min(w - 80, scorri.scrollLeft - x));
        h += `<span class="cp" style="left:${x}px;width:${Math.max(2, w - 1)}px;padding-left:${pad + 4}px" title="${tempo(tt)} ${esc(tx)}">${w > 28 ? esc(tx) : ""}</span>`;
      });
    });
    const pa = dentro.querySelector(".tl-parole"); if (pa) pa.innerHTML = h;
  }
  // zoom: cursore (scala logaritmica), − +, Adatta, rotella con ctrl/⌘ o pizzico sul trackpad
  function disegnaZoom() {
    const z = $("#tlZoom"); if (!z) return;
    z.value = String(Math.round((100 * Math.log(zoom / ZMIN)) / Math.log(zoomMax() / ZMIN)));
  }
  function zoomA(nuovo, xSchermo = scorri.clientWidth / 2) {
    const t = (scorri.scrollLeft + xSchermo) / zoom;
    zoom = Math.max(ZMIN, Math.min(zoomMax(), nuovo));
    disegnaLinea();
    scorri.scrollLeft = t * zoom - xSchermo;
  }
  $("#tlZoom").oninput = (e) => { const x = Math.max(0, Math.min(scorri.clientWidth, testina * zoom - scorri.scrollLeft)); zoomA(ZMIN * Math.pow(zoomMax() / ZMIN, Number(e.target.value) / 100), x); };
  scorri.addEventListener("wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    zoomA(zoom * Math.exp(-e.deltaY * 0.01), e.clientX - scorri.getBoundingClientRect().left);
  }, { passive: false });
  function posTestina() {
    const t = $("#tlTestina"); if (!t) return;
    t.style.left = `${testina * zoom}px`;
    if (suona) { const x = testina * zoom - scorri.scrollLeft; if (x < 0 || x > scorri.clientWidth - 30) scorri.scrollLeft = testina * zoom - 60; }
    dentro.querySelectorAll(".cl").forEach((c) => c.classList.toggle("ora", modo === "lezione" && Number(c.dataset.i) === corrente));
    mostraScritte();
  }
  const scopri = (id) => { const el = dentro.querySelector(`.cl[data-id="${id}"]`); if (!el) return; const x = el.offsetLeft - scorri.scrollLeft; if (x < 0 || x > scorri.clientWidth - 60) scorri.scrollLeft = el.offsetLeft - 40; };
  const xDi = (e) => e.clientX - dentro.getBoundingClientRect().left;
  // dove cadrebbe un pezzo lasciato alla x data (fra quali blocchi)
  function posizioneA(x, salta = -1) {
    const st = inizi(); let k = 0;
    l.blocchi.forEach((b, i) => { if (i !== salta && (st[i] + durB(b) / 2) * zoom < x) k++; });
    return k;
  }
  function segnaInserimento(k, salta = -1) {
    const ins = $("#tlIns"); if (!ins) return;
    if (k === null) { ins.hidden = true; return; }
    const altri = l.blocchi.map((b, i) => i).filter((i) => i !== salta), st = inizi();
    const i = altri[k];
    const x = i === undefined ? (altri.length ? st[altri.at(-1)] + durB(l.blocchi[altri.at(-1)]) : 0) : st[i];
    ins.hidden = false; ins.style.left = `${x * zoom}px`;
  }
  dentro.addEventListener("dragover", (e) => { if (!trascinato) return; e.preventDefault(); e.dataTransfer.dropEffect = "copy"; segnaInserimento(posizioneA(xDi(e))); });
  dentro.addEventListener("dragleave", (e) => { if (!dentro.contains(e.relatedTarget)) segnaInserimento(null); });
  dentro.addEventListener("drop", (e) => { if (!trascinato) return; e.preventDefault(); const x = trascinato; trascinato = null; segnaInserimento(null); metti(posizioneA(xDi(e)), x); });

  dentro.onpointerdown = (e) => {
    if (e.button !== 0) return;
    const el = e.target.closest(".cl"), bordo = e.target.closest("[data-b]")?.dataset.b, cs = e.target.closest(".cs");
    const x0 = xDi(e);
    dentro.setPointerCapture(e.pointerId);
    // una scritta: si sposta, si allunga o si accorcia dai bordi
    if (cs) {
      const b = l.blocchi.find((x) => x.id === cs.dataset.bid), o = b?.scritte?.find((x) => x.id === cs.dataset.o); if (!o) return;
      const prima = { da: o.da, a: o.a }, max = b.durata || materiale(b.video)?.durata || Infinity;
      let mosso = false;
      sel = b.id; selS = o.id; lato = "pezzo";
      dentro.querySelectorAll(".cs, .cl").forEach((c) => c.classList.toggle("sel", c.dataset.o === selS));
      disegnaLato();
      dentro.onpointermove = (ev) => {
        const dx = xDi(ev) - x0; if (!mosso && Math.abs(dx) < 4) return;
        mosso = true; const d = dx / zoom;
        if (bordo === "sx") o.da = fr(Math.max(0, Math.min(o.a - 1 / FPS, prima.da + d)));
        else if (bordo === "dx") o.a = fr(Math.max(o.da + 1 / FPS, Math.min(max, prima.a + d)));
        else { const len = prima.a - prima.da; o.da = fr(Math.max(0, Math.min(max - len, prima.da + d))); o.a = fr(o.da + len); }
        posiziona();
        const i = l.blocchi.indexOf(b); testina = inizi()[i] + Math.max(0, Math.min(durB(b), (bordo === "dx" ? o.a : o.da) - b.da)); posTestina(); orologio();
        scorriA(b.video, bordo === "dx" ? o.a : o.da);
      };
      dentro.onpointerup = (ev) => {
        dentro.onpointermove = dentro.onpointerup = null;
        if (!mosso) { vaiLezione(xDi(ev) / zoom, false); return; }
        salvaPresto(); disegnaLato(); vaiLezione(testina, false);
      };
      return;
    }
    // fuori dai pezzi (o sul righello): la testina va lì e si trascina
    if (!el) {
      const vai = (x) => {
        testina = fr(Math.max(0, Math.min(totale(), x / zoom)));
        const i = bloccoA(testina), b = l.blocchi[i];
        if (modo !== "lezione") { modo = "lezione"; disegnaModi(); disegnaSotto(); disegnaMateriali(); }
        if (i !== corrente) { corrente = i; mostraMonitor(); }
        posTestina(); orologio();
        if (b?.tipo === "video") scorriA(b.video, b.da + testina - inizi()[i]); else { anteprima(null); fermaLettore(); }
      };
      suona = false; fermaLettore(); vai(x0);
      dentro.onpointermove = (ev) => vai(xDi(ev));
      dentro.onpointerup = () => { dentro.onpointermove = dentro.onpointerup = null; anteprima(null); vaiLezione(testina, false); };
      return;
    }
    const i = Number(el.dataset.i), b = l.blocchi[i];
    const prima = { da: b.da, a: b.a, sec: durB(b) };
    let mosso = false, dove = null;
    if (sel !== b.id || selS) { sel = b.id; selS = null; dentro.querySelectorAll(".cl, .cs").forEach((c) => c.classList.toggle("sel", c.classList.contains("cl") && c.dataset.id === sel)); lato = "pezzo"; disegnaLato(); }
    dentro.onpointermove = (ev) => {
      const dx = xDi(ev) - x0;
      if (!mosso && Math.abs(dx) < 4) return;
      mosso = true;
      const d = dx / zoom;
      if (bordo && b.tipo === "video") {
        const max = b.durata || materiale(b.video)?.durata || Infinity;
        if (bordo === "sx") b.da = fr(Math.max(0, Math.min(prima.a - 1 / FPS, prima.da + d)));
        else b.a = fr(Math.max(b.da + 1 / FPS, Math.min(max, prima.a + d)));
        posiziona(); scorriA(b.video, bordo === "sx" ? b.da : b.a);
        el.querySelector(".cl-nome").textContent = `${b.titoloVideo || b.video} · ${tempo(b.da)}–${tempo(b.a)}`;
      } else if (bordo) {
        b.sec = Math.max(1, Math.round(prima.sec + (bordo === "dx" ? d : -d)));
        posiziona();
      } else {
        el.classList.add("trascina"); el.style.transform = `translateX(${dx}px)`;
        dove = posizioneA(xDi(ev), i); segnaInserimento(dove, i);
      }
      orologio();
    };
    dentro.onpointerup = (ev) => {
      dentro.onpointermove = dentro.onpointerup = null;
      anteprima(null); segnaInserimento(null);
      if (!mosso) { vaiLezione(xDi(ev) / zoom, false); return; }
      if (bordo) { aggiornaEstratto(b); salvaPresto(); disegnaLinea(); disegnaLato(); vaiLezione(inizi()[i] + (bordo === "dx" && b.tipo === "video" ? Math.max(0, durB(b) - 2) : 0), false); return; }
      if (dove !== null && dove !== i) { const [x] = l.blocchi.splice(i, 1); l.blocchi.splice(dove, 0, x); salvaPresto(); }
      disegnaLinea(); vaiLezione(inizi()[l.blocchi.indexOf(b)], false);
    };
  };
  function aggiornaEstratto(b) {
    if (b.tipo !== "video") return;
    trascrizione(b.video).then((t) => { if (t.righe?.length) { b.estratto = estrattoDa(t.righe, b.da, b.a); salvaPresto(); if (sel === b.id && lato === "pezzo" && !chiuso) { const q = $("#isEstr"); if (q) q.textContent = b.estratto; } } });
  }

  // ——— comandi della linea ———
  const scelto = () => l.blocchi.find((b) => b.id === sel);
  function cancella(parte) {
    if (!l.blocchi.length) return;
    const st = inizi(), i = bloccoA(testina), b = l.blocchi[i], off = testina - st[i];
    if (off < 1 / FPS || off > durB(b) - 1 / FPS) return;
    if (b.tipo === "video") { const t = fr(b.da + off); if (parte === "prima") b.da = t; else b.a = t; aggiornaEstratto(b); }
    else b.sec = Math.max(1, Math.round(parte === "prima" ? durB(b) - off : off));
    sel = b.id; selS = null; salvaPresto(); disegnaLinea(); disegnaLato();
    vaiLezione(parte === "prima" ? st[i] : st[i] + durB(b), false);
  }
  function aggiungiScritta() {
    const st = inizi(), i = bloccoA(testina), b = l.blocchi[i];
    if (b?.tipo !== "video") { C.avvisa(m("serveVideo")); return; }
    const da = fr(b.da + Math.max(0, Math.min(durB(b) - 1, testina - st[i])));
    const o = { id: nuovoId(), testo: "", da, a: fr(Math.min(b.a, da + 4) > da + 0.5 ? Math.min(b.a, da + 4) : da + 4), stile: "sotto" };
    (b.scritte ||= []).push(o);
    sel = b.id; selS = o.id; lato = "pezzo";
    salvaPresto(); disegnaLinea(); disegnaLato(); vaiLezione(st[i] + (da - b.da), false);
    $("#osTesto")?.focus();
  }
  function togliScritta() {
    const b = scelto(); if (!b?.scritte) return;
    b.scritte = b.scritte.filter((o) => o.id !== selS); selS = null;
    salvaPresto(); disegnaLinea(); disegnaLato();
  }
  function dividi() {
    if (!l.blocchi.length) return;
    const i = bloccoA(testina), b = l.blocchi[i], off = testina - inizi()[i];
    if (off < 1 / FPS || off > durB(b) - 1 / FPS) return;
    const nuovo = { ...b, id: nuovoId() };
    if (b.tipo === "video") {
      const t = fr(b.da + off); b.a = t; nuovo.da = t; nuovo.commento = "";
      // ogni metà tiene le sue scritte (una scritta a cavallo resta in tutte e due)
      if (b.scritte?.length) { nuovo.scritte = structuredClone(b.scritte.filter((o) => o.a > t)).map((o) => ({ ...o, id: nuovoId() })); b.scritte = b.scritte.filter((o) => o.da < t); }
      aggiornaEstratto(b); aggiornaEstratto(nuovo);
    }
    else { nuovo.sec = Math.max(1, Math.round(durB(b) - off)); b.sec = Math.max(1, Math.round(off)); }
    l.blocchi.splice(i + 1, 0, nuovo);
    sel = nuovo.id; salvaPresto(); disegnaLinea(); disegnaLato();
  }
  function duplica() {
    const b = scelto(); if (!b) return;
    const i = l.blocchi.indexOf(b), c = { ...structuredClone(b), id: nuovoId() };
    c.scritte?.forEach((o) => { o.id = nuovoId(); });
    l.blocchi.splice(i + 1, 0, c); sel = c.id; salvaPresto(); disegnaLinea(); disegnaLato(); scopri(c.id);
  }
  function togli() {
    if (selS) return togliScritta();
    const b = scelto(); if (!b) return;
    const i = l.blocchi.indexOf(b);
    l.blocchi.splice(i, 1); sel = l.blocchi[Math.min(i, l.blocchi.length - 1)]?.id || null;
    salvaPresto(); disegnaLinea(); disegnaLato(); disegnaMateriali(); vaiLezione(Math.min(testina, totale()), false);
  }
  function carta(tipo, extra = {}) {
    // dove sta la testina: prima, dopo, oppure in mezzo a un pezzo (che si divide in due)
    let pos = 0;
    if (l.blocchi.length) {
      const st = inizi(), i = bloccoA(testina), x = l.blocchi[i], off = testina - st[i];
      if (testina >= totale() - 1 / FPS) pos = l.blocchi.length;
      else if (off < 1 / FPS) pos = i;
      else if (off > durB(x) - 1 / FPS) pos = i + 1;
      else { dividi(); pos = i + 1; }
    }
    const b = { id: nuovoId(), tipo, testo: "", sec: SEC[tipo], ...extra };
    l.blocchi.splice(pos, 0, b); sel = b.id; selS = null; lato = "pezzo";
    salvaPresto(); disegnaLinea(); scopri(b.id); vaiLezione(inizi()[pos], false); disegnaLato();
    $("#isTesto")?.focus();
  }
  $("#tlStrumento").onchange = (e) => { const k = e.target.value; e.target.value = ""; if (k) carta("strumento", { k, testo: l.strumenti?.[k] || "" }); };
  box.querySelector(".tl-barra").addEventListener("click", (e) => {
    const f = e.target.closest("[data-f]")?.dataset.f; if (!f) return;
    if (f === "dividi") dividi();
    if (f === "annulla") annulla();
    if (f === "rifai") annulla(true);
    if (f === "prima" || f === "dopo") cancella(f);
    if (f === "scritta") aggiungiScritta();
    if (f === "duplica") duplica();
    if (f === "togli") togli();
    if (f === "titolo" || f === "testo" || f === "domanda") carta(f);
    if (f === "piu" || f === "meno" || f === "adatta") {
      if (f === "adatta") { adatta(); disegnaLinea(); scorri.scrollLeft = 0; }
      else { const x = Math.max(0, Math.min(scorri.clientWidth, testina * zoom - scorri.scrollLeft)); zoomA(zoom * (f === "piu" ? 1.6 : 1 / 1.6), x); }
    }
  });

  // ——— a destra: il pezzo scelto, oppure le parole del video ———
  function disegnaLato() {
    $("#mtSchedeLato").innerHTML = [["pezzo", m("pezzo")], ["parole", m("parole")]].map(([k, n]) => `<button data-k="${k}" class="${lato === k ? "on" : ""}">${n}</button>`).join("");
    if (lato === "parole") return parole();
    const d = $("#mtLato"), b = scelto();
    if (!b) { d.innerHTML = `<p class="sotto">${m("nessunoScelto")}</p>`; return; }
    const o = selS && b.scritte?.find((x) => x.id === selS);
    if (o) {
      const stili = m("stili");
      d.innerHTML = `<div class="is"><p class="is-nome"><button class="link" id="osTorna">${m("tornaPezzo")}</button><strong>${m("scritta")}</strong><small>${esc(b.titoloVideo || "")}</small></p>
        <textarea id="osTesto" rows="2" placeholder="${m("scrittaPh")}" maxlength="160">${esc(o.testo || "")}</textarea>
        <div class="mt-schede is-tipo">${Object.entries(stili).map(([k, n]) => `<button data-st="${k}" class="${(o.stile || "sotto") === k ? "on" : ""}">${n}</button>`).join("")}</div>
        <div class="ap-tempi"><label>${s("da")} <input id="osDa" value="${tempoD(o.da)}" size="7"></label><label>${s("a")} <input id="osA" value="${tempoD(o.a)}" size="7"></label><span class="sotto">${tempoD(o.a - o.da)}</span></div>
        <button class="bott piccolo" id="osTogli">🗑 ${m("togliScritta")}</button></div>`;
      $("#osTorna").onclick = () => { selS = null; disegnaScritte(); disegnaLato(); };
      $("#osTesto").oninput = (e) => { o.testo = e.target.value; salvaPresto(); const c = dentro.querySelector(`.cs[data-o="${o.id}"] span`); if (c) c.textContent = o.testo || "…"; mostraScritte.call(); const mo = $("#moScritte"); if (mo) mo.dataset.h = ""; mostraScritte(); };
      d.querySelector(".is-tipo").onclick = (e) => { const k = e.target.closest("[data-st]")?.dataset.st; if (!k) return; o.stile = k; salvaPresto(); disegnaScritte(); disegnaLato(); };
      const t = (k, inp) => { inp.onchange = () => { const x = secondi(inp.value); if (!Number.isFinite(x)) return; o[k] = fr(x); if (o.a <= o.da) o.a = o.da + 1; salvaPresto(); disegnaScritte(); disegnaLato(); }; };
      t("da", $("#osDa")); t("a", $("#osA"));
      $("#osTogli").onclick = togliScritta;
      return;
    }
    if (b.tipo === "strumento") {
      d.innerHTML = `<div class="is"><div class="mt-schede is-tipo">${STRUMENTI.map((k) => `<button data-k2="${k}" class="${b.k === k ? "on" : ""}">${ws(k)}</button>`).join("")}</div>
        <p class="sotto">${ws(b.k + "Guida")}</p>
        <textarea id="isTesto" class="is-mono" rows="10" spellcheck="true" placeholder="${esc(ws(b.k + "Es"))}" aria-label="${ws(b.k)}">${esc(b.testo || "")}</textarea>
        <p><button class="bott on piccolo" id="isProponi">${m("proponiQui")}</button> <span class="msg" id="isMsg" role="status"></span></p>
        <label>${m("secondi")} <input id="isSec" type="number" min="1" max="600" value="${Math.round(durB(b))}"></label></div>`;
      d.querySelector(".is-tipo").onclick = (e) => { const k = e.target.closest("[data-k2]")?.dataset.k2; if (!k) return; b.k = k; if (!b.testo?.trim()) b.testo = l.strumenti?.[k] || ""; salvaPresto(); disegnaLinea(); disegnaLato(); mostraMonitor(); };
      const ta = $("#isTesto");
      ta.oninput = () => { b.testo = ta.value; salvaPresto(); if (l.blocchi[corrente] === b) mostraMonitor(); };
      ta.onkeydown = (e) => { // Tab = rientro, per la mappa
        if (e.key !== "Tab" || b.k !== "mappa") return;
        e.preventDefault();
        const a = ta.selectionStart, inizio = ta.value.lastIndexOf("\n", a - 1) + 1;
        if (e.shiftKey) { if (ta.value.slice(inizio, inizio + 2) === "  ") { ta.value = ta.value.slice(0, inizio) + ta.value.slice(inizio + 2); ta.selectionStart = ta.selectionEnd = Math.max(inizio, a - 2); } }
        else { ta.value = ta.value.slice(0, inizio) + "  " + ta.value.slice(inizio); ta.selectionStart = ta.selectionEnd = a + 2; }
        ta.dispatchEvent(new Event("input"));
      };
      $("#isProponi").onclick = async () => {
        const materiale = materialeDi(l), msg = $("#isMsg"), bt = $("#isProponi");
        if (materiale.length < 80) { msg.textContent = ws("serveMateriale"); return; }
        bt.disabled = true; msg.textContent = ws("proponendo");
        const r = await fetch("/api/strumento", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tipo: b.k, titolo: l.titolo, materiale }) }).catch(() => null);
        const dd = await r?.json().catch(() => ({})) || {};
        if (!bt.isConnected) return;
        bt.disabled = false;
        if (!r?.ok || !dd.testo) { msg.textContent = r?.status === 429 ? ws("troppeAI") : ws("erroreAI"); return; }
        b.testo = (b.testo?.trim() ? b.testo.trimEnd() + "\n" : "") + dd.testo;
        ta.value = b.testo; salvaPresto(); mostraMonitor(); msg.textContent = ws("proposto");
      };
      $("#isSec").onchange = (e) => { b.sec = Math.max(1, Math.min(600, Number(e.target.value) || SEC.strumento)); salvaPresto(); disegnaLinea(); };
      return;
    }
    if (b.tipo === "video") {
      d.innerHTML = `<div class="is"><p class="is-nome"><strong>${esc(b.titoloVideo || b.video)}</strong><small>${esc(b.nomeCanale || "")}</small></p>
        <div class="ap-tempi"><label>${s("da")} <input id="isDa" value="${tempoD(b.da)}" size="7"></label><label>${s("a")} <input id="isA" value="${tempoD(b.a)}" size="7"></label><span class="sotto">${tempoD(durB(b))}</span></div>
        <div class="is-scritte"><span>${m("scritte")}</span>${(b.scritte || []).map((x) => `<button class="link" data-os="${x.id}">${tempo(x.da)} · ${esc(x.testo || "…")}</button>`).join("")}<button class="bott piccolo" id="isScritta">${m("scrittaQui")}</button></div>
        <label>${s("commento")}<textarea id="isCommento" rows="3" placeholder="${s("commentoPh")}">${esc(b.commento || "")}</textarea></label>
        <label class="b-mostra"><input type="checkbox" id="isMostra" ${b.mostraTesto ? "checked" : ""}> ${s("mostraTesto")}</label>
        <blockquote class="b-estr" id="isEstr">${esc(b.estratto || "")}</blockquote></div>`;
      const tempi = (k, inp) => { inp.onchange = () => { const x = secondi(inp.value); if (!Number.isFinite(x)) return; b[k] = fr(x); if (b.a <= b.da) b.a = b.da + 30; aggiornaEstratto(b); salvaPresto(); disegnaLinea(); disegnaLato(); }; };
      tempi("da", $("#isDa")); tempi("a", $("#isA"));
      $("#isScritta").onclick = () => { const i = l.blocchi.indexOf(b), st = inizi()[i]; if (testina < st || testina >= st + durB(b)) testina = st; aggiungiScritta(); };
      d.querySelectorAll("[data-os]").forEach((x) => x.onclick = () => { selS = x.dataset.os; const o2 = b.scritte.find((y) => y.id === selS); disegnaScritte(); disegnaLato(); if (o2) vaiLezione(inizi()[l.blocchi.indexOf(b)] + Math.max(0, o2.da - b.da), false); });
      $("#isCommento").oninput = (e) => { b.commento = e.target.value; salvaPresto(); };
      $("#isMostra").onchange = (e) => { b.mostraTesto = e.target.checked; salvaPresto(); };
    } else {
      d.innerHTML = `<div class="is"><div class="mt-schede is-tipo">${["titolo", "testo", "domanda"].map((t) => `<button data-t="${t}" class="${b.tipo === t ? "on" : ""}">${tipoNome(t)}</button>`).join("")}</div>
        <textarea id="isTesto" rows="${b.tipo === "titolo" ? 2 : 5}" aria-label="${tipoNome(b.tipo)}">${esc(b.testo || "")}</textarea>
        <label>${m("secondi")} <input id="isSec" type="number" min="1" max="600" value="${Math.round(durB(b))}"></label></div>`;
      d.querySelector(".is-tipo").onclick = (e) => { const t = e.target.closest("[data-t]")?.dataset.t; if (!t) return; b.tipo = t; salvaPresto(); disegnaLinea(); disegnaLato(); mostraMonitor(); };
      $("#isTesto").oninput = (e) => {
        b.testo = e.target.value; salvaPresto();
        const n = dentro.querySelector(`.cl[data-id="${b.id}"] .cl-nome`); if (n) n.textContent = `${tipoNome(b.tipo)}: ${b.testo || "…"}`;
        if (l.blocchi[corrente] === b) mostraMonitor();
      };
      $("#isSec").onchange = (e) => { b.sec = Math.max(1, Math.min(600, Number(e.target.value) || SEC[b.tipo])); salvaPresto(); disegnaLinea(); };
    }
  }
  function disegnaScritte() {
    const t = dentro.querySelector(".tl-scritte"); if (!t) return;
    t.innerHTML = htmlScritte();
    posiziona(); mostraScritte();
  }
  $("#mtSchedeLato").onclick = (e) => { const b = e.target.closest("[data-k]"); if (b) { lato = b.dataset.k; disegnaLato(); } };

  // le parole: del video scelto (in alto) o del pezzo selezionato nella linea; due tocchi = inizio e fine
  const bersaglio = () => (modo === "sorgente" ? sorgente : scelto()?.tipo === "video" ? scelto() : null);
  let paroleDi = null, inizioTocco = null;
  async function parole() {
    const d = $("#mtLato"), x = bersaglio();
    if (!x) { d.innerHTML = `<p class="sotto">${m(modo === "sorgente" ? "sceltoVuoto" : "nessunoScelto")}</p>`; return; }
    d.innerHTML = `<p class="sotto">…</p>`;
    const t = await trascrizione(x.video);
    if (chiuso || lato !== "parole" || bersaglio() !== x) return;
    if (!t.righe?.length) { chiediTrascrizione(d, x.video, t.fonte, () => { if (lato === "parole") parole(); }); return; }
    paroleDi = { x, righe: t.righe }; inizioTocco = null;
    d.innerHTML = `<p class="is-per">${esc(m("perChi", modo === "sorgente" ? m("scelto") : `${x.titoloVideo || ""} · ${tempo(x.da)}–${tempo(x.a)}`))}</p>
      <div class="tr-barra"><input type="search" class="pa-cerca" placeholder="${m("cercaParole")}" aria-label="${m("cercaParole")}"><span class="tr-n pa-n"></span></div>
      <p class="b-istr pa-istr">${m("toccaParole")}</p>
      <div class="pa-righe">${t.righe.map(([tt, tx], k) => `<div class="pa-riga" data-k="${k}"><button class="tc" data-vai="${tt}">${tempo(tt)}</button><span>${esc(tx)}</span></div>`).join("")}</div>`;
    const righe = [...d.querySelectorAll(".pa-riga")], scatola = d.querySelector(".pa-righe");
    segnaParole();
    const prima = righe.find((r, k) => t.righe[k][0] >= x.da - 0.5); if (prima) scatola.scrollTop = prima.offsetTop - scatola.offsetTop - 40;
    const norm = (q) => q.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
    const testi = t.righe.map(([, q]) => norm(q));
    let trovate = [], qui = 0;
    const cerca = d.querySelector(".pa-cerca");
    const mostra = () => {
      righe.forEach((r) => r.classList.remove("trovata", "questa"));
      trovate.forEach((k) => righe[k].classList.add("trovata"));
      if (trovate.length) { const r = righe[trovate[qui]]; r.classList.add("questa"); scatola.scrollTop = r.offsetTop - scatola.offsetTop - 40; }
      d.querySelector(".pa-n").textContent = cerca.value.trim().length > 1 ? (trovate.length ? `${qui + 1} / ${trovate.length}` : m("nienteQui")) : "";
    };
    cerca.oninput = () => { const q = norm(cerca.value.trim()); trovate = q.length > 1 ? testi.map((y, k) => (y.includes(q) ? k : -1)).filter((k) => k >= 0) : []; qui = 0; mostra(); };
    cerca.onkeydown = (e) => { if (e.key === "Enter") { e.preventDefault(); if (trovate.length) { qui = (qui + (e.shiftKey ? trovate.length - 1 : 1)) % trovate.length; mostra(); } } };
    scatola.onclick = (e) => {
      const vai = e.target.closest("[data-vai]");
      if (vai) {
        const sec = Number(vai.dataset.vai);
        if (modo === "sorgente") carica(x.video, sec, true);
        else { const i = l.blocchi.indexOf(x); vaiLezione(inizi()[i] + Math.max(0, Math.min(durB(x), sec - x.da)), true); }
        return;
      }
      const r = e.target.closest(".pa-riga"); if (!r) return;
      const k = Number(r.dataset.k), istr = d.querySelector(".pa-istr");
      if (inizioTocco === null) {
        inizioTocco = k;
        righe.forEach((y) => y.classList.remove("dentro", "capo")); r.classList.add("dentro", "capo");
        istr.textContent = m("toccaFine");
        return;
      }
      const [k1, k2] = k < inizioTocco ? [k, inizioTocco] : [inizioTocco, k];
      inizioTocco = null;
      x.da = Math.floor(t.righe[k1][0]);
      x.a = Math.ceil(t.righe[k2 + 1]?.[0] ?? t.righe[k2][0] + 5);
      if (x.a <= x.da) x.a = x.da + 5;
      istr.textContent = m("pezzoFatto", tempo(x.da), tempo(x.a));
      righe.forEach((y) => y.classList.remove("capo"));
      segnaParole();
      if (modo === "sorgente") { disegnaSorgente(); carica(x.video, x.da, false); }
      else { aggiornaEstratto(x); salvaPresto(); disegnaLinea(); vaiLezione(inizi()[l.blocchi.indexOf(x)], false); }
    };
  }
  function segnaParole() {
    if (!paroleDi || paroleDi.x !== bersaglio()) return;
    const { x, righe } = paroleDi;
    box.querySelectorAll(".pa-riga").forEach((r, k) => r.classList.toggle("dentro", righe[k][0] >= x.da - 0.5 && righe[k][0] < x.a));
  }

  // ——— tastiera ———
  const tasti = (e) => {
    if (e.target.closest?.("input, textarea, select")) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); annulla(e.shiftKey); return; }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") { e.preventDefault(); annulla(true); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector(".presenta")) return;
    const k = e.key.toLowerCase();
    if (k === " ") { e.preventDefault(); playPausa(); }
    else if (k === "s") dividi();
    else if (k === "home") { e.preventDefault(); vaiLezione(0, false); scorri.scrollLeft = 0; }
    else if (k === "end") { e.preventDefault(); vaiLezione(totale(), false); scorri.scrollLeft = dentro.scrollWidth; }
    else if (k === "q") cancella("prima");
    else if (k === "w") cancella("dopo");
    else if (k === "delete" || k === "backspace") { e.preventDefault(); togli(); }
    else if (k === "arrowleft" || k === "arrowright") {
      e.preventDefault();
      const d = (k === "arrowleft" ? -1 : 1) * (e.shiftKey ? 1 : 1 / FPS);
      if (modo === "sorgente" && pronto) carica(sorgente?.video, Math.max(0, (player.getCurrentTime() || 0) + d), player.getPlayerState() === 1);
      else vaiLezione(testina + d, suona);
    }
    else if ((k === "i" || k === "o") && modo === "sorgente") segnaSorgente(k === "i" ? "da" : "a", player?.getCurrentTime?.() || 0);
  };
  document.addEventListener("keydown", tasti);
  const ridimensiona = () => { if (!chiuso) { adatta(); disegnaLinea(); } };
  window.addEventListener("resize", ridimensiona);

  // si comincia: se la linea è vuota si apre il primo video, altrimenti la lezione
  disegnaMateriali(); disegnaModi(); disegnaLinea(); disegnaSotto(); disegnaLato();
  if (!l.blocchi.length && l.materiali.length) apriSorgente(l.materiali[0]);
  else { sel = l.blocchi[0]?.id || null; disegnaLinea(); disegnaLato(); vaiLezione(0, false); }

  return () => {
    chiuso = true; clearInterval(giro);
    document.removeEventListener("keydown", tasti); window.removeEventListener("resize", ridimensiona);
    try { player?.destroy(); } catch {}
    box.closest(".guidata")?.classList.remove("largo");
  };
}
