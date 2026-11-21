// Il montaggio di una lezione, come in un programma video:
// in alto a sinistra i materiali (i video), al centro il monitor, a destra il pezzo scelto o le parole del video,
// sotto la linea del tempo dove i pezzi si trascinano, si accorciano tirando i bordi e si dividono con ✂.
// Il modello resta quello della lezione: l.blocchi in fila (video da–a, titolo, testo, domanda) + l.materiali.

const PAROLE = {
  en: {
    guida: "It works like a video editor. Pick a video on the left, mark where the piece starts and ends (or tap the sentences in «Words») and press «＋ Put on the timeline». On the timeline: drag a piece to move it, pull its edges to shorten it, ✂ cuts at the playhead. Titles, texts and questions are added with the buttons above the timeline.",
    video: "Videos", appunti: "Notes", altri: "＋ Find more videos", incolla: "Paste a YouTube link", nessunMateriale: "No videos yet: paste a link or «Find more videos».",
    nessunAppunto: "No notes yet: you make them from any video page.",
    nellaLinea: (n) => (n ? `on the timeline ×${n}` : "not used yet"),
    scelto: "Chosen video", lezione: "Lesson", sceltoVuoto: "Choose a video on the left.",
    inizioQui: "[ Start here", fineQui: "End here ]", prova: "▶ Try the piece", metti: "＋ Put on the timeline", messo: "Put on the timeline",
    pezzo: "Piece", parole: "Words", nessunoScelto: "Tap a piece on the timeline to change it.",
    tasti: "Space ▶/❚❚ · S cut · Del remove · ← → one second · I / O start and end of the chosen video",
    scritta: "Caption on the video", scrittaPh: "e.g. Who is speaking, a key word…",
    secondi: "Seconds on screen", duplica: "⧉ Duplicate", dividi: "✂ Cut", togli: "Remove",
    titolo: "T Title", testo: "¶ Text", domanda: "? Question", adatta: "Fit",
    lineaVuota: "The timeline is empty: choose a video on the left, mark the piece and press «＋ Put on the timeline» — or drag the video here.",
    toccaParole: "Tap the sentence where the piece starts, then the one where it ends. The time on the left plays from there.",
    toccaFine: "Now tap where it ends.", pezzoFatto: (a, b) => `Piece: ${a}–${b}`,
    perChi: (x) => `Changing: ${x}`, cercaParole: "Search the words…", nienteQui: "Not found",
    nienteDaVedere: "Nothing to show yet.",
  },
  it: {
    guida: "Funziona come un programma di montaggio. Scegli un video a sinistra, segna dove comincia e dove finisce il pezzo (oppure tocca le frasi in «Parole») e premi «＋ Metti nella linea». Nella linea del tempo: trascina un pezzo per spostarlo, tira i bordi per accorciarlo, ✂ taglia dove sta la testina. Titoli, testi e domande si aggiungono con i tasti sopra la linea.",
    video: "Video", appunti: "Appunti", altri: "＋ Cerca altri video", incolla: "Incolla un link di YouTube", nessunMateriale: "Ancora nessun video: incolla un link o «Cerca altri video».",
    nessunAppunto: "Ancora nessun appunto: si fanno dalla pagina di qualunque video.",
    nellaLinea: (n) => (n ? `nella linea ×${n}` : "non ancora usato"),
    scelto: "Video scelto", lezione: "Lezione", sceltoVuoto: "Scegli un video a sinistra.",
    inizioQui: "[ Inizio qui", fineQui: "Fine qui ]", prova: "▶ Prova il pezzo", metti: "＋ Metti nella linea", messo: "Messo nella linea",
    pezzo: "Pezzo", parole: "Parole", nessunoScelto: "Tocca un pezzo nella linea del tempo per cambiarlo.",
    tasti: "Spazio ▶/❚❚ · S taglia · Canc toglie · ← → un secondo · I / O inizio e fine del video scelto",
    scritta: "Scritta sul video", scrittaPh: "es. chi parla, una parola chiave…",
    secondi: "Secondi sullo schermo", duplica: "⧉ Duplica", dividi: "✂ Taglia", togli: "Togli",
    titolo: "T Titolo", testo: "¶ Testo", domanda: "? Domanda", adatta: "Adatta",
    lineaVuota: "La linea è vuota: scegli un video a sinistra, segna il pezzo e premi «＋ Metti nella linea», oppure trascina qui il video.",
    toccaParole: "Tocca la frase dove comincia il pezzo, poi quella dove finisce. Il minuto a sinistra fa partire il video da lì.",
    toccaFine: "Ora tocca dove finisce.", pezzoFatto: (a, b) => `Pezzo: ${a}–${b}`,
    perChi: (x) => `Stai cambiando: ${x}`, cercaParole: "Cerca nelle parole…", nienteQui: "Non c'è",
    nienteDaVedere: "Ancora niente da vedere.",
  },
};
const SEC = { titolo: 4, testo: 8, domanda: 10 };

