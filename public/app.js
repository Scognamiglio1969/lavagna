// Lavagna — una pagina, rotte con l'hash: #/, #/c/scienza, #/ch/UC…, #/v/ID, #/cerca/parole, #/salvati, #/tv, #/canali
// I video vengono da più fonti (campo `fonte`): YouTube (nessun campo), "ia" Internet Archive, "vimeo", "pt" PeerTube.
const $ = (s) => document.querySelector(s);
const vista = $("#vista");

const memo = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
let lingua = memo.get("lingua", "tutte");

// ——— lingua dell'interfaccia: inglese prima di tutto, italiano a scelta (⚙) ———
const T = {
  en: {
    oggi: "today", ieri: "yesterday", giorni: (n) => `${n} days ago`, mesi: (n) => `${n} months ago`, anni: (n) => `${n} years ago`,
    viste: (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M views` : n >= 1e3 ? `${Math.round(n / 1e3)}K views` : `${n} views`,
    vuoto: (filtro) => `No videos here${filtro ? " in this language" : ""}.`,
    gruppi: { "Scienze e tecnica": "Science & technology", "Storia e idee": "History & ideas", "Società": "Society", "Arti": "Arts", "Tempo libero": "Leisure", "I tuoi argomenti": "Your topics", "Altri": "Other" },
    nCanali: (n) => `${n} channels`, tutto: "All", argomenti: "Topics", tv: "TV", esplora: "Explore", daVedere: "Watch later", canali: "Channels",
    homeErrore: "Can't load the home page right now. Try again shortly.",
    evidenza: "Featured", evidenzaSotto: "most watched this week, one per topic", sfoglia: "Browse by topic", nArgomenti: (n) => `${n} topics`,
    novita: "New", novitaSotto: "just out", vediTutto: "see all →", fineHome: (n) => `From ${n} hand-picked channels, with no ads on the page and no Shorts.`,
    feedErrore: "Can't read the feeds right now. Try again shortly.",
    italiano: "Italian", inglese: "English", ultimiPubblicati: "latest videos",
    tutteSezioni: "All topics", tutteFonti: "All sources", qualsiasiDurata: "Any length", brevi: "Short (< 10 min)", medi: "Medium (10–40 min)", lunghi: "Long (> 40 min)",
    recenti: "Most recent", piuVisti: "Most watched", esploraTitolo: "Explore the archive", sezione: "Topic", durata: "Length", fonte: "Source", ordine: "Order",
    cercaErrore: "Search isn't responding right now. Try again shortly.",
    cercoIn: (n) => `Searching ${n} videos collected so far — the archive grows every day.`,
    conParole: "Matching words", nessunaParola: "No title or description contains these words.",
    stessoTema: "Same topic", stessoTemaSotto: "found by meaning, in other languages too",
    tutti: (n) => `I understand all ${n} videos by meaning.`,
    massimo: (a, b) => `I understand the ${a} most recent of ${b} videos by meaning: that's the free plan's limit.`,
    impara: (a, b) => `I already understand ${a} of ${b} videos by meaning, learning 60 more every 10 minutes, newest first.`,
    significatoErrore: "Meaning search isn't responding right now. Try again shortly.",
    nessunVicino: "None of the videos I understand by meaning is close enough to this search.",
    fileMancante: "This video's file can't be found on Internet Archive.",
    velocita: "Speed", timer: "Sleep timer", timerSpento: "Timer off", ora1: "1 hour", ora15: "1½ hours", ore2: "2 hours", fineVideo: "At the end of this video",
    riprendi: "▶ Resume", spentoTimer: "Stopped by the timer. Good night.", spegneFine: "stops at the end of the video", spegneTra: (t) => `stops in ${t}`,
    daVedereSotto: "The videos you saved, on this device.", nonTrovato: "Video not found.",
    salvato: "★ Saved", salva: "☆ Watch later", stessoCanale: "From the same channel", altroIn: (n) => `More in ${n}`,
    qualcosa: "Something went wrong.", servePassword: "Adding or removing channels requires the password.", entra: "Sign in",
    modifichePerTutti: "Changes apply to everyone who opens Lavagna.", esci: "Sign out",
    linkCanale: "Channel link, @handle or a link to one of its videos", cerca: "Search",
    nuovoArgomento: "New topic", nuovoSotto: "Type a name: I'll find the first channels, check they're active, with long videos and a real audience, and you pick which to keep.",
    simbolo: "Symbol", nomeEs: "Name, e.g. Astronomy", nomeArg: "Topic name", paroleIt: "Italian keywords (optional, comma-separated)", paroleEn: "English keywords (optional)",
    creaCerca: "Create and find channels", daProvare: "Channels to try", cerco: "Searching…",
    creoArg: "Creating the topic and finding channels: about half a minute…",
    spostoConferma: (n, d) => `Move «${n}» to ${d}?`, togliArgConferma: (n) => `Remove the topic «${n}» and all its channels?`,
    giaInElenco: (n) => `Already listed, in ${n}.`, ultimiLunghi: (n) => `Latest long videos: ${n}.`, nessunLungo: "No recent long videos in the feed: it would stay empty in Lavagna.",
    nome: "Name", categoria: "Topic", lingua: "Language", aggiungi: "Add", togliConferma: (n) => `Remove «${n}» from Lavagna?`,
    nessunaProposta: "No more suggestions for now.", proposteSotto: "new on every visit: add them to grow Lavagna", trovatoOra: " · just found",
    noGrazie: "no thanks", guarda: "watch", aggiunto: "added ✓",
    cercoCanaliIt: (n) => `Looking for «${n}» channels in Italian: about half a minute…`,
    trovatiIt: (n) => `Found ${n} channels in Italian; now searching in English…`,
    nessunCanale: "No new channel passes the checks. Try other keywords.",
    milioni: (x) => `${(x / 1e6).toFixed(1)}M`, vistaMedia: (n) => `${n} average views`,
    trovati: (n, a) => `${n} channels found for «${a}». Untick the ones you don't want.`, guardaCanale: "view channel", aggiungiScelti: "Add selected",
    aggiunti: (n, cat) => `Added ${n} channels. <a class="link" href="#/c/${cat}">Open the topic →</a> Videos show up right away; in the index and search within about an hour.`,
    cercaAltri: "find more channels", togliArg: "remove topic", spostaIn: "move to…", spostaAria: (n) => `Move ${n} to another topic`, togli: "remove",
    direttaIss: "● Live: Earth from the Space Station (NASA)", direttaLichess: "● Live: the strongest game being played (Lichess)",
    tvCanale: "TV channel", tuttoMescolato: "✦ Everything shuffled", dirette: "Live", accendi: "▶ Turn on", tvSotto: "Educational videos one after another, no recommendations and no Shorts.",
    posizione: "Position", prec: "Previous", indietro: "Back 10 seconds", play: "Play/pause", avanti: "Forward 10 seconds", succ: "Next", audio: "Sound", schermoIntero: "Full screen",
    inDiretta: "Live: the controls are inside the frame.", salvatoTv: "★ saved", salvaTv: "☆ watch later", dopo: "Next:",
    tvSpenta: "The TV was turned off by the timer. Good night.", riaccendi: "▶ Turn on again", accendo: "Turning on…", nessunVideo: "No videos for this choice.",
    cercaPh: "Search videos…", lingueVideo: "Video language", tutte: "All",
    piede: "Videos from official channels, hand-picked. No ads on the page, no Shorts, no algorithmic recommendations.",
    impostazioni: "Settings", linguaUi: "Interface language", tema: "Theme", auto: "Auto", chiaro: "Light", scuro: "Dark",
    videoPrec: "Previous video", videoSucc: "Next video",
    mia: "My Lavagna", account: "Account", ciao: (n) => `Hi, ${n}`, esciConto: "Sign out", cancellaConto: "Delete my account",
    cancellaConferma: "Delete your account, your passkey and everything you added? This can't be undone.",
    creaConto: "Create account", entraPasskey: "Sign in with a passkey", tuoNome: "Your name or nickname",
    passkeySpiega: "No email, no password: you sign in with Face ID, Touch ID, your fingerprint or a security key (a passkey).",
    passkeyNo: "This browser doesn't support passkeys.", passkeyAnnullata: "Cancelled. Try again when you're ready.",
    passkeyErrore: "The passkey didn't work. Try again.", troppe: "Too many accounts from this connection today. Try again tomorrow.",
    miaSotto: "Your own channels and topics, on top of everyone's. Only you see them.",
    miaVuota: "Sign in to add your own channels and topics.",
    aggiungiCanale: "Add a channel", mieiArgomenti: "My topics", mieiCanali: "My channels", nessunMio: "Nothing added yet.",
    mioTag: "mine", inArgomento: "in", entraPrima: "Sign in first.",
    cookieTesto: "Lavagna has no ads and no tracking. Your preferences (language, theme, watch later) stay on your device. When you play a video, its platform (YouTube's privacy-enhanced player, Vimeo and others) may set its own cookies. Fonts come from Google Fonts, which sees your IP address: choose «Essential only» to use your device's fonts instead.",
    cookieTutti: "Accept all", cookieEssenziali: "Essential only", cookieInfo: "Privacy", cookieImpostazioni: "Cookie settings",
    esternoTesto: (f) => `This video is played by ${f}, which may set cookies. You chose essential cookies only.`,
    esternoUnaVolta: "▶ Play this video", esternoSempre: "Always allow",
    privacyTitolo: "Privacy",
    privacyCorpo: `<p><b>No ads, no tracking, no profiles.</b> Lavagna does not use analytics, advertising or tracking cookies.</p>
      <p><b>Optional account, with a passkey.</b> If you create one, we store only a random id, the name you choose, your passkey's public key and the channels and topics you add. No email, no password. A sign-in cookie keeps you logged in; «Delete my account» erases everything. The passkey library is loaded from jsDelivr only when you sign up or sign in.</p>
      <p><b>On your device.</b> Your language, theme, video-language filter, playback speed and «Watch later» list are saved in your browser's local storage. They never leave your device and you can clear them at any time from your browser.</p>
      <p><b>Video platforms.</b> Videos are played by their own platforms (YouTube via its privacy-enhanced youtube-nocookie.com player, Vimeo, Internet Archive, PeerTube). When you start a video, that platform may set its own cookies and receives your IP address, under its own privacy policy. Thumbnails are images served by the platforms.</p>
      <p><b>Fonts, only with your consent.</b> With «Accept all», fonts are loaded from Google Fonts, which sees your IP address. With «Essential only», your device's own fonts are used instead.</p>
      <p><b>Server.</b> The site runs on Cloudflare, which processes standard technical data (such as your IP address) to deliver the pages. Lavagna keeps no logs of who watches what.</p>
      <p>You can change your choice any time with «Cookie settings» at the bottom of the page.</p>`,
  },
  it: {
    oggi: "oggi", ieri: "ieri", giorni: (n) => `${n} giorni fa`, mesi: (n) => `${n} mesi fa`, anni: (n) => `${n} anni fa`,
    viste: (n) => n >= 1e6 ? `${(n / 1e6).toFixed(1).replace(".", ",")} Mln visualizz.` : n >= 1e3 ? `${Math.round(n / 1e3)}k visualizz.` : `${n} visualizz.`,
    vuoto: (filtro) => `Nessun video qui${filtro ? " in questa lingua" : ""}.`,
    gruppi: {},
    nCanali: (n) => `${n} canali`, tutto: "Tutto", argomenti: "Argomenti", tv: "TV", esplora: "Esplora", daVedere: "Da vedere", canali: "Canali",
    homeErrore: "Non riesco a caricare la home adesso. Riprova tra poco.",
    evidenza: "In evidenza", evidenzaSotto: "i più visti della settimana, uno per sezione", sfoglia: "Sfoglia per argomento", nArgomenti: (n) => `${n} argomenti`,
    novita: "Novità", novitaSotto: "appena usciti", vediTutto: "vedi tutto →", fineHome: (n) => `Da ${n} canali scelti a mano, senza pubblicità in pagina e senza Shorts.`,
    feedErrore: "Non riesco a leggere i feed adesso. Riprova tra poco.",
    italiano: "italiano", inglese: "inglese", ultimiPubblicati: "gli ultimi video pubblicati",
    tutteSezioni: "Tutte le sezioni", tutteFonti: "Tutte le fonti", qualsiasiDurata: "Qualsiasi durata", brevi: "Brevi (< 10 min)", medi: "Medi (10–40 min)", lunghi: "Lunghi (> 40 min)",
    recenti: "I più recenti", piuVisti: "I più visti", esploraTitolo: "Esplora l'archivio", sezione: "Sezione", durata: "Durata", fonte: "Fonte", ordine: "Ordine",
    cercaErrore: "La ricerca non risponde adesso. Riprova tra poco.",
    cercoIn: (n) => `Cerco in ${n} video raccolti finora, e l'archivio cresce ogni giorno.`,
    conParole: "Con queste parole", nessunaParola: "Nessun titolo o descrizione contiene queste parole.",
    stessoTema: "Sullo stesso tema", stessoTemaSotto: "trovati per significato, anche in altre lingue",
    tutti: (n) => `Per significato capisco tutti i ${n} video.`,
    massimo: (a, b) => `Per significato capisco i ${a} video più recenti su ${b}: è il massimo del piano gratuito.`,
    impara: (a, b) => `Per significato capisco già ${a} video su ${b}: ne imparo altri 60 ogni 10 minuti, partendo dai più recenti.`,
    significatoErrore: "La ricerca per significato non risponde adesso. Riprova tra poco.",
    nessunVicino: "Fra i video che conosco per significato non ce n'è nessuno abbastanza vicino a questa ricerca.",
    fileMancante: "Il file di questo video non si trova su Internet Archive.",
    velocita: "Velocità", timer: "Timer di spegnimento", timerSpento: "Timer spento", ora1: "1 ora", ora15: "1 ora e mezza", ore2: "2 ore", fineVideo: "Alla fine di questo video",
    riprendi: "▶ Riprendi", spentoTimer: "Spento col timer. Buonanotte.", spegneFine: "spegne alla fine del video", spegneTra: (t) => `spegne tra ${t}`,
    daVedereSotto: "I video che hai messo da parte, su questo dispositivo.", nonTrovato: "Video non trovato.",
    salvato: "★ Salvato", salva: "☆ Da vedere", stessoCanale: "Dallo stesso canale", altroIn: (n) => `Altro in ${n}`,
    qualcosa: "Qualcosa non è andato.", servePassword: "Per aggiungere o togliere canali serve la password.", entra: "Entra",
    modifichePerTutti: "Le modifiche valgono per chiunque apra Lavagna.", esci: "Esci",
    linkCanale: "Link del canale, @nome o link di un suo video", cerca: "Cerca",
    nuovoArgomento: "Nuovo argomento", nuovoSotto: "Scrivi il nome: cerco io i primi canali, controllo che siano attivi, con video lunghi e un pubblico vero, e tu scegli quali tenere.",
    simbolo: "Simbolo", nomeEs: "Nome, per esempio Astronomia", nomeArg: "Nome dell'argomento", paroleIt: "Parole chiave in italiano (facoltative, separate da virgole)", paroleEn: "Parole chiave in inglese (facoltative)",
    creaCerca: "Crea e cerca canali", daProvare: "Canali da provare", cerco: "Cerco…",
    creoArg: "Creo l'argomento e cerco i canali: ci vuole circa mezzo minuto…",
    spostoConferma: (n, d) => `Sposto «${n}» in ${d}?`, togliArgConferma: (n) => `Tolgo l'argomento «${n}» e tutti i suoi canali?`,
    giaInElenco: (n) => `È già in elenco, in ${n}.`, ultimiLunghi: (n) => `Ultimi video lunghi: ${n}.`, nessunLungo: "Nel feed non ci sono video lunghi recenti: in Lavagna resterebbe vuoto.",
    nome: "Nome", categoria: "Categoria", lingua: "Lingua", aggiungi: "Aggiungi", togliConferma: (n) => `Tolgo «${n}» da Lavagna?`,
    nessunaProposta: "Per ora non ho altre proposte.", proposteSotto: "nuovi a ogni visita: aggiungili per allargare Lavagna", trovatoOra: " · trovato ora",
    noGrazie: "no, grazie", guarda: "guarda", aggiunto: "aggiunto ✓",
    cercoCanaliIt: (n) => `Cerco canali per «${n}» in italiano: circa mezzo minuto…`,
    trovatiIt: (n) => `Trovati ${n} canali in italiano; ora cerco in inglese…`,
    nessunCanale: "Nessun canale nuovo che passi i controlli. Prova con altre parole chiave.",
    milioni: (x) => `${(x / 1e6).toFixed(1).replace(".", ",")} Mln`, vistaMedia: (n) => `${n} viste in media`,
    trovati: (n, a) => `${n} canali trovati per «${a}». Togli la spunta a quelli che non vuoi.`, guardaCanale: "guarda il canale", aggiungiScelti: "Aggiungi i selezionati",
    aggiunti: (n, cat) => `Aggiunti ${n} canali. <a class="link" href="#/c/${cat}">Apri la sezione →</a> I video arrivano subito; nell'indice e nella ricerca entro un'ora circa.`,
    cercaAltri: "cerca altri canali", togliArg: "togli argomento", spostaIn: "sposta in…", spostaAria: (n) => `Sposta ${n} in un'altra sezione`, togli: "togli",
    direttaIss: "● Diretta: la Terra dalla Stazione Spaziale (NASA)", direttaLichess: "● Diretta: la partita più forte in corso (Lichess)",
    tvCanale: "Canale TV", tuttoMescolato: "✦ Tutto mescolato", dirette: "Dirette", accendi: "▶ Accendi", tvSotto: "Video educativi uno dopo l'altro, senza consigli e senza Shorts.",
    posizione: "Posizione", prec: "Precedente", indietro: "Indietro 10 secondi", play: "Play/pausa", avanti: "Avanti 10 secondi", succ: "Successivo", audio: "Audio", schermoIntero: "Schermo intero",
    inDiretta: "In diretta: i comandi sono nel riquadro.", salvatoTv: "★ salvato", salvaTv: "☆ da vedere", dopo: "Dopo:",
    tvSpenta: "La TV si è spenta col timer. Buonanotte.", riaccendi: "▶ Riaccendi", accendo: "Accendo…", nessunVideo: "Nessun video per questa scelta.",
    cercaPh: "Cerca fra i video…", lingueVideo: "Lingua dei video", tutte: "Tutte",
    piede: "Video dai canali ufficiali, scelti a mano. Niente pubblicità in pagina, niente Shorts, niente consigli automatici.",
    impostazioni: "Impostazioni", linguaUi: "Lingua dell'interfaccia", tema: "Tema", auto: "Automatico", chiaro: "Chiaro", scuro: "Scuro",
    videoPrec: "Video precedente", videoSucc: "Video successivo",
    mia: "La mia Lavagna", account: "Account", ciao: (n) => `Ciao, ${n}`, esciConto: "Esci", cancellaConto: "Cancella il mio account",
    cancellaConferma: "Cancello il tuo account, la tua passkey e tutto ciò che hai aggiunto? Non si può annullare.",
    creaConto: "Crea account", entraPasskey: "Entra con la passkey", tuoNome: "Il tuo nome o un nomignolo",
    passkeySpiega: "Niente email, niente password: entri con Face ID, Touch ID, l'impronta o una chiave di sicurezza (una passkey).",
    passkeyNo: "Questo browser non supporta le passkey.", passkeyAnnullata: "Annullato. Riprova quando vuoi.",
    passkeyErrore: "La passkey non ha funzionato. Riprova.", troppe: "Troppi account da questa connessione oggi. Riprova domani.",
    miaSotto: "I tuoi canali e argomenti, in aggiunta a quelli di tutti. Li vedi solo tu.",
    miaVuota: "Entra per aggiungere i tuoi canali e argomenti.",
    aggiungiCanale: "Aggiungi un canale", mieiArgomenti: "I miei argomenti", mieiCanali: "I miei canali", nessunMio: "Ancora niente.",
    mioTag: "mio", inArgomento: "in", entraPrima: "Prima entra.",
    cookieTesto: "Lavagna non ha pubblicità né tracciamento. Le tue preferenze (lingua, tema, da vedere) restano sul tuo dispositivo. Quando avvii un video, la sua piattaforma (il lettore a privacy avanzata di YouTube, Vimeo e altre) può usare i suoi cookie. I caratteri arrivano da Google Fonts, che vede il tuo indirizzo IP: con «Solo essenziali» si usano quelli del tuo dispositivo.",
    cookieTutti: "Accetta tutti", cookieEssenziali: "Solo essenziali", cookieInfo: "Privacy", cookieImpostazioni: "Impostazioni cookie",
    esternoTesto: (f) => `Questo video è riprodotto da ${f}, che può usare cookie. Hai scelto solo i cookie essenziali.`,
    esternoUnaVolta: "▶ Guarda questo video", esternoSempre: "Consenti sempre",
    privacyTitolo: "Privacy",
    privacyCorpo: `<p><b>Niente pubblicità, niente tracciamento, niente profili.</b> Lavagna non usa cookie di statistica, pubblicità o tracciamento.</p>
      <p><b>Account facoltativo, con passkey.</b> Se lo crei, salviamo solo un id casuale, il nome che scegli, la chiave pubblica della tua passkey e i canali e argomenti che aggiungi. Niente email, niente password. Un cookie d'accesso ti tiene collegato; «Cancella il mio account» cancella tutto. La libreria delle passkey si carica da jsDelivr solo quando ti registri o entri.</p>
      <p><b>Sul tuo dispositivo.</b> Lingua, tema, filtro della lingua dei video, velocità e lista «Da vedere» sono salvati nella memoria locale del browser. Non lasciano mai il tuo dispositivo e puoi cancellarli quando vuoi dal browser.</p>
      <p><b>Piattaforme video.</b> I video sono riprodotti dalle loro piattaforme (YouTube con il lettore a privacy avanzata youtube-nocookie.com, Vimeo, Internet Archive, PeerTube). Quando avvii un video, la piattaforma può usare i suoi cookie e riceve il tuo indirizzo IP, secondo la sua informativa. Le miniature sono immagini servite dalle piattaforme.</p>
      <p><b>Caratteri, solo col tuo consenso.</b> Con «Accetta tutti» i caratteri arrivano da Google Fonts, che vede il tuo indirizzo IP. Con «Solo essenziali» si usano quelli del tuo dispositivo.</p>
      <p><b>Server.</b> Il sito gira su Cloudflare, che tratta i dati tecnici di base (come l'indirizzo IP) per consegnare le pagine. Lavagna non tiene registri di chi guarda cosa.</p>
      <p>Puoi cambiare scelta quando vuoi con «Impostazioni cookie» in fondo alla pagina.</p>`,
  },
};
let ui = memo.get("ui", "en");
const t = (k, ...a) => { const v = T[ui]?.[k] ?? T.en[k] ?? k; return typeof v === "function" ? v(...a) : v; };
// nomi degli argomenti in inglese (quelli creati dal sito restano come scritti)
const NOMI_EN = { scienza: "Science", matematica: "Maths", scacchi: "Chess", dibattiti: "Debates", storia: "History", filosofia: "Philosophy",
  ingegneria: "Engineering", tech: "Tech", auto: "Cars", food: "Food", attualita: "Current affairs", documentari: "Documentaries",
  arte: "Art & architecture", musica: "Music", economia: "Economics", cinema: "Film", diritto: "Law & institutions", fashion: "Fashion", lezioni: "Lectures" };
const nomeDi = (c) => (ui === "en" && NOMI_EN[c?.id]) || c?.nome || "";
const numero = (x) => x.toLocaleString(ui === "it" ? "it-IT" : "en-GB");

// ——— consenso ai cookie (regole europee) ———
// "tutti": caratteri di Google e lettori esterni senza chiedere; "essenziali": niente caratteri esterni, ogni video chiede prima.
// Finché non si sceglie, vale "essenziali".
const consenso = () => memo.get("consenso", "");
const esterniOk = () => consenso() === "tutti";
function caricaCaratteri() {
  if (!esterniOk() || document.getElementById("caratteri")) return;
  const l = document.createElement("link");
  l.id = "caratteri"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Inter:wght@400;500;600&display=swap";
  document.head.appendChild(l);
}
function mostraCookie() {
  const b = $("#cookie");
  b.innerHTML = `<p>${t("cookieTesto")}</p><div class="cookie-bott">
    <button class="bott on" id="cTutti">${t("cookieTutti")}</button><button class="bott" id="cEssenziali">${t("cookieEssenziali")}</button>
    <a class="link" href="#/privacy">${t("cookieInfo")}</a></div>`;
  b.hidden = false;
  const scegli = (v) => { memo.set("consenso", v); b.hidden = true; caricaCaratteri(); if (v === "tutti" && /^#\/(v\/|tv)/.test(location.hash)) rotta(); };
  $("#cTutti").onclick = () => scegli("tutti");
  $("#cEssenziali").onclick = () => scegli("essenziali");
}
// con «solo essenziali», prima di aprire un lettore esterno si chiede: una volta, o sempre
// (scelta dell'utente, 19 nov 2026: i video partono sempre senza chiedere; il consenso vale solo per i caratteri di Google)
function chiediEsterno(dove, fonte) {
  return Promise.resolve(true);
  // eslint-disable-next-line no-unreachable
  return new Promise((ok) => {
    const box = document.createElement("div");
    box.className = "tv-copri esterno";
    box.innerHTML = `<p>${t("esternoTesto", fonte)}</p><div class="cookie-bott">
      <button class="tv-accendi" data-una>${t("esternoUnaVolta")}</button><button class="bott" data-sempre>${t("esternoSempre")}</button></div>`;
    dove.appendChild(box);
    box.querySelector("[data-una]").onclick = () => { box.remove(); ok(true); };
    box.querySelector("[data-sempre]").onclick = () => { memo.set("consenso", "tutti"); caricaCaratteri(); box.remove(); ok(true); };
  });
}
const nomeFonte = (v) => ({ ia: "Internet Archive", vimeo: "Vimeo", pt: "PeerTube" })[v?.fonte] || "YouTube";

const visti = new Set(memo.get("visti", []));
let salvati = memo.get("salvati", []); // video interi, così si vedono anche dopo che escono dal feed

const cacheCat = new Map();
let categorie = [], categorieTutti = [];
let io = null; // { nome, canali, argomenti } quando sei entrato
// le categorie di tutti, più (solo per te) i tuoi canali e i tuoi argomenti
function unisciMiei() {
  const base = categorieTutti.map((c) => ({ ...c, canali: [...c.canali] }));
  if (io) {
    for (const a of io.argomenti) base.push({ id: a.id, nome: a.nome, segno: a.segno, canali: [], creato: true, mio: true });
    for (const k of io.canali) base.find((c) => c.id === k.cat)?.canali.push({ id: k.id, nome: k.nome, lingua: k.lingua, mio: true });
  }
  categorie = base;
}
async function caricaIo() {
  try { const r = await fetch("/api/mio"); io = r.ok ? await r.json() : null; } catch { io = null; }
  unisciMiei();
}

const esc = (s = "") => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const quando = (iso) => {
  const g = Math.floor((Date.now() - new Date(iso)) / 864e5);
  if (g < 1) return t("oggi");
  if (g < 2) return t("ieri");
  if (g < 30) return t("giorni", g);
  if (g < 365) return t("mesi", Math.floor(g / 30));
  return t("anni", Math.floor(g / 365));
};
const viste = (n) => !n ? "" : t("viste", n);
const filtra = (v) => lingua === "tutte" ? v : v.filter((x) => x.lingua === lingua);
function mmss(s) {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${x}` : `${m}:${x}`;
}
const qui = (percorso) => decodeURIComponent(location.hash) === `#/${percorso}`;
const link = (percorso, id) => `#/${percorso}/${encodeURIComponent(id)}`;
const miniatura = (v) => v.thumb || `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`;
const nomeCat = (id) => nomeDi(categorie.find((c) => c.id === id));

async function prendi(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(r.status);
  return r.json();
}
async function categoria(id) {
  if (!cacheCat.has(id)) cacheCat.set(id, prendi(`/api/cat/${id}`).catch((e) => { cacheCat.delete(id); throw e; }));
  return cacheCat.get(id);
}
async function tutti() {
  const liste = await Promise.all(categorie.map((c) => categoria(c.id).catch(() => [])));
  const visti = new Set();
  return liste.flat().filter((v) => !visti.has(v.id) && visti.add(v.id)).sort((a, b) => b.data.localeCompare(a.data));
}
const mostrati = new Map(); // video già passati a schermo: aprirli non richiede di ricaricare nulla
// l'elenco da cui hai aperto un video: dà l'ordine alle frecce «precedente / successivo» del lettore
let sequenza = [];
const idDaLink = (a) => decodeURIComponent((a.getAttribute("href") || "").replace(/^#\/v\//, ""));
document.addEventListener("click", (e) => {
  const a = e.target.closest("a.vid");
  const box = a?.closest(".griglia, .lato");
  if (box) sequenza = [...box.querySelectorAll("a.vid")].map(idDaLink).filter((x) => x && !x.startsWith("http"));
}, true);
async function trova(id) {
  if (mostrati.has(id)) return mostrati.get(id);
  for (const p of cacheCat.values()) { const v = (await p.catch(() => [])).find((x) => x.id === id); if (v) return v; }
  return salvati.find((x) => x.id === id) || (await tutti()).find((x) => x.id === id);
}

const scheda = (v, etichetta = true) => `
  <a class="vid${visti.has(v.id) ? " gia" : ""}" ${v.fonte === "rai" ? `href="${esc(v.link)}" target="_blank" rel="noopener"` : `href="${link("v", v.id)}"`}>
    <div class="pol">
      <img loading="lazy" src="${esc(miniatura(v))}" alt="">
      ${etichetta ? `<span class="etic">${esc(nomeCat(v.cat))}</span>` : ""}
      ${visti.has(v.id) ? '<span class="visto"></span>' : ""}
      ${v.fonte === "rai" ? '<span class="fuori">RaiPlay ↗</span>' : ""}
      ${v.durata && v.fonte !== "rai" ? `<span class="dur">${mmss(v.durata)}</span>` : ""}
    </div>
    <div>
      <h3>${esc(v.titolo)}</h3>
      <div class="meta">${esc(v.nomeCanale)} · ${quando(v.data)}${v.viste ? " · " + viste(v.viste) : ""}</div>
    </div>
  </a>`;

const griglia = (lista, etichetta = true) => (lista.forEach((v) => mostrati.set(v.id, v)), lista.length)
  ? `<div class="griglia">${lista.map((v) => scheda(v, etichetta)).join("")}</div>`
  : `<p class="vuoto">${t("vuoto", lingua !== "tutte")}</p>`;
const attesa = () => `<div class="griglia">${Array.from({ length: 12 }, () => '<div class="vid carica"><div class="pol"></div><h3></h3></div>').join("")}</div>`;

// Argomenti raggruppati: i gruppi sono solo per l'occhio, gli argomenti creati dal sito vanno in «I tuoi argomenti»
const GRUPPI = [
  ["Scienze e tecnica", ["scienza", "matematica", "ingegneria", "tech", "lezioni"]],
  ["Storia e idee", ["storia", "filosofia", "dibattiti", "diritto", "documentari"]],
  ["Società", ["attualita", "economia"]],
  ["Arti", ["arte", "musica", "cinema", "fashion"]],
  ["Tempo libero", ["scacchi", "auto", "food"]],
];
function gruppiArgomenti() {
  const usati = new Set(GRUPPI.flatMap(([, ids]) => ids));
  const g = GRUPPI.map(([nome, ids]) => [nome, ids.map((id) => categorie.find((c) => c.id === id)).filter(Boolean)]);
  const altri = categorie.filter((c) => !usati.has(c.id));
  if (altri.length) g.push([altri.some((c) => c.creato) ? "I tuoi argomenti" : "Altri", altri]);
  g.forEach((x) => { x[0] = t("gruppi")[x[0]] || x[0]; });
  return g.filter(([, l]) => l.length);
}
const riquadro = (c) => `<a class="arg" href="#/c/${c.id}"><span class="arg-segno">${c.segno}</span>
  <span class="arg-nome">${esc(nomeDi(c))}</span><span class="arg-n">${t("nCanali", c.canali.length)}</span></a>`;
const griglieArgomenti = () => gruppiArgomenti().map(([nome, l]) =>
  `<div class="arg-gruppo"><h3>${nome}</h3><div class="arg-griglia">${l.map(riquadro).join("")}</div></div>`).join("");

function schede(attiva) {
  const cat = attiva.startsWith("c/") ? categorie.find((c) => `c/${c.id}` === attiva) : null;
  const voce = (h, n, s) => `<a href="#/${h}" class="${attiva === h ? "on" : ""}"><span class="s">${s}</span>${n}</a>`;
  $("#schede").innerHTML = voce("", t("tutto"), "✦")
    + `<button class="arg-apri${cat ? " on" : ""}" id="apriArgomenti" aria-expanded="false" aria-controls="argomenti">
        <span class="s">${cat ? cat.segno : "▦"}</span>${cat ? esc(nomeDi(cat)) : t("argomenti")} <span class="freccia">▾</span></button>`
    + voce("tv", t("tv"), "▶") + voce("esplora", t("esplora"), "⌕") + voce("salvati", t("daVedere"), "★")
    + (io ? voce("mia", t("mia"), "◎") : "") + voce("canali", t("canali"), "+");
  const pannello = $("#argomenti");
  pannello.hidden = true;
  $("#apriArgomenti").onclick = (e) => {
    e.stopPropagation();
    const apri = pannello.hidden;
    if (apri) pannello.innerHTML = `<div class="arg-dentro">${griglieArgomenti()}</div>`;
    pannello.hidden = !apri;
    $("#apriArgomenti").setAttribute("aria-expanded", String(apri));
  };
}
// il pannello si chiude cliccando fuori, con Esc o scegliendo un argomento
document.addEventListener("click", (e) => { const p = $("#argomenti"); if (p && !p.hidden && !e.target.closest(".arg-dentro")) p.hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const p = $("#argomenti"); if (p) p.hidden = true; } });

// ——— viste ———
// La home: 3 in evidenza, 4 novità, poi una fila da 5 per ogni sezione
async function home() {
  schede("");
  const canali = categorie.reduce((n, c) => n + c.canali.length, 0);
  const scheletro = (n, cls) => `<div class="griglia ${cls}">${Array.from({ length: n }, () => '<div class="vid carica"><div class="pol"></div><h3></h3></div>').join("")}</div>`;
  vista.innerHTML = `<div class="home">${scheletro(3, "g3")}${scheletro(4, "g4")}${scheletro(5, "g5")}</div>`;
  let d;
  try { d = await prendi(`/api/home?lingua=${lingua === "tutte" ? "" : lingua}`); } catch { d = null; }
  if (location.hash.replace(/^#\/?/, "") !== "") return;
  if (!d) { vista.innerHTML = `<p class="vuoto">${t("homeErrore")}</p>`; return; }
  [...d.evidenza, ...d.novita, ...d.sezioni.flatMap((s) => s.video)].forEach((v) => mostrati.set(v.id, v));
  const tre = mescola([...d.evidenza]).slice(0, 3); // in evidenza: 3 diversi a ogni caricamento
  const grande = (v) => scheda(v).replace("</h3>", `</h3><p class="estratto">${esc((v.descrizione || "").split("\n")[0].slice(0, 160))}</p>`);
  vista.innerHTML = `<div class="home">
    <section class="fila"><div class="fila-testa"><h2>${t("evidenza")}</h2><span>${t("evidenzaSotto")}</span></div>
      <div class="griglia g3 evidenza">${tre.map(grande).join("")}</div></section>
    <nav class="arg-riga" aria-label="${t("argomenti")}">${categorie.map((c) =>
      `<a href="#/c/${c.id}"><span>${c.segno}</span>${esc(nomeDi(c))}</a>`).join("")}</nav>
    <section class="fila"><div class="fila-testa"><h2>${t("novita")}</h2><span>${t("novitaSotto")}</span></div>
      <div class="griglia g4">${d.novita.map((v) => scheda(v)).join("")}</div></section>
    ${d.sezioni.map((s) => `<section class="fila"><div class="fila-testa"><h2><a href="#/c/${s.id}">${s.segno} ${esc(nomeDi(s))}</a></h2>
      <a class="tutti" href="#/c/${s.id}">${t("vediTutto")}</a></div>
      <div class="griglia g5">${s.video.map((v) => scheda(v, false)).join("")}</div></section>`).join("")}
    <p class="sotto fine-home">${t("fineHome", canali)}</p>
  </div>`;
}

async function vistaCategoria(id) {
  const c = categorie.find((x) => x.id === id);
  if (!c) return home();
  schede(`c/${id}`);
  const canali = c.canali.filter((x) => lingua === "tutte" || x.lingua === lingua);
  const testa = `<h1>${c.segno} ${esc(nomeDi(c))}</h1>
    <div class="canalini">${canali.map((x) => `<a href="${link("ch", x.id)}"${x.mio ? ' class="mio"' : ""}>${esc(x.nome)} <small>${x.lingua.toUpperCase()}</small></a>`).join("")}</div>`;
  vista.innerHTML = testa + attesa();
  try {
    const haMiei = c.canali.some((x) => x.mio);
    const [tuttiV, mieiV] = await Promise.all([
      c.mio ? [] : categoria(id),
      haMiei ? fetch(`/api/mio/feed?cat=${encodeURIComponent(id)}`).then((r) => (r.ok ? r.json() : [])).catch(() => []) : [],
    ]);
    const v = [...tuttiV, ...mieiV].sort((a, b) => b.data.localeCompare(a.data));
    if (!qui(`c/${id}`)) return;
    vista.innerHTML = testa + griglia(filtra(v), false);
  } catch { vista.innerHTML = testa + `<p class="vuoto">${t("feedErrore")}</p>`; }
}

async function vistaCanale(id) {
  const c = categorie.flatMap((k) => k.canali.map((x) => ({ ...x, cat: k }))).find((x) => x.id === id);
  if (!c) return home();
  schede(`c/${c.cat.id}`);
  const testa = `<h1>${esc(c.nome)}</h1><p class="sotto">${c.cat.segno} ${esc(nomeDi(c.cat))} · ${c.lingua === "it" ? t("italiano") : t("inglese")} · ${t("ultimiPubblicati")}</p>`;
  vista.innerHTML = testa + attesa();
  const v = c.mio
    ? (await fetch(`/api/mio/feed?cat=${encodeURIComponent(c.cat.id)}`).then((r) => r.json()).catch(() => [])).filter((x) => x.canale === id)
    : await prendi(`/api/canale/${encodeURIComponent(id)}`).catch(() => []);
  if (!qui(`ch/${id}`)) return;
  vista.innerHTML = testa + griglia(v, false);
}

// Ricerca nell'indice del server: a parole e per significato, con filtri
let filtriCerca = memo.get("filtri", { cat: "", durata: "", fonte: "", ordine: "data" });
const FONTI = () => [["", t("tutteFonti")], ["yt", "YouTube"], ["ia", "Internet Archive"], ["vimeo", "Vimeo"], ["pt", "PeerTube"]];
const DURATE = () => [["", t("qualsiasiDurata")], ["breve", t("brevi")], ["medio", t("medi")], ["lungo", t("lunghi")]];

async function vistaCerca(q = "") {
  schede(q ? "-" : "esplora");
  $("#q").value = q;
  const opz = (lista, scelto) => lista.map(([v, n]) => `<option value="${v}"${v === scelto ? " selected" : ""}>${n}</option>`).join("");
  vista.innerHTML = `<h1>${q ? `«${esc(q)}»` : t("esploraTitolo")}</h1>
    <form class="filtri" id="filtri">
      <select name="cat" aria-label="${t("sezione")}">${opz([["", t("tutteSezioni")], ...categorie.map((c) => [c.id, `${c.segno} ${esc(nomeDi(c))}`])], filtriCerca.cat)}</select>
      <select name="durata" aria-label="${t("durata")}">${opz(DURATE(), filtriCerca.durata)}</select>
      <select name="fonte" aria-label="${t("fonte")}">${opz(FONTI(), filtriCerca.fonte)}</select>
      ${q ? "" : `<select name="ordine" aria-label="${t("ordine")}">${opz([["data", t("recenti")], ["viste", t("piuVisti")]], filtriCerca.ordine)}</select>`}
    </form>
    <div id="esiti">${attesa()}</div>`;
  $("#filtri").onchange = (e) => {
    filtriCerca = { ...filtriCerca, [e.target.name]: e.target.value };
    memo.set("filtri", filtriCerca);
    vistaCerca(q);
  };
  const par = new URLSearchParams({ q, ...filtriCerca, lingua: lingua === "tutte" ? "" : lingua });
  let d;
  try { d = await prendi(`/api/cerca?${par}`); } catch { d = null; }
  if (!qui(q ? `cerca/${q}` : "esplora")) return;
  if (!d) { $("#esiti").innerHTML = `<p class="vuoto">${t("cercaErrore")}</p>`; return; }
  const n = numero;
  const quota = d.totale ? Math.min(100, Math.round((d.conVettore / d.totale) * 100)) : 0;
  let html = `<p class="sotto">${t("cercoIn", n(d.totale))}</p>`;
  if (!q) html += griglia(d.parole);
  else {
    html += `<h2 class="blocco">${t("conParole")} <small>${d.parole.length}</small></h2>` + (d.parole.length ? griglia(d.parole) : `<p class="vuoto">${t("nessunaParola")}</p>`);
    html += `<h2 class="blocco">${t("stessoTema")} <small>${t("stessoTemaSotto")}</small></h2>
      <p class="stato-significato"><span class="barra"><span style="width:${quota}%"></span></span>
      ${d.conVettore >= d.totale ? t("tutti", n(d.totale))
        : d.conVettore >= d.maxVettori ? t("massimo", n(d.conVettore), n(d.totale))
        : t("impara", n(d.conVettore), n(d.totale))}</p>`;
    html += d.significato.length ? griglia(d.significato)
      : `<p class="vuoto">${d.erroreSignificato ? t("significatoErrore") : t("nessunVicino")}</p>`;
  }
  $("#esiti").innerHTML = html;
}

// ——— lettori per le diverse fonti ———
const iframe = (src) => `<iframe src="${esc(src)}" title="Video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
async function fileArchive(v) {
  const r = await prendi(`/api/file/ia/${encodeURIComponent(v.id.slice(3))}`);
  return r.url;
}
// pagina del video: il lettore della fonte, con i suoi comandi
async function lettoreSemplice(v, dove) {
  if (v.fonte === "ia") {
    try {
      const url = await fileArchive(v);
      dove.innerHTML = `<video src="${esc(url)}" poster="${esc(miniatura(v))}" controls autoplay playsinline></video>`;
    } catch { dove.innerHTML = `<p class="vuoto">${t("fileMancante")}</p>`; }
  } else if (v.fonte === "vimeo") dove.innerHTML = iframe(`${v.embed}${v.embed.includes("?") ? "&" : "?"}autoplay=1&dnt=1`);
  else if (v.fonte === "pt") dove.innerHTML = iframe(`${v.embed}?autoplay=1&warningTitle=0`);
}

// Barra sotto il lettore: velocità (1× … 2×) e timer di spegnimento
const VELOCITA = [1, 1.25, 1.5, 1.75, 2];
const virgola = (r) => (ui === "it" ? String(r).replace(".", ",") : String(r)) + "×";
const opzioniTimer = () => `<option value="0">${t("timerSpento")}</option><option value="15">15 min</option><option value="30">30 min</option>
  <option value="45">45 min</option><option value="60">${t("ora1")}</option><option value="90">${t("ora15")}</option>
  <option value="120">${t("ore2")}</option><option value="fine">${t("fineVideo")}</option>`;
function barraVideo(dove, lettore, schermo) {
  let alle = 0, allaFine = false, giro = null;
  dove.innerHTML = `<div class="vel" role="group" aria-label="${t("velocita")}">${VELOCITA.map((r) =>
      `<button data-r="${r}" class="${r === memo.get("velocita", 1) ? "on" : ""}">${virgola(r)}</button>`).join("")}</div>
    <label class="tv-timer">⏾ <select aria-label="${t("timer")}">${opzioniTimer()}</select><span class="resta"></span></label>`;
  const sel = dove.querySelector("select"), resta = dove.querySelector(".resta");
  dove.querySelectorAll(".vel button").forEach((b) => b.onclick = () => {
    const r = Number(b.dataset.r);
    memo.set("velocita", r);
    lettore()?.velocita?.(r);
    dove.querySelectorAll(".vel button").forEach((x) => x.classList.toggle("on", x === b));
  });
  const spegni = () => {
    try { lettore()?.pause(); } catch {}
    alle = 0; allaFine = false; sel.value = "0"; resta.textContent = "";
    const s = schermo();
    if (s && !s.querySelector(".spento")) {
      s.insertAdjacentHTML("beforeend", `<div class="tv-copri spento"><button class="tv-accendi">${t("riprendi")}</button><p>${t("spentoTimer")}</p></div>`);
      s.querySelector(".spento button").onclick = () => { s.querySelector(".spento").remove(); lettore()?.play(); };
    }
  };
  sel.onchange = () => {
    allaFine = sel.value === "fine";
    alle = sel.value !== "0" && !allaFine ? Date.now() + Number(sel.value) * 60000 : 0;
    resta.textContent = allaFine ? t("spegneFine") : "";
  };
  giro = setInterval(() => {
    if (alle) { const r = (alle - Date.now()) / 1000; if (r <= 0) spegni(); else resta.textContent = t("spegneTra", mmss(r)); }
    if (allaFine) { const l = lettore(); const d = l?.durata?.() || 0; if (d && l.tempo() >= d - 1) spegni(); }
  }, 500);
  return {
    attiva: (si) => dove.querySelector(".vel").classList.toggle("spenta", !si),
    chiudi: () => clearInterval(giro),
  };
}

function vistaSalvati() {
  schede("salvati");
  vista.innerHTML = `<h1>★ ${t("daVedere")}</h1><p class="sotto">${t("daVedereSotto")}</p>` + griglia(salvati);
}

async function vistaVideo(id) {
  schede("-");
  vista.innerHTML = `<div class="guarda"><div><div class="schermo" id="schermo"></div>
    <div class="comandi-video" id="comandi"></div>
    <div id="info"></div></div><aside class="lato" id="lato"></aside></div>`;
  window.scrollTo(0, 0);
  visti.add(id); memo.set("visti", [...visti].slice(-2000));
  const yt = !/^(ia|vm|pt|rai):/.test(id);
  let lettore = null, chiuso = false;
  const cb = { fine() {}, errore() {}, stato() {} };
  const comandi = barraVideo($("#comandi"), () => lettore, () => $("#schermo"));
  pulisci = () => { chiuso = true; comandi.chiudi(); try { lettore?.chiudi(); } catch {} };
  const pronto = (l) => { if (chiuso) { l.chiudi(); return; } lettore = l; l.velocita?.(memo.get("velocita", 1)); comandi.attiva(!!l.velocita); };
  const permesso = chiediEsterno($("#schermo"), yt ? "YouTube" : nomeFonte({ fonte: id.split(":")[0] === "vm" ? "vimeo" : id.split(":")[0] }));
  if (yt) permesso.then(() => !chiuso && lettoreYT($("#schermo"), id, memo.get("tvVol", 80), cb, true).then(pronto)).catch(() => {});
  const v = await trova(id);
  if (!qui(`v/${id}`)) return;
  if (!v) { if (!yt) $("#schermo").innerHTML = `<p class="vuoto">${t("nonTrovato")}</p>`; return; }
  if (!yt) await permesso;
  if (chiuso) return;
  if (v.fonte === "ia") {
    try { pronto(lettoreFile($("#schermo"), await fileArchive(v), miniatura(v), 100, cb, true)); }
    catch { $("#schermo").innerHTML = `<p class="vuoto">${t("fileMancante")}</p>`; }
  } else if (v.fonte === "vimeo") pronto(await lettoreVimeo($("#schermo"), v.embed, 100, cb, true));
  else if (v.fonte === "pt") { await lettoreSemplice(v, $("#schermo")); comandi.attiva(false); } // PeerTube: velocità dal suo menu
  document.title = `${v.titolo} — Lavagna`;
  // frecce: ordine dell'elenco da cui sei arrivato, altrimenti i video dello stesso argomento
  const elencoFrecce = sequenza.includes(id) ? sequenza : filtra(await categoria(v.cat).catch(() => [])).map((x) => x.id);
  const i = elencoFrecce.indexOf(id);
  const prec = i > 0 ? elencoFrecce[i - 1] : null, succ = i >= 0 && i < elencoFrecce.length - 1 ? elencoFrecce[i + 1] : null;
  if (!qui(`v/${id}`)) return;
  if (!elencoFrecce.includes(id)) sequenza = elencoFrecce;
  $("#schermo").insertAdjacentHTML("beforeend",
    (prec ? `<a class="freccia sx" href="${link("v", prec)}" title="${t("videoPrec")}" aria-label="${t("videoPrec")}">‹</a>` : "")
    + (succ ? `<a class="freccia dx" href="${link("v", succ)}" title="${t("videoSucc")}" aria-label="${t("videoSucc")}">›</a>` : ""));
  const salvato = () => salvati.some((x) => x.id === id);
  const disegna = () => {
    $("#info").innerHTML = `<h1>${esc(v.titolo)}</h1>
      <div class="riga"><a class="can" href="${link("ch", v.canale)}">${esc(v.nomeCanale)}</a><span>${quando(v.data)}</span>
      ${v.viste ? `<span>${viste(v.viste)}</span>` : ""}<a href="#/c/${v.cat}">${esc(nomeCat(v.cat))}</a>
      <button class="bott${salvato() ? " on" : ""}" id="salva">${salvato() ? t("salvato") : t("salva")}</button></div>
      ${v.descrizione ? `<div class="descr">${esc(v.descrizione)}</div>` : ""}`;
    $("#salva").onclick = () => {
      salvati = salvato() ? salvati.filter((x) => x.id !== id) : [v, ...salvati];
      memo.set("salvati", salvati); disegna();
    };
  };
  disegna();
  const stessoCanale = (await categoria(v.cat).catch(() => [])).filter((x) => x.canale === v.canale && x.id !== id).slice(0, 6);
  const stessaCat = filtra(await categoria(v.cat).catch(() => [])).filter((x) => x.canale !== v.canale).slice(0, 8);
  if (!qui(`v/${id}`)) return;
  $("#lato").innerHTML = (stessoCanale.length ? `<h2>${t("stessoCanale")}</h2>${stessoCanale.map((x) => scheda(x, false)).join("")}` : "")
    + (stessaCat.length ? `<h2 style="margin-top:22px">${t("altroIn", esc(nomeCat(v.cat)))}</h2>${stessaCat.map((x) => scheda(x, false)).join("")}` : "");
}

// ——— gestione dei canali ———
let password = memo.get("password", "");
async function gestione(azione, corpo = {}) {
  const r = await fetch(`/api/gestione/${azione}`, {
    method: "POST", headers: { "content-type": "application/json", "x-password": password }, body: JSON.stringify(corpo),
  });
  const d = await r.json().catch(() => ({}));
  if (r.status === 401) { password = ""; memo.set("password", ""); }
  if (!r.ok) throw new Error(d.errore || t("qualcosa"));
  return d;
}
async function ricarica() {
  categorieTutti = await prendi("/api/categorie");
  await caricaIo();
  cacheCat.clear();
}

async function vistaCanali() {
  schede("canali");
  const loggato = password && await gestione("prova").then(() => true, () => false);
  if (!loggato) {
    vista.innerHTML = `<h1>${t("canali")}</h1><p class="sotto">${t("servePassword")}</p>
      <form class="pannello" id="entra"><input type="password" id="pw" placeholder="Password" autocomplete="current-password" required>
      <button class="bott on">${t("entra")}</button><span class="msg" id="msg"></span></form>${elencoCanali(false)}`;
    $("#entra").onsubmit = async (e) => {
      e.preventDefault();
      password = $("#pw").value;
      try { await gestione("prova"); memo.set("password", password); vistaCanali(); }
      catch (err) { $("#msg").textContent = err.message; }
    };
    return;
  }
  vista.innerHTML = `<h1>${t("canali")}</h1><p class="sotto">${t("modifichePerTutti")} <button class="link" id="esci">${t("esci")}</button></p>
    <form class="pannello" id="trova">
      <input id="testo" placeholder="${t("linkCanale")}" required>
      <button class="bott on">${t("cerca")}</button>
      <span class="msg" id="msg"></span>
    </form>
    <div id="trovato"></div>
    <section class="nuovo-argomento">
      <h2>${t("nuovoArgomento")}</h2>
      <p class="sotto">${t("nuovoSotto")}</p>
      <form class="pannello" id="argomento">
        <input name="segno" class="segno" placeholder="◆" maxlength="2" aria-label="${t("simbolo")}">
        <input name="nome" placeholder="${t("nomeEs")}" required aria-label="${t("nomeArg")}">
        <input name="it" placeholder="${t("paroleIt")}" aria-label="${t("paroleIt")}">
        <input name="en" placeholder="${t("paroleEn")}" aria-label="${t("paroleEn")}">
        <button class="bott on">${t("creaCerca")}</button>
      </form>
      <div id="candidati"></div>
    </section>
    <section id="proposte" class="proposte"><h2>${t("daProvare")}</h2><p class="sotto">${t("cerco")}</p></section>
    ${elencoCanali(true)}`;
  mostraProposte();
  $("#argomento").onsubmit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const box = $("#candidati");
    box.innerHTML = `<p class="sotto">${t("creoArg")}</p>`;
    try {
      const { id } = await gestione("argomento-crea", Object.fromEntries(f));
      await ricarica();
      await cercaCanaliPer(id, box);
    } catch (err) { box.innerHTML = `<p class="msg">${esc(err.message)}</p>`; }
  };
  vista.querySelectorAll("[data-cerca-per]").forEach((b) => b.onclick = () => {
    const box = b.closest(".gruppo").querySelector(".cerca-qui");
    cercaCanaliPer(b.dataset.cercaPer, box);
  });
  vista.querySelectorAll("[data-sposta]").forEach((sel) => sel.onchange = async () => {
    const cat = sel.value;
    if (!cat) return;
    const dove = categorie.find((k) => k.id === cat);
    if (!confirm(t("spostoConferma", sel.dataset.nome, `${dove.segno} ${nomeDi(dove)}`))) { sel.value = ""; return; }
    try { await gestione("sposta", { id: sel.dataset.sposta, cat }); await ricarica(); vistaCanali(); }
    catch (err) { alert(err.message); sel.value = ""; }
  });
  vista.querySelectorAll("[data-togli-argomento]").forEach((b) => b.onclick = async () => {
    if (!confirm(t("togliArgConferma", b.dataset.nome))) return;
    try { await gestione("argomento-togli", { id: b.dataset.togliArgomento }); await ricarica(); vistaCanali(); }
    catch (err) { alert(err.message); }
  });
  $("#esci").onclick = () => { password = ""; memo.set("password", ""); vistaCanali(); };
  $("#trova").onsubmit = async (e) => {
    e.preventDefault();
    $("#msg").textContent = t("cerco"); $("#trovato").innerHTML = "";
    try {
      const c = await gestione("risolvi", { testo: $("#testo").value });
      $("#msg").textContent = "";
      $("#trovato").innerHTML = `<div class="scheda-canale">
        <h2>${esc(c.nome)}</h2>
        ${c.gia ? `<p class="msg">${t("giaInElenco", esc(c.gia))}</p>` : `<p class="sotto">${c.quanti ? t("ultimiLunghi", c.quanti) : t("nessunLungo")}</p>`}
        <ul>${c.ultimi.map((v) => `<li>${esc(v.titolo)} <small>· ${quando(v.data)}</small></li>`).join("")}</ul>
        ${c.gia ? "" : `<form id="aggiungi" class="pannello">
          <input id="nome" value="${esc(c.nome)}" aria-label="${t("nome")}" required>
          <select id="cat" aria-label="${t("categoria")}">${categorie.map((k) => `<option value="${k.id}">${k.segno} ${esc(nomeDi(k))}</option>`).join("")}</select>
          <select id="lin" aria-label="${t("lingua")}"><option value="it">${t("italiano")}</option><option value="en">${t("inglese")}</option></select>
          <button class="bott on">${t("aggiungi")}</button></form>`}
      </div>`;
      if (!c.gia) $("#aggiungi").onsubmit = async (e) => {
        e.preventDefault();
        try {
          await gestione("aggiungi", { id: c.id, nome: $("#nome").value, cat: $("#cat").value, lingua: $("#lin").value });
          await ricarica(); vistaCanali();
        } catch (err) { $("#msg").textContent = err.message; }
      };
    } catch (err) { $("#msg").textContent = err.message; }
  };
  vista.querySelectorAll("[data-togli]").forEach((b) => b.onclick = async () => {
    if (!confirm(t("togliConferma", b.dataset.nome))) return;
    try { await gestione("togli", { id: b.dataset.togli }); await ricarica(); vistaCanali(); }
    catch (err) { alert(err.message); }
  });
}

// 10 proposte nuove a ogni visita della pagina
async function mostraProposte() {
  const box = $("#proposte");
  try {
    const { proposte } = await gestione("proposte");
    if (!box.isConnected) return;
    if (!proposte.length) { box.innerHTML = `<h2>${t("daProvare")}</h2><p class="sotto">${t("nessunaProposta")}</p>`; return; }
    box.innerHTML = `<h2>${t("daProvare")} <small>${t("proposteSotto")}</small></h2>
      <div class="prop-griglia">${proposte.map((p) => `<div class="prop" data-id="${p.id}">
        <div><strong>${esc(p.nome)}</strong> <small>${p.lingua.toUpperCase()}${p.fonte === "scoperto" ? t("trovatoOra") : ""}</small></div>
        <ul>${p.ultimi.map((v) => `<li>${esc(v.titolo)}</li>`).join("")}</ul>
        <div class="prop-azioni">
          <select aria-label="${t("categoria")}">${categorie.map((k) => `<option value="${k.id}"${k.id === p.cat ? " selected" : ""}>${k.segno} ${esc(nomeDi(k))}</option>`).join("")}</select>
          <button class="bott on" data-si>${t("aggiungi")}</button><button class="link" data-no>${t("noGrazie")}</button>
          <a class="link" href="https://www.youtube.com/channel/${p.id}" target="_blank" rel="noopener">${t("guarda")}</a>
        </div></div>`).join("")}</div>`;
    box.querySelectorAll(".prop").forEach((el) => {
      const p = proposte.find((x) => x.id === el.dataset.id);
      el.querySelector("[data-si]").onclick = async () => {
        try {
          await gestione("aggiungi", { id: p.id, nome: p.nome, lingua: p.lingua, cat: el.querySelector("select").value });
          el.innerHTML = `<div><strong>${esc(p.nome)}</strong> ${t("aggiunto")}</div>`;
          await ricarica();
        } catch (err) { alert(err.message); }
      };
      el.querySelector("[data-no]").onclick = async () => {
        await gestione("scarta", { id: p.id }).catch(() => {});
        el.remove();
      };
    });
  } catch (err) { box.innerHTML = `<h2>${t("daProvare")}</h2><p class="msg">${esc(err.message)}</p>`; }
}

// Prima ricerca di canali per un argomento: elenco da spuntare, poi «Aggiungi i selezionati»
// chiamate della «mia Lavagna» (col cookie d'accesso, niente password)
async function mio(azione, corpo = {}) {
  const r = await fetch(`/api/mio/${azione}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corpo) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(r.status === 401 ? t("entraPrima") : d.errore || t("qualcosa"));
  return d;
}
async function cercaCanaliPer(cat, box, chiama = gestione) {
  const c = categorie.find((x) => x.id === cat);
  box.innerHTML = `<p class="sotto">${t("cercoCanaliIt", esc(nomeDi(c) || cat))}</p>`;
  try {
    // due passate: ricerche in italiano, poi in inglese (ognuna controlla fino a 43 canali)
    const a = await chiama("argomento-cerca", { id: cat, parte: 0 });
    box.querySelector("p").textContent = t("trovatiIt", a.candidati.length);
    const b = await chiama("argomento-cerca", { id: cat, parte: 1 }).catch(() => ({ candidati: [] }));
    const candidati = [...a.candidati, ...b.candidati.filter((x) => !a.candidati.some((y) => y.id === x.id))];
    if (!candidati.length) { box.innerHTML = `<p class="sotto">${t("nessunCanale")}</p>`; return; }
    const n = (x) => x >= 1e6 ? t("milioni", x) : x >= 1e3 ? `${Math.round(x / 1e3)}k` : String(x);
    box.innerHTML = `<div class="candidati">
      <p class="sotto">${t("trovati", candidati.length, esc(nomeDi(c) || cat))}</p>
      <div class="prop-griglia">${candidati.map((k, i) => `<label class="prop cand">
        <span><input type="checkbox" data-i="${i}" checked> <strong>${esc(k.nome)}</strong> <small>${k.lingua.toUpperCase()} · ${t("vistaMedia", n(k.media))}</small></span>
        <ul>${k.ultimi.map((v) => `<li>${esc(v.titolo)}</li>`).join("")}</ul>
        <a class="link" href="https://www.youtube.com/channel/${k.id}" target="_blank" rel="noopener">${t("guardaCanale")}</a></label>`).join("")}</div>
      <p><button class="bott on" id="aggiungiScelti">${t("aggiungiScelti")}</button></p></div>`;
    box.querySelector("#aggiungiScelti").onclick = async () => {
      const scelti = [...box.querySelectorAll("input[data-i]:checked")].map((x) => candidati[Number(x.dataset.i)]);
      try {
        const r = await chiama("aggiungi-molti", { cat, canali: scelti.map(({ id, nome, lingua }) => ({ id, nome, lingua })) });
        await ricarica();
        box.innerHTML = `<p class="sotto">${t("aggiunti", r.aggiunti, cat)}</p>`;
      } catch (err) { alert(err.message); }
    };
  } catch (err) { box.innerHTML = `<p class="msg">${esc(err.message)}</p>`; }
}

function elencoCanali(modifica) {
  return categorie.map((c) => `<section class="gruppo"><h2>${c.segno} ${esc(nomeDi(c))} <small>${c.canali.length}</small>
    ${modifica ? `<button class="link" data-cerca-per="${c.id}">${t("cercaAltri")}</button>` : ""}
    ${modifica && c.creato ? `<button class="link" data-togli-argomento="${c.id}" data-nome="${esc(c.nome)}">${t("togliArg")}</button>` : ""}</h2>
    <div class="cerca-qui"></div>
    <ul>${c.canali.map((x) => `<li><a href="${link("ch", x.id)}">${esc(x.nome)}</a> <small>${x.lingua.toUpperCase()}</small>
      ${modifica ? `<select class="sposta" data-sposta="${x.id}" data-nome="${esc(x.nome)}" aria-label="${t("spostaAria", esc(x.nome))}">
        <option value="">${t("spostaIn")}</option>${categorie.filter((k) => k.id !== c.id).map((k) => `<option value="${k.id}">${k.segno} ${esc(nomeDi(k))}</option>`).join("")}</select>
        <button class="link" data-togli="${x.id}" data-nome="${esc(x.nome)}">${t("togli")}</button>` : ""}</li>`).join("")}</ul></section>`).join("");
}

// ——— TV: video uno dopo l'altro, da qualunque fonte ———
let pulisci = null; // chiamata quando si esce da una vista che ha timer o player
const script = {};
function caricaScript(src, pronto) {
  if (!script[src]) script[src] = new Promise((ok, ko) => {
    if (pronto) window[pronto] = ok;
    const el = document.createElement("script");
    el.src = src; el.onerror = ko;
    if (!pronto) el.onload = ok;
    document.head.appendChild(el);
  });
  return script[src];
}
const mescola = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Ogni lettore offre gli stessi comandi: play, pause, inCorso, tempo, durata, vai, volume, muto, muto?, chiudi.
// cb: { fine(), stato(inCorso), errore() }
async function lettoreYT(el, id, vol, cb, controlli = false) {
  await caricaScript("https://www.youtube.com/iframe_api", "onYouTubeIframeAPIReady");
  const box = document.createElement("div"); el.appendChild(box);
  return new Promise((ok) => {
    const p = new YT.Player(box, {
      host: "https://www.youtube-nocookie.com", videoId: id,
      playerVars: { autoplay: 1, rel: 0, playsinline: 1, controls: controlli ? 1 : 0, iv_load_policy: 3, disablekb: controlli ? 0 : 1, hl: ui, cc_lang_pref: ui, cc_load_policy: 0 },
      events: {
        onReady: (e) => { e.target.setVolume(vol); e.target.playVideo(); ok(l); },
        onStateChange: (e) => { cb.stato(e.data === YT.PlayerState.PLAYING); if (e.data === YT.PlayerState.ENDED) cb.fine(); },
        onError: () => { ok(l); cb.errore(); }, // video non incorporabile: si passa al prossimo
      },
    });
    const l = {
      play: () => p.playVideo(), pause: () => p.pauseVideo(), inCorso: () => p.getPlayerState?.() === YT.PlayerState.PLAYING,
      tempo: () => p.getCurrentTime?.() || 0, durata: () => p.getDuration?.() || 0, vai: (t) => p.seekTo(t, true),
      volume: (n) => { p.unMute(); p.setVolume(n); }, muto: (m) => (m ? p.mute() : p.unMute()), muto_: () => p.isMuted?.(),
      velocita: (r) => p.setPlaybackRate?.(r), chiudi: () => p.destroy(),
    };
  });
}
function lettoreFile(el, url, poster, vol, cb, controlli = false) {
  const vd = document.createElement("video");
  Object.assign(vd, { src: url, poster, autoplay: true, playsInline: true, volume: vol / 100, controls: controlli });
  let ritmo = 1;
  vd.onloadedmetadata = () => { vd.playbackRate = ritmo; };
  vd.onended = cb.fine; vd.onerror = cb.errore;
  vd.onplay = () => cb.stato(true); vd.onpause = () => cb.stato(false);
  el.appendChild(vd);
  vd.play().catch(() => {});
  return {
    play: () => vd.play(), pause: () => vd.pause(), inCorso: () => !vd.paused, tempo: () => vd.currentTime,
    durata: () => (isFinite(vd.duration) ? vd.duration : 0), vai: (t) => { vd.currentTime = t; },
    volume: (n) => { vd.muted = false; vd.volume = n / 100; }, muto: (m) => { vd.muted = m; }, muto_: () => vd.muted,
    velocita: (r) => { ritmo = r; vd.playbackRate = r; },
    chiudi: () => { vd.pause(); vd.removeAttribute("src"); vd.load(); vd.remove(); },
  };
}
async function lettoreVimeo(el, embed, vol, cb, controlli = false) {
  await caricaScript("https://player.vimeo.com/api/player.js");
  el.insertAdjacentHTML("beforeend", iframe(`${embed}${embed.includes("?") ? "&" : "?"}autoplay=1&dnt=1${controlli ? "" : "&controls=0"}`));
  const p = new Vimeo.Player(el.lastElementChild);
  let t = 0, d = 0, va = false, mu = false;
  p.on("timeupdate", (e) => { t = e.seconds; d = e.duration; });
  p.on("play", () => { va = true; cb.stato(true); }); p.on("pause", () => { va = false; cb.stato(false); });
  p.on("ended", cb.fine); p.on("error", cb.errore);
  p.setVolume(vol / 100).catch(() => {}); p.play().catch(() => {});
  return {
    play: () => p.play(), pause: () => p.pause(), inCorso: () => va, tempo: () => t, durata: () => d,
    vai: (s) => p.setCurrentTime(s), volume: (n) => { mu = false; p.setMuted(false); p.setVolume(n / 100); },
    muto: (m) => { mu = m; p.setMuted(m); }, muto_: () => mu, chiudi: () => p.destroy().catch(() => {}),
    velocita: (r) => p.setPlaybackRate(r).catch(() => {}), // Vimeo la permette solo su alcuni video
  };
}

const DIRETTE = [
  { id: "live:iss", get nome() { return t("direttaIss"); },
    src: async () => `https://www.youtube-nocookie.com/embed/${(await prendi("/api/diretta/iss")).id}?autoplay=1&mute=1&playsinline=1` },
  { id: "live:lichess", get nome() { return t("direttaLichess"); }, src: "https://lichess.org/tv/frame?theme=brown&bg=dark", quadrato: true },
];

async function vistaTV() {
  schede("tv");
  let canale = memo.get("tvCanale", "");
  vista.innerHTML = `<div class="tv">
    <div class="tv-testa">
      <h1>TV</h1>
      <select id="tvCanale" aria-label="${t("tvCanale")}"><option value="">${t("tuttoMescolato")}</option>
        ${categorie.map((c) => `<option value="${c.id}"${c.id === canale ? " selected" : ""}>${c.segno} ${esc(nomeDi(c))}</option>`).join("")}
        <optgroup label="${t("dirette")}">${DIRETTE.map((d) => `<option value="${d.id}"${d.id === canale ? " selected" : ""}>${d.nome}</option>`).join("")}</optgroup></select>
    </div>
    <div class="tv-schermo" id="tvSchermo">
      <div id="tvPlayer"></div>
      <div class="tv-copri" id="tvCopri"><button class="tv-accendi" id="tvAccendi">${t("accendi")}</button><p id="tvCopriTesto">${t("tvSotto")}</p></div>
    </div>
    <div class="tv-barra">
      <div class="tv-tempo" id="tvTempo"><span id="tvOra">0:00</span><input type="range" id="tvPos" min="0" max="1000" value="0" aria-label="${t("posizione")}"><span id="tvDurata">0:00</span></div>
      <div class="tv-comandi">
        <button id="tvPrec" title="${t("prec")}" aria-label="${t("prec")}">⏮</button>
        <button id="tvIndietro" title="${t("indietro")}" aria-label="${t("indietro")}">↺10</button>
        <button id="tvPlay" class="tv-grande" title="${t("play")}" aria-label="${t("play")}">▶</button>
        <button id="tvAvanti" title="${t("avanti")}" aria-label="${t("avanti")}">10↻</button>
        <button id="tvSucc" title="${t("succ")}" aria-label="${t("succ")}">⏭</button>
        <button id="tvMuto" title="${t("audio")}" aria-label="${t("audio")}">🔊</button>
        <input type="range" id="tvVol" min="0" max="100" value="${memo.get("tvVol", 80)}" aria-label="Volume">
        <button id="tvSchermoIntero" title="${t("schermoIntero")}" aria-label="${t("schermoIntero")}">⛶</button>
        <select id="tvVel" aria-label="${t("velocita")}">${VELOCITA.map((r) => `<option value="${r}"${r === memo.get("velocita", 1) ? " selected" : ""}>${virgola(r)}</option>`).join("")}</select>
        <label class="tv-timer">⏾ <select id="tvTimer" aria-label="${t("timer")}">${opzioniTimer()}</select>
          <span id="tvResta"></span></label>
      </div>
      <div class="tv-info" id="tvInfo"></div>
      <div class="tv-dopo" id="tvDopo"></div>
    </div>
  </div>`;

  let coda = [], pos = 0, lettore = null, acceso = false, giro = null, spegniAlle = 0, spegniAFine = false, turno = 0;
  const diretta = () => DIRETTE.find((d) => d.id === canale);
  const vol = () => Number($("#tvVol").value);

  async function preparaCoda() {
    if (diretta()) { coda = []; return; }
    const v = canale ? await categoria(canale) : await tutti();
    // PeerTube (niente comandi a distanza) e RaiPlay (si guarda solo sul loro sito) restano fuori dalla TV
    const lista = filtra(v).filter((x) => x.fonte !== "pt" && x.fonte !== "rai");
    coda = [...mescola(lista.filter((x) => !visti.has(x.id))), ...mescola(lista.filter((x) => visti.has(x.id)))];
    pos = 0;
  }
  function info() {
    const d = diretta();
    document.querySelectorAll("#tvPrec, #tvSucc, #tvIndietro, #tvAvanti, #tvPlay, #tvMuto, #tvVol").forEach((b) => { b.disabled = !!d; });
    $("#tvTempo").hidden = !!d;
    if (d) { $("#tvInfo").innerHTML = `<strong>${esc(d.nome.replace("● ", ""))}</strong><span>${t("inDiretta")}</span>`; $("#tvDopo").innerHTML = ""; return; }
    const v = coda[pos];
    if (!v) return;
    $("#tvInfo").innerHTML = `<strong>${esc(v.titolo)}</strong><span>${esc(v.nomeCanale)} · ${esc(nomeCat(v.cat))} · ${quando(v.data)}
      · <button class="link" id="tvSalva">${salvati.some((x) => x.id === v.id) ? t("salvatoTv") : t("salvaTv")}</button></span>`;
    $("#tvSalva").onclick = () => {
      salvati = salvati.some((x) => x.id === v.id) ? salvati.filter((x) => x.id !== v.id) : [v, ...salvati];
      memo.set("salvati", salvati); info();
    };
    $("#tvDopo").innerHTML = coda[pos + 1] ? `${t("dopo")} ${esc(coda[pos + 1].titolo)} <small>· ${esc(coda[pos + 1].nomeCanale)}</small>` : "";
  }
  function svuota() {
    try { lettore?.chiudi(); } catch {}
    lettore = null;
    $("#tvPlayer").innerHTML = "";
    $("#tvPlay").textContent = "▶";
  }
  async function monta() {
    const mio = ++turno;
    svuota();
    const d = diretta();
    if (d) { const src = typeof d.src === "function" ? await d.src().catch(() => "") : d.src; if (mio !== turno) return; $("#tvPlayer").innerHTML = iframe(src); $("#tvPlayer").classList.toggle("quadrato", !!d.quadrato); info(); return; }
    $("#tvPlayer").classList.remove("quadrato");
    if (!coda.length) return;
    const v = coda[pos];
    visti.add(v.id); memo.set("visti", [...visti].slice(-2000));
    info();
    const cb = {
      fine: () => mio === turno && (spegniAFine ? spegni() : vai(pos + 1)),
      errore: () => mio === turno && setTimeout(() => mio === turno && vai(pos + 1), 800),
      stato: (s) => mio === turno && ($("#tvPlay").textContent = s ? "⏸" : "▶"),
    };
    const el = $("#tvPlayer");
    try {
      let l;
      if (v.fonte === "ia") l = lettoreFile(el, await fileArchive(v), miniatura(v), vol(), cb);
      else if (v.fonte === "vimeo") l = await lettoreVimeo(el, v.embed, vol(), cb);
      else l = await lettoreYT(el, v.id, vol(), cb);
      if (mio !== turno) { l.chiudi(); return; }
      lettore = l;
      l.velocita?.(memo.get("velocita", 1));
    } catch { cb.errore(); }
  }
  function vai(i) {
    if (!coda.length) return;
    pos = (i + coda.length) % coda.length;
    monta();
  }
  function spegni() {
    turno++; svuota(); acceso = false;
    spegniAlle = 0; spegniAFine = false; $("#tvTimer").value = "0"; $("#tvResta").textContent = "";
    $("#tvCopriTesto").textContent = t("tvSpenta");
    $("#tvAccendi").textContent = t("riaccendi");
    $("#tvCopri").hidden = false;
  }

  $("#tvAccendi").onclick = async () => {
    if (!esterniOk()) { $("#tvCopri").hidden = true; await chiediEsterno($("#tvSchermo"), "YouTube, Vimeo, Internet Archive"); $("#tvCopri").hidden = false; }
    $("#tvCopriTesto").textContent = t("accendo");
    if (!coda.length) await preparaCoda();
    if (!coda.length && !diretta()) { $("#tvCopriTesto").textContent = t("nessunVideo"); return; }
    $("#tvCopri").hidden = true;
    acceso = true;
    monta();
  };
  giro = setInterval(() => {
    if (lettore) {
      const d = lettore.durata() || 0, t = lettore.tempo() || 0;
      $("#tvOra").textContent = mmss(t); $("#tvDurata").textContent = mmss(d);
      if (d && document.activeElement !== $("#tvPos")) $("#tvPos").value = Math.round((t / d) * 1000);
    }
    if (spegniAlle) {
      const resta = (spegniAlle - Date.now()) / 1000;
      if (resta <= 0) spegni(); else $("#tvResta").textContent = t("spegneTra", mmss(resta));
    }
  }, 500);

  $("#tvPlay").onclick = () => {
    if (!acceso) return $("#tvAccendi").click();
    if (lettore) lettore.inCorso() ? lettore.pause() : lettore.play();
  };
  $("#tvPrec").onclick = () => acceso && vai(pos - 1);
  $("#tvSucc").onclick = () => acceso && vai(pos + 1);
  $("#tvIndietro").onclick = () => lettore?.vai(Math.max(0, lettore.tempo() - 10));
  $("#tvAvanti").onclick = () => lettore?.vai(lettore.tempo() + 10);
  $("#tvPos").onchange = (e) => lettore?.vai((e.target.value / 1000) * lettore.durata());
  $("#tvVel").onchange = (e) => { const r = Number(e.target.value); memo.set("velocita", r); lettore?.velocita?.(r); };
  $("#tvVol").oninput = (e) => { memo.set("tvVol", Number(e.target.value)); lettore?.volume(Number(e.target.value)); $("#tvMuto").textContent = "🔊"; };
  $("#tvMuto").onclick = () => {
    if (!lettore) return;
    const m = !lettore.muto_(); lettore.muto(m); $("#tvMuto").textContent = m ? "🔇" : "🔊";
  };
  $("#tvSchermoIntero").onclick = () => {
    const el = $("#tvSchermo");
    document.fullscreenElement ? document.exitFullscreen() : (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
  };
  $("#tvTimer").onchange = (e) => {
    const v = e.target.value;
    spegniAFine = v === "fine";
    spegniAlle = v !== "0" && v !== "fine" ? Date.now() + Number(v) * 60000 : 0;
    $("#tvResta").textContent = spegniAFine ? t("spegneFine") : "";
  };
  $("#tvCanale").onchange = async (e) => {
    canale = e.target.value; memo.set("tvCanale", canale);
    await preparaCoda();
    if (acceso) monta(); else info();
  };
  const tasti = (e) => {
    if (e.target.closest("input, select, textarea")) return;
    if (e.key === " ") { e.preventDefault(); $("#tvPlay").click(); }
    if (e.key === "ArrowRight") $("#tvAvanti").click();
    if (e.key === "ArrowLeft") $("#tvIndietro").click();
    if (e.key === "n" || e.key === "N") $("#tvSucc").click();
    if (e.key === "f" || e.key === "F") $("#tvSchermoIntero").click();
  };
  document.addEventListener("keydown", tasti);
  pulisci = () => { turno++; clearInterval(giro); svuota(); document.removeEventListener("keydown", tasti); };
  info();
}

// ——— account con passkey ———
let libPasskey = null;
const passkeyLib = () => (libPasskey ||= import("https://cdn.jsdelivr.net/npm/@simplewebauthn/browser@14.0.0/+esm"));
async function post(url, corpo) {
  const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corpo) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.errore || "passkey");
  return d;
}
function erroreConto(e) {
  if (e?.name === "NotAllowedError" || e?.name === "AbortError") return t("passkeyAnnullata");
  if (e?.message === "troppe") return t("troppe");
  return t("passkeyErrore");
}
async function registrati(nome) {
  const lib = await passkeyLib();
  if (!lib.browserSupportsWebAuthn()) throw new Error(t("passkeyNo"));
  const { sfida, opzioni } = await post("/api/conto/registra-inizio", { nome });
  const risposta = await lib.startRegistration({ optionsJSON: opzioni });
  await post("/api/conto/registra-fine", { sfida, risposta });
}
async function entra() {
  const lib = await passkeyLib();
  if (!lib.browserSupportsWebAuthn()) throw new Error(t("passkeyNo"));
  const { sfida, opzioni } = await post("/api/conto/entra-inizio", {});
  const risposta = await lib.startAuthentication({ optionsJSON: opzioni });
  await post("/api/conto/entra-fine", { sfida, risposta });
}
async function dopoAccesso() { await caricaIo(); disegnaConto(); location.hash = "#/mia"; rotta(); }
function moduloConto(dove, msgSel) {
  dove.innerHTML = `<p class="sotto">${t("passkeySpiega")}</p>
    <form class="pannello" data-reg><input name="nome" placeholder="${t("tuoNome")}" required minlength="2" maxlength="40" autocomplete="nickname">
      <button class="bott on">${t("creaConto")}</button></form>
    <p><button class="bott" data-entra>🔑 ${t("entraPasskey")}</button> <span class="msg" ${msgSel}></span></p>`;
  const msg = dove.querySelector(".msg");
  dove.querySelector("[data-reg]").onsubmit = async (e) => {
    e.preventDefault(); msg.textContent = "";
    try { await registrati(new FormData(e.target).get("nome")); await dopoAccesso(); } catch (err) { msg.textContent = err.message === t("passkeyNo") ? err.message : erroreConto(err); }
  };
  dove.querySelector("[data-entra]").onclick = async () => {
    msg.textContent = "";
    try { await entra(); await dopoAccesso(); } catch (err) { msg.textContent = err.message === t("passkeyNo") ? err.message : erroreConto(err); }
  };
}
function disegnaConto() {
  const b = $("#apriConto");
  b.textContent = io ? io.nome.slice(0, 1).toUpperCase() : "👤";
  b.classList.toggle("dentro", !!io);
  b.title = io ? t("ciao", io.nome) : t("account");
  b.setAttribute("aria-label", b.title);
}
function menuConto() {
  const m = $("#conto");
  if (io) {
    m.innerHTML = `<h4>${esc(t("ciao", io.nome))}</h4><p><a class="bott on" href="#/mia">${t("mia")}</a></p>
      <p><button class="link" data-esci>${t("esciConto")}</button></p>`;
    m.querySelector("[data-esci]").onclick = async () => { await fetch("/api/conto/esci", { method: "POST" }); io = null; unisciMiei(); disegnaConto(); m.hidden = true; rotta(); };
  } else moduloConto(m, "");
  m.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => { m.hidden = true; }));
}

async function vistaMia() {
  schede("mia");
  if (!io) {
    vista.innerHTML = `<h1>${t("mia")}</h1><p class="sotto">${t("miaVuota")}</p><div id="modulo" class="mia-modulo"></div>`;
    moduloConto($("#modulo"), "");
    return;
  }
  const opzCat = (scelto = "") => categorie.map((k) => `<option value="${k.id}"${k.id === scelto ? " selected" : ""}>${k.segno} ${esc(nomeDi(k))}</option>`).join("");
  vista.innerHTML = `<h1>${t("mia")}</h1><p class="sotto">${t("miaSotto")} <button class="link" id="cancella">${t("cancellaConto")}</button></p>
    <section class="nuovo-argomento"><h2>${t("aggiungiCanale")}</h2>
      <form class="pannello" id="mTrova"><input id="mTesto" placeholder="${t("linkCanale")}" required><button class="bott on">${t("cerca")}</button><span class="msg" id="mMsg"></span></form>
      <div id="mTrovato"></div></section>
    <section class="nuovo-argomento"><h2>${t("nuovoArgomento")}</h2><p class="sotto">${t("nuovoSotto")}</p>
      <form class="pannello" id="mArgomento">
        <input name="segno" class="segno" placeholder="◆" maxlength="2" aria-label="${t("simbolo")}">
        <input name="nome" placeholder="${t("nomeEs")}" required aria-label="${t("nomeArg")}">
        <button class="bott on">${t("creaCerca")}</button></form>
      <div id="mCandidati"></div></section>
    <section class="gruppo"><h2>${t("mieiArgomenti")}</h2>
      ${io.argomenti.length ? `<ul>${io.argomenti.map((a) => `<li><a href="#/c/${a.id}">${a.segno} ${esc(a.nome)}</a> <small>${io.canali.filter((k) => k.cat === a.id).length}</small>
        <button class="link" data-cerca-mio="${a.id}">${t("cercaAltri")}</button> <button class="link" data-togli-arg="${a.id}" data-nome="${esc(a.nome)}">${t("togliArg")}</button>
        <div class="cerca-qui"></div></li>`).join("")}</ul>` : `<p class="sotto">${t("nessunMio")}</p>`}</section>
    <section class="gruppo"><h2>${t("mieiCanali")}</h2>
      ${io.canali.length ? `<ul>${io.canali.map((k) => `<li><a href="${link("ch", k.id)}">${esc(k.nome)}</a> <small>${k.lingua.toUpperCase()}</small>
        <select class="sposta" data-sposta-mio="${k.id}" aria-label="${t("spostaAria", esc(k.nome))}">${opzCat(k.cat)}</select>
        <button class="link" data-togli-mio="${k.id}" data-nome="${esc(k.nome)}">${t("togli")}</button></li>`).join("")}</ul>` : `<p class="sotto">${t("nessunMio")}</p>`}</section>`;
  const aggiorna = async () => { await caricaIo(); vistaMia(); };
  $("#cancella").onclick = async () => {
    if (!confirm(t("cancellaConferma"))) return;
    await fetch("/api/conto/cancella", { method: "POST" }); io = null; unisciMiei(); disegnaConto(); location.hash = "#/";
  };
  $("#mTrova").onsubmit = async (e) => {
    e.preventDefault(); $("#mMsg").textContent = t("cerco"); $("#mTrovato").innerHTML = "";
    try {
      const c = await mio("risolvi", { testo: $("#mTesto").value });
      $("#mMsg").textContent = "";
      $("#mTrovato").innerHTML = `<div class="scheda-canale"><h2>${esc(c.nome)}</h2>
        ${c.gia ? `<p class="msg">${t("giaInElenco", esc(nomeDi(categorie.find((k) => k.id === c.gia)) || c.gia))}</p>` : `<p class="sotto">${c.quanti ? t("ultimiLunghi", c.quanti) : t("nessunLungo")}</p>`}
        <ul>${c.ultimi.map((v) => `<li>${esc(v.titolo)} <small>· ${quando(v.data)}</small></li>`).join("")}</ul>
        ${c.gia ? "" : `<form id="mAggiungi" class="pannello"><input id="mNome" value="${esc(c.nome)}" aria-label="${t("nome")}" required>
          <select id="mCat" aria-label="${t("categoria")}">${opzCat()}</select>
          <select id="mLin" aria-label="${t("lingua")}"><option value="en">${t("inglese")}</option><option value="it">${t("italiano")}</option></select>
          <button class="bott on">${t("aggiungi")}</button></form>`}</div>`;
      if (!c.gia) $("#mAggiungi").onsubmit = async (e2) => {
        e2.preventDefault();
        try { await mio("aggiungi", { id: c.id, nome: $("#mNome").value, cat: $("#mCat").value, lingua: $("#mLin").value }); await aggiorna(); }
        catch (err) { $("#mMsg").textContent = err.message; }
      };
    } catch (err) { $("#mMsg").textContent = err.message; }
  };
  $("#mArgomento").onsubmit = async (e) => {
    e.preventDefault();
    const box = $("#mCandidati");
    box.innerHTML = `<p class="sotto">${t("creoArg")}</p>`;
    try {
      const { id } = await mio("argomento-crea", Object.fromEntries(new FormData(e.target)));
      await caricaIo();
      await cercaCanaliPer(id, box, mio);
    } catch (err) { box.innerHTML = `<p class="msg">${esc(err.message)}</p>`; }
  };
  vista.querySelectorAll("[data-cerca-mio]").forEach((b) => b.onclick = () => cercaCanaliPer(b.dataset.cercaMio, b.closest("li").querySelector(".cerca-qui"), mio));
  vista.querySelectorAll("[data-togli-arg]").forEach((b) => b.onclick = async () => {
    if (!confirm(t("togliArgConferma", b.dataset.nome))) return;
    await mio("argomento-togli", { id: b.dataset.togliArg }).catch((err) => alert(err.message)); await aggiorna();
  });
  vista.querySelectorAll("[data-togli-mio]").forEach((b) => b.onclick = async () => {
    if (!confirm(t("togliConferma", b.dataset.nome))) return;
    await mio("togli", { id: b.dataset.togliMio }).catch((err) => alert(err.message)); await aggiorna();
  });
  vista.querySelectorAll("[data-sposta-mio]").forEach((sel) => sel.onchange = async () => {
    await mio("sposta", { id: sel.dataset.spostaMio, cat: sel.value }).catch((err) => alert(err.message)); await aggiorna();
  });
}

function vistaPrivacy() {
  schede("-");
  vista.innerHTML = `<div class="privacy"><h1>${t("privacyTitolo")}</h1>${t("privacyCorpo")}
    <p><button class="bott on" id="apriCookie">${t("cookieImpostazioni")}</button></p></div>`;
  $("#apriCookie").onclick = mostraCookie;
}

function rotta() {
  if (pulisci) { pulisci(); pulisci = null; }
  document.title = "Lavagna";
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  const [tipo, ...resto] = h.split("/");
  const arg = resto.join("/");
  if (tipo === "c") return vistaCategoria(arg);
  if (tipo === "ch") return vistaCanale(arg);
  if (tipo === "v") return vistaVideo(arg);
  if (tipo === "cerca" && arg) return vistaCerca(arg);
  if (tipo === "esplora") return vistaCerca("");
  if (tipo === "salvati") return vistaSalvati();
  if (tipo === "canali") return vistaCanali();
  if (tipo === "tv") return vistaTV();
  if (tipo === "privacy") return vistaPrivacy();
  if (tipo === "mia") return vistaMia();
  $("#q").value = "";
  return home();
}

// ——— intestazione e ⚙ impostazioni: lingua dell'interfaccia e tema ———
function applicaLingua() {
  document.documentElement.lang = ui;
  $("#q").placeholder = t("cercaPh");
  $("#q").setAttribute("aria-label", t("cerca"));
  document.querySelector(".lingue").setAttribute("aria-label", t("lingueVideo"));
  document.querySelector('.lingue [data-l="tutte"]').textContent = t("tutte");
  $("#piede").textContent = t("piede");
  $("#linkCookie").textContent = t("cookieImpostazioni");
  if (!$("#cookie").hidden) mostraCookie();
  $("#apriImposta").setAttribute("aria-label", t("impostazioni"));
  if (categorieTutti.length) { disegnaConto(); unisciMiei(); }
  $("#apriImposta").title = t("impostazioni");
}
function menuImpostazioni() {
  const tema = memo.get("tema", "auto");
  const scelta = (gruppo, val, nome, on) => `<button data-${gruppo}="${val}" class="${on ? "on" : ""}">${nome}</button>`;
  $("#imposta").innerHTML = `<h4>${t("linguaUi")}</h4><div class="scelte">${scelta("ui", "en", "English", ui === "en")}${scelta("ui", "it", "Italiano", ui === "it")}</div>
    <h4>${t("tema")}</h4><div class="scelte">${scelta("tema", "auto", t("auto"), tema === "auto")}${scelta("tema", "light", t("chiaro"), tema === "light")}${scelta("tema", "dark", t("scuro"), tema === "dark")}</div>`;
  $("#imposta").querySelectorAll("[data-ui]").forEach((b) => b.onclick = () => {
    ui = b.dataset.ui; memo.set("ui", ui); applicaLingua(); menuImpostazioni(); rotta();
  });
  $("#imposta").querySelectorAll("[data-tema]").forEach((b) => b.onclick = () => {
    const v = b.dataset.tema; memo.set("tema", v);
    if (v === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
    menuImpostazioni();
  });
}
$("#apriConto").onclick = (e) => {
  e.stopPropagation();
  const m = $("#conto"), apri = m.hidden;
  if (apri) menuConto();
  m.hidden = !apri;
  $("#imposta").hidden = true;
};
document.addEventListener("click", (e) => { const m = $("#conto"); if (!m.hidden && !e.target.closest(".conto")) m.hidden = true; });
$("#apriImposta").onclick = (e) => {
  e.stopPropagation();
  const m = $("#imposta"), apri = m.hidden;
  if (apri) menuImpostazioni();
  m.hidden = !apri;
  $("#apriImposta").setAttribute("aria-expanded", String(apri));
};
document.addEventListener("click", (e) => { const m = $("#imposta"); if (!m.hidden && !e.target.closest(".imposta")) m.hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") $("#imposta").hidden = true; });
applicaLingua();
$("#linkCookie").onclick = mostraCookie;
caricaCaratteri();
if (!consenso()) mostraCookie();

// ——— avvio ———
document.querySelectorAll(".lingue button").forEach((b) => {
  b.classList.toggle("on", b.dataset.l === lingua);
  b.onclick = () => {
    lingua = b.dataset.l; memo.set("lingua", lingua);
    document.querySelectorAll(".lingue button").forEach((x) => x.classList.toggle("on", x === b));
    if (!location.hash.startsWith("#/v/") && !location.hash.startsWith("#/tv")) rotta();
  };
});
$("#cerca").onsubmit = (e) => {
  e.preventDefault();
  const q = $("#q").value.trim();
  location.hash = q ? `#/cerca/${encodeURIComponent(q)}` : "#/";
  $("#q").blur();
};
window.addEventListener("hashchange", rotta);
categorieTutti = await prendi("/api/categorie");
await caricaIo();
disegnaConto();
rotta();