export async function passoMonta(box, l, salvaPresto, titoloPasso, H) {
  const { C, esc, s, tempo, secondi, nuovoId, estrattoDa, trascrizione, fotogramma, chiediTrascrizione, Q, idDaLink } = H;
  const m = (k, ...a) => { const v = PAROLE[C.ui()]?.[k] ?? PAROLE.en[k]; return typeof v === "function" ? v(...a) : v; };
  const $ = (q) => box.querySelector(q);
  const tipoNome = (t) => s({ titolo: "tTitolo", testo: "tTesto", domanda: "tDomanda", video: "tVideo" }[t]);

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

  // ——— tempi della linea ———
  const durB = (b) => (b.tipo === "video" ? Math.max(0.5, (Number(b.a) || 0) - (Number(b.da) || 0)) : Math.max(1, Number(b.sec) || SEC[b.tipo] || 5));
  const inizi = () => { let t = 0; return l.blocchi.map((b) => { const x = t; t += durB(b); return x; }); };
  const totale = () => l.blocchi.reduce((n, b) => n + durB(b), 0);
  const bloccoA = (t) => { const st = inizi(); for (let i = l.blocchi.length - 1; i >= 0; i--) if (t >= st[i] - 1e-6) return i; return 0; };
  const conta = (id) => l.blocchi.filter((b) => b.video === id).length;

  let chiuso = false, sel = null, testina = 0, zoom = 0, modo = "lezione", sorgente = null, lato = "pezzo", schedaMat = "video";
  let player = null, pronto = false, caricato = "", suona = false, corrente = -1, attesa = 0, ultimo = performance.now(), provaFine = false;

  box.innerHTML = titoloPasso(m("guida")) + `<div class="mt">
    <aside class="mt-mat"><div class="mt-schede" id="mtSchedeMat"></div><div class="mt-lista" id="mtLista"></div>
      <form class="mt-link" id="mtLink"><input placeholder="${m("incolla")}" aria-label="${m("incolla")}"><button class="bott piccolo">＋</button></form>
      <a class="link mt-altri" href="#/lezione/${l.id}/video">${m("altri")}</a></aside>
    <div class="mt-centro">
      <div class="mt-schede mt-modi" id="mtModi"><button data-modo="sorgente">${m("scelto")}</button><button data-modo="lezione">${m("lezione")}</button></div>
      <div class="mo"><div class="mo-lettore"><div id="moLettore"></div></div>
        <img class="mo-anteprima" id="moAnteprima" alt="" hidden><div class="mo-carta" id="moCarta" hidden></div>
        <p class="mo-scritta" id="moScritta" hidden></p><div class="mo-vuoto" id="moVuoto" hidden></div><button class="mo-velo" id="moVelo" aria-label="▶/❚❚"></button></div>
      <div id="mtSotto"></div></div>
    <aside class="mt-lato"><div class="mt-schede" id="mtSchedeLato"></div><div id="mtLato"></div></aside>
    <div class="tl">
      <div class="tl-barra"><button class="bott piccolo on" id="tlPlay" aria-label="▶">▶</button><span class="tl-ora" id="tlOra">0:00 / 0:00</span>
        <span class="tl-sep"></span><button class="bott piccolo" data-f="dividi">${m("dividi")}</button><button class="bott piccolo" data-f="duplica">${m("duplica")}</button><button class="bott piccolo" data-f="togli">🗑 ${m("togli")}</button>
        <span class="tl-sep"></span><button class="bott piccolo" data-f="titolo">${m("titolo")}</button><button class="bott piccolo" data-f="testo">${m("testo")}</button><button class="bott piccolo" data-f="domanda">${m("domanda")}</button>
        <span class="tl-zoom"><button class="bott piccolo" data-f="meno" aria-label="−">−</button><button class="bott piccolo" data-f="adatta">${m("adatta")}</button><button class="bott piccolo" data-f="piu" aria-label="+">+</button></span></div>
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
  $("#mtLista").ondragstart = (e) => { const v = e.target.closest(".mt-voce"); if (!v) return; trascinato = daVoce(Number(v.dataset.i)); e.dataTransfer.setData("text/plain", trascinato.video); e.dataTransfer.effectAllowed = "copy"; };
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
      playerVars: { rel: 0, playsinline: 1, iv_load_policy: 3, controls: 0, disablekb: 1, modestbranding: 1 },
      events: { onReady: () => { pronto = true; if (modo === "sorgente" && sorgente) carica(sorgente.video, sorgente.da, false); else vaiLezione(testina, false); } },
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
    const carta = $("#moCarta"), scritta = $("#moScritta"), vuoto = $("#moVuoto");
    carta.hidden = true; scritta.hidden = true; vuoto.hidden = true;
    if (modo === "sorgente") { if (!sorgente) { vuoto.hidden = false; vuoto.textContent = m("sceltoVuoto"); } return; }
    const b = l.blocchi[corrente];
    if (!b) { vuoto.hidden = false; vuoto.textContent = m("nienteDaVedere"); return; }
    if (b.tipo !== "video") {
      carta.hidden = false; carta.className = `mo-carta mo-${b.tipo}`;
      carta.innerHTML = b.tipo === "domanda" ? `<p class="pr-tipo">${s("tDomanda")}</p><p>${esc(b.testo || "…")}</p>` : `<p>${esc(b.testo || "…")}</p>`;
    } else if (b.scritta) { scritta.hidden = false; scritta.textContent = b.scritta; }
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
    $("#tlOra").textContent = `${tempo(testina)} / ${tempo(totale())}`;
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
        <button class="bott piccolo" data-so="prova">${m("prova")}</button><button class="bott on" data-so="metti">${m("metti")}</button></div></div>`;
    disegnaSorgente();
    const film = $("#soFilm"), n = 10, d = durataSorgente();
    film.innerHTML = Array.from({ length: n }, () => `<img alt="">`).join("");
    [...film.children].forEach((img, k) => miniatura(sorgente.video, ((k + 0.5) * d) / n, sorgente.durata).then((src) => { if (src) img.src = src; }));
    sotto.querySelector(".so-tasti").onclick = (e) => {
      const k = e.target.closest("[data-so]")?.dataset.so; if (!k) return;
      if (k === "da" || k === "a") return segnaSorgente(k, player?.getCurrentTime?.() || 0);
      if (k === "prova") { if (!pronto) return; provaFine = true; carica(sorgente.video, sorgente.da, true); return; }
      if (k === "metti") metti();
    };
    // la pista: un tocco porta il video lì, i due manici spostano inizio e fine
    const pista = $("#soPista");
    pista.onpointerdown = (e) => {
      const r = pista.getBoundingClientRect(), d = durataSorgente();
      const t = (x) => Math.max(0, Math.min(d, ((x - r.left) / r.width) * d));
      const h = e.target.closest("[data-h]")?.dataset.h;
      pista.setPointerCapture(e.pointerId);
      if (!h) { carica(sorgente.video, t(e.clientX), player?.getPlayerState?.() === 1); }
      pista.onpointermove = (ev) => { if (h) segnaSorgente(h, t(ev.clientX), true); else anteprima(sorgente.video, t(ev.clientX)); };
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
    t = Math.round(t);
    if (k === "da") { sorgente.da = Math.max(0, t); if (sorgente.a <= sorgente.da) sorgente.a = Math.min(durataSorgente(), sorgente.da + 30); }
    else { sorgente.a = Math.min(durataSorgente(), Math.max(1, t)); if (sorgente.a <= sorgente.da) sorgente.da = Math.max(0, sorgente.a - 30); }
    disegnaSorgente();
    if (trascinando) anteprima(sorgente.video, t); else if (lato === "parole") segnaParole();
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
  const passoRighello = () => [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 1200].find((p) => p * zoom >= 64) || 1800;
  function adatta() { const tot = Math.max(30, totale()); zoom = Math.max(0.6, Math.min(40, (scorri.clientWidth - 40) / tot)); }
  function disegnaLinea() {
    if (!zoom) adatta();
    const st = inizi(), tot = totale(), larg = Math.max(scorri.clientWidth - 2, (tot + 15) * zoom);
    dentro.style.width = `${larg}px`;
    const p = passoRighello();
    let tacche = "";
    for (let t = 0; t * zoom < larg; t += p) tacche += `<span style="left:${t * zoom}px">${tempo(t)}</span>`;
    const clip = l.blocchi.map((b, i) => {
      const nome = b.tipo === "video" ? `${esc(b.titoloVideo || b.video)} · ${tempo(b.da)}–${tempo(b.a)}` : `${tipoNome(b.tipo)}: ${esc(b.testo || "…")}`;
      return `<div class="cl cl-${b.tipo}${b.id === sel ? " sel" : ""}" data-id="${b.id}" data-i="${i}" title="${nome}">
        ${b.tipo === "video" ? `<div class="cl-film"></div>` : ""}<span class="cl-nome">${nome}</span><i class="cl-bordo sx" data-b="sx"></i><i class="cl-bordo dx" data-b="dx"></i></div>`;
    }).join("");
    const scritte = l.blocchi.map((b) => (b.tipo === "video" && b.scritta ? `<div class="cs" data-id="${b.id}">${esc(b.scritta)}</div>` : "")).join("");
    dentro.innerHTML = `<div class="tl-righello">${tacche}</div><div class="tl-traccia tl-scritte">${scritte}</div>
      <div class="tl-traccia tl-video">${clip}${l.blocchi.length ? "" : `<p class="tl-vuota">${m("lineaVuota")}</p>`}</div>
      <div class="tl-ins" id="tlIns" hidden></div><div class="tl-testina" id="tlTestina"><b></b></div>`;
    posiziona(st);
    dentro.querySelectorAll(".cl-video .cl-film").forEach((f) => film(f));
    posTestina(); orologio();
  }
  function posiziona(st = inizi()) {
    l.blocchi.forEach((b, i) => {
      const x = st[i] * zoom, wd = Math.max(4, durB(b) * zoom - 2);
      dentro.querySelectorAll(`[data-id="${b.id}"]`).forEach((el) => { el.style.left = `${x}px`; el.style.width = `${wd}px`; });
    });
  }
  function film(f) {
    const el = f.closest(".cl"), b = l.blocchi.find((x) => x.id === el.dataset.id); if (!b) return;
    const wd = durB(b) * zoom, n = Math.max(1, Math.min(24, Math.floor(wd / 64)));
    f.innerHTML = Array.from({ length: n }, () => `<img alt="">`).join("");
    [...f.children].forEach((img, k) => miniatura(b.video, b.da + ((k + 0.5) * durB(b)) / n, b.durata).then((src) => { if (src) img.src = src; }));
  }
  function posTestina() {
    const t = $("#tlTestina"); if (!t) return;
    t.style.left = `${testina * zoom}px`;
    if (suona) { const x = testina * zoom - scorri.scrollLeft; if (x < 0 || x > scorri.clientWidth - 30) scorri.scrollLeft = testina * zoom - 60; }
    dentro.querySelectorAll(".cl").forEach((c) => c.classList.toggle("ora", modo === "lezione" && Number(c.dataset.i) === corrente));
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
    const el = e.target.closest(".cl"), bordo = e.target.closest("[data-b]")?.dataset.b;
    const x0 = xDi(e);
    dentro.setPointerCapture(e.pointerId);
    // fuori dai pezzi (o sul righello): la testina va lì e si trascina
    if (!el) {
      const vai = (x) => { testina = Math.max(0, Math.min(totale(), x / zoom)); posTestina(); orologio(); const i = bloccoA(testina), b = l.blocchi[i]; if (b?.tipo === "video") anteprima(b.video, b.da + testina - inizi()[i]); else anteprima(null); };
      suona = false; fermaLettore(); vai(x0);
      dentro.onpointermove = (ev) => vai(xDi(ev));
      dentro.onpointerup = () => { dentro.onpointermove = dentro.onpointerup = null; anteprima(null); vaiLezione(testina, false); };
      return;
    }
    const i = Number(el.dataset.i), b = l.blocchi[i];
    const prima = { da: b.da, a: b.a, sec: durB(b) };
    let mosso = false, dove = null;
    if (sel !== b.id) { sel = b.id; dentro.querySelectorAll(".cl").forEach((c) => c.classList.toggle("sel", c.dataset.id === sel)); lato = "pezzo"; disegnaLato(); }
    dentro.onpointermove = (ev) => {
      const dx = xDi(ev) - x0;
      if (!mosso && Math.abs(dx) < 4) return;
      mosso = true;
      const d = dx / zoom;
      if (bordo && b.tipo === "video") {
        const max = b.durata || materiale(b.video)?.durata || Infinity;
        if (bordo === "sx") b.da = Math.round(Math.max(0, Math.min(prima.a - 1, prima.da + d)));
        else b.a = Math.round(Math.max(b.da + 1, Math.min(max, prima.a + d)));
        posiziona(); anteprima(b.video, bordo === "sx" ? b.da : b.a);
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
  function dividi() {
    if (!l.blocchi.length) return;
    const i = bloccoA(testina), b = l.blocchi[i], off = testina - inizi()[i];
    if (off < 0.5 || off > durB(b) - 0.5) return;
    const nuovo = { ...b, id: nuovoId() };
    if (b.tipo === "video") { const t = Math.round(b.da + off); b.a = t; nuovo.da = t; nuovo.commento = ""; aggiornaEstratto(b); aggiornaEstratto(nuovo); }
    else { nuovo.sec = Math.max(1, Math.round(durB(b) - off)); b.sec = Math.max(1, Math.round(off)); }
    l.blocchi.splice(i + 1, 0, nuovo);
    sel = nuovo.id; salvaPresto(); disegnaLinea(); disegnaLato();
  }
  function duplica() {
    const b = scelto(); if (!b) return;
    const i = l.blocchi.indexOf(b), c = { ...structuredClone(b), id: nuovoId() };
    l.blocchi.splice(i + 1, 0, c); sel = c.id; salvaPresto(); disegnaLinea(); disegnaLato(); scopri(c.id);
  }
  function togli() {
    const b = scelto(); if (!b) return;
    const i = l.blocchi.indexOf(b);
    l.blocchi.splice(i, 1); sel = l.blocchi[Math.min(i, l.blocchi.length - 1)]?.id || null;
    salvaPresto(); disegnaLinea(); disegnaLato(); disegnaMateriali(); vaiLezione(Math.min(testina, totale()), false);
  }
  function carta(tipo) {
    const pos = sel ? dopoScelto() : l.blocchi.length ? bloccoA(testina) + (testina > 0 ? 1 : 0) : 0;
    const b = { id: nuovoId(), tipo, testo: "", sec: SEC[tipo] };
    l.blocchi.splice(pos, 0, b); sel = b.id; lato = "pezzo";
    salvaPresto(); disegnaLinea(); scopri(b.id); vaiLezione(inizi()[pos], false); disegnaLato();
    $("#isTesto")?.focus();
  }
  box.querySelector(".tl-barra").addEventListener("click", (e) => {
    const f = e.target.closest("[data-f]")?.dataset.f; if (!f) return;
    if (f === "dividi") dividi();
    if (f === "duplica") duplica();
    if (f === "togli") togli();
    if (f === "titolo" || f === "testo" || f === "domanda") carta(f);
    if (f === "piu" || f === "meno" || f === "adatta") {
      const centro = (scorri.scrollLeft + scorri.clientWidth / 2) / zoom;
      if (f === "adatta") adatta(); else zoom = Math.max(0.3, Math.min(80, zoom * (f === "piu" ? 1.6 : 1 / 1.6)));
      disegnaLinea(); scorri.scrollLeft = centro * zoom - scorri.clientWidth / 2;
    }
  });

  // ——— a destra: il pezzo scelto, oppure le parole del video ———
  function disegnaLato() {
    $("#mtSchedeLato").innerHTML = [["pezzo", m("pezzo")], ["parole", m("parole")]].map(([k, n]) => `<button data-k="${k}" class="${lato === k ? "on" : ""}">${n}</button>`).join("");
    if (lato === "parole") return parole();
    const d = $("#mtLato"), b = scelto();
    if (!b) { d.innerHTML = `<p class="sotto">${m("nessunoScelto")}</p>`; return; }
    if (b.tipo === "video") {
      d.innerHTML = `<div class="is"><p class="is-nome"><strong>${esc(b.titoloVideo || b.video)}</strong><small>${esc(b.nomeCanale || "")}</small></p>
        <div class="ap-tempi"><label>${s("da")} <input id="isDa" value="${tempo(b.da)}" size="7"></label><label>${s("a")} <input id="isA" value="${tempo(b.a)}" size="7"></label><span class="sotto">${tempo(durB(b))}</span></div>
        <label>${m("scritta")}<input id="isScritta" value="${esc(b.scritta || "")}" placeholder="${m("scrittaPh")}" maxlength="120"></label>
        <label>${s("commento")}<textarea id="isCommento" rows="3" placeholder="${s("commentoPh")}">${esc(b.commento || "")}</textarea></label>
        <label class="b-mostra"><input type="checkbox" id="isMostra" ${b.mostraTesto ? "checked" : ""}> ${s("mostraTesto")}</label>
        <blockquote class="b-estr" id="isEstr">${esc(b.estratto || "")}</blockquote></div>`;
      const tempi = (k, inp) => { inp.onchange = () => { const x = secondi(inp.value); if (!Number.isFinite(x)) return; b[k] = x; if (b.a <= b.da) b.a = b.da + 30; aggiornaEstratto(b); salvaPresto(); disegnaLinea(); disegnaLato(); }; };
      tempi("da", $("#isDa")); tempi("a", $("#isA"));
      $("#isScritta").oninput = (e) => { b.scritta = e.target.value; salvaPresto(); disegnaScritte(); if (l.blocchi[corrente] === b) mostraMonitor(); };
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
    t.innerHTML = l.blocchi.map((b) => (b.tipo === "video" && b.scritta ? `<div class="cs" data-id="${b.id}">${esc(b.scritta)}</div>` : "")).join("");
    posiziona();
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
    if (e.target.closest?.("input, textarea, select") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (document.querySelector(".presenta")) return;
    const k = e.key.toLowerCase();
    if (k === " ") { e.preventDefault(); playPausa(); }
    else if (k === "s") dividi();
    else if (k === "delete" || k === "backspace") { e.preventDefault(); togli(); }
    else if (k === "arrowleft" || k === "arrowright") {
      e.preventDefault();
      const d = (k === "arrowleft" ? -1 : 1) * (e.shiftKey ? 5 : 1);
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
