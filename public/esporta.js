// Export del Banco: un vero documento Word (.docx) e un vero PDF (non la stampa del browser),
// con tutto quello che SCHOOL · Desk genera per un video, gli appunti (con il fotogramma) e, se si vuole, la trascrizione.
// Le librerie stanno nel sito (/lib) e si caricano solo quando qualcuno esporta.

const NOTTE = [27, 33, 64], BLU = [76, 110, 245], GRIGIO = [92, 101, 133];
const tempo = (x) => { x = Math.max(0, Math.floor(Number(x) || 0)); const h = Math.floor(x / 3600), m = Math.floor((x % 3600) / 60), s = String(x % 60).padStart(2, "0"); return h ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`; };
const linkYT = (id, t) => `https://www.youtube.com/watch?v=${id}${t ? `&t=${Math.floor(t)}s` : ""}`;
const nomeFile = (x) => (String(x || "lavagna").normalize("NFD").replace(/\p{M}/gu, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "lavagna").toLowerCase();

export const PARTI = ["tre", "semplice", "mappa", "domande", "tempo", "contrario", "simili", "appunti", "trascrizione"];

// ——— 1 · raccogliere tutto (le risposte dell'AI arrivano in parallelo; quelle già fatte sono subito pronte) ———
export async function raccogli(v, A, scelte, avanza = () => {}) {
  const d = { v, data: new Date() };
  const ai = ["tre", "semplice", "mappa", "domande", "tempo", "contrario", "simili"].filter((k) => scelte.includes(k));
  // ogni parte ha al massimo un minuto e mezzo: se Gemini non risponde, il documento si fa lo stesso senza
  d.mancanti = [];
  await Promise.all(ai.map(async (k) => {
    const r = await fetch(`/api/banco/${k}/${v.id}?ui=${A.ui()}`, { headers: { "x-gemini-key": A.memo.get("chiaveGemini", "") }, signal: AbortSignal.timeout(90000) }).catch(() => null);
    d[k] = r?.ok ? await r.json().catch(() => null) : null;
    if (!d[k]) d.mancanti.push(k);
    avanza(k, !!d[k]);
  }));
  if (d.mappa?.testo) d.mappa.png = await svgPng(A.svgMappa(d.mappa.testo, d.mappa.centro || v.titolo)).catch(() => null);
  if (scelte.includes("appunti")) {
    d.appunti = await A.appuntiDi(v.id);
    for (const p of d.appunti) p.foto = (await A.fotogramma(v.id, p.da, v.durata).catch(() => null))?.src || null;
    avanza("appunti", true);
  }
  if (scelte.includes("trascrizione")) { d.trascrizione = (await A.trascrizione(v.id))?.righe || []; avanza("trascrizione", true); }
  // per la copertina: un fotogramma del video e il logo
  d.copertina = await immagineGrande(v.id).catch(() => null) || (await A.fotogramma(v.id, Math.max(20, (v.durata || 600) * 0.3), v.durata).catch(() => null))?.src || null;
  d.logo = await logoPng().catch(() => null);
  return d;
}

async function svgPng(svg, scala = 2) {
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    await new Promise((ok, ko) => { img.onload = ok; img.onerror = ko; img.src = url; });
    const c = document.createElement("canvas");
    c.width = img.naturalWidth * scala; c.height = img.naturalHeight * scala;
    const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
    return { src: c.toDataURL("image/png"), w: img.naturalWidth, h: img.naturalHeight };
  } finally { URL.revokeObjectURL(url); }
}
const byte = (dataUrl) => { const b = atob(dataUrl.split(",")[1]); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
function scarica(blob, nome) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// l'immagine grande del video (passa dal nostro server: così si può mettere nel documento)
async function immagineGrande(id) {
  if (!/^[\w-]{11}$/.test(id)) return null;
  const r = await fetch(`/api/copertina/${id}`);
  if (!r.ok) return null;
  const b = await r.blob();
  return await new Promise((ok) => { const f = new FileReader(); f.onload = () => ok(f.result); f.onerror = () => ok(null); f.readAsDataURL(b); });
}

// ——— il logo «Lavagna. by sbob» come immagine (con la o blu che sorride), per copertina e piè di pagina ———
async function logoPng() {
  await Promise.all([document.fonts?.load?.("700 120px Fraunces"), document.fonts?.load?.("900 60px Inter"), document.fonts?.load?.("500 60px Inter")].filter(Boolean)).catch(() => {});
  const c = document.createElement("canvas"), g = c.getContext("2d");
  c.width = 900; c.height = 300;
  g.textBaseline = "alphabetic";
  g.font = "700 150px Fraunces, Georgia, serif"; g.fillStyle = "#1b2140";
  g.fillText("Lavagna", 0, 150);
  const w = g.measureText("Lavagna").width;
  g.fillStyle = "#4c6ef5"; g.fillText(".", w + 2, 150);
  const larghezza = w + g.measureText(".").width + 8;
  // «by sbob»: by in grigio, sb e b in blu notte, la o è un cerchio blu con il sorriso bianco
  let x = 6; const y = 250;
  g.font = "500 62px Inter, system-ui, sans-serif"; g.fillStyle = "#5c6585"; g.fillText("by", x, y); x += g.measureText("by ").width + 6;
  g.font = "900 70px Inter, system-ui, sans-serif"; g.fillStyle = "#1b2140"; g.fillText("sb", x, y); x += g.measureText("sb").width + 4;
  const r = 27, cx = x + r, cy = y - 25;
  g.fillStyle = "#4c6ef5"; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#fff"; g.lineWidth = 7; g.lineCap = "round"; g.beginPath(); g.arc(cx, cy - 2, r * 0.52, Math.PI * 0.18, Math.PI * 0.82); g.stroke();
  x = cx + r + 4; g.fillStyle = "#1b2140"; g.fillText("b", x, y); x += g.measureText("b").width;
  const W = Math.ceil(Math.max(larghezza, x) + 6), H = 275;
  const t = document.createElement("canvas"); t.width = W; t.height = H; t.getContext("2d").drawImage(c, 0, 0);
  return { src: t.toDataURL("image/png"), w: W, h: H };
}

// l'ordine dei gruppi: ognuno comincia su una pagina sua
const ORDINE = ["mappa", "tre", "semplice", "domande", "tempo", "contrario", "simili", "appunti", "trascrizione"];
const presente = (d, k) => ({ mappa: d.mappa?.png, tre: d.tre?.punti?.length, semplice: d.semplice?.riassunto, domande: d.domande?.domande?.length, tempo: d.tempo?.eventi?.length,
  contrario: d.contrario?.tesi, simili: d.simili?.momenti?.length, appunti: d.appunti?.length, trascrizione: d.trascrizione?.length })[k];
const titoloSezione = (p, k) => p({ appunti: "ap", trascrizione: "tr" }[k] || k);
const quandoCreata = (d, A) => d.data.toLocaleDateString(A.ui() === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "long", year: "numeric" });

// ——— 2 · PDF vero, impaginato (jsPDF): copertina, un gruppo per pagina, link cliccabili, immagini, piè di pagina col logo ———
// I caratteri fuori dalla codifica dei font standard del PDF si sostituiscono (→ diventa ->), così non escono simboli strani.
const SOSTITUTI = { "→": "->", "←": "<-", "▶": ">", "≈": "~", "≤": "<=", "≥": ">=", "×": "x", "•": "-", "″": '"', "′": "'", " ": " " };
const pulisci = (t) => String(t ?? "").normalize("NFC").replace(/[\s\S]/g, (c) => (SOSTITUTI[c] ?? (c.charCodeAt(0) <= 255 || "–—‘’“”…€".includes(c) ? c : ""))).replace(/[ \t]+\n/g, "\n");

export async function pdf(d, A, p) {
  await A.caricaScript("/lib/jspdf.umd.min.js");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: d.v.titolo, subject: p("pdfTipo"), creator: "Lavagna. by sbob" });
  const M = 18;
  let W = 210, H = 297, y = M;
  const larg = () => W - 2 * M;
  const nuova = (orient = "portrait") => { doc.addPage("a4", orient); W = orient === "portrait" ? 210 : 297; H = orient === "portrait" ? 297 : 210; y = M; };
  const serve = (h) => { if (y + h > H - 22) { nuova(); y = M + 4; } };
  const scrivi = (t, { size = 10.5, stile = "normal", colore = NOTTE, rientro = 0, dopo = 2.2, inter = 1.4, largo } = {}) => {
    doc.setFont("helvetica", stile); doc.setFontSize(size); doc.setTextColor(...colore);
    const h = size * 0.3528 * inter;
    for (const r of doc.splitTextToSize(pulisci(t), (largo ?? larg()) - rientro)) { serve(h); doc.text(r, M + rientro, y + h * 0.78); y += h; }
    y += dopo;
  };
  const link = (t, url, { size = 10, rientro = 0 } = {}) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(size); doc.setTextColor(...BLU);
    const h = size * 0.3528 * 1.45; serve(h);
    doc.textWithLink(pulisci(t), M + rientro, y + h * 0.78, { url }); y += h + 0.8;
  };
  // l'inizio di ogni gruppo: pagina nuova, etichetta, titolo, barretta blu
  const sezione = (t, orient = "portrait") => {
    nuova(orient); y = M + 2;
    scrivi("SCHOOL · DESK", { size: 8, stile: "bold", colore: BLU, dopo: 1 });
    scrivi(t, { size: 22, stile: "bold", inter: 1.2, dopo: 2 });
    doc.setFillColor(...BLU); doc.roundedRect(M, y, 14, 1.8, 0.9, 0.9, "F"); y += 8;
  };
  const sotto = (t) => { y += 1.5; scrivi(t, { size: 12, stile: "bold", colore: BLU, dopo: 1.5 }); };

  // ——— copertina ———
  if (d.logo) { const h = 22, w = (d.logo.w / d.logo.h) * h; doc.addImage(d.logo.src, "PNG", M, M, w, h); }
  y = M + 34;
  doc.setFont("helvetica", "bold"); doc.setFontSize(24);
  const quante = Math.min(4, doc.splitTextToSize(pulisci(d.v.titolo), larg() - 20).length);
  const fasciaY = y, fasciaH = 12 + 9 + quante * 10 + 14;
  doc.setFillColor(...NOTTE); doc.roundedRect(M, fasciaY, larg(), fasciaH, 4, 4, "F");
  y = fasciaY + 12;
  doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...BLU); doc.text(pulisci(p("pdfTipo").toUpperCase()), M + 10, y); y += 9;
  doc.setFontSize(24); doc.setTextColor(255, 255, 255);
  const righeT = doc.splitTextToSize(pulisci(d.v.titolo), larg() - 20).slice(0, 4);
  righeT.forEach((r) => { doc.text(r, M + 10, y); y += 10; });
  doc.setFont("helvetica", "normal"); doc.setFontSize(11); doc.setTextColor(205, 212, 235);
  doc.text(pulisci([d.v.nomeCanale, d.v.lingua?.toUpperCase()].filter(Boolean).join(" · ")), M + 10, fasciaY + fasciaH - 9);
  y = fasciaY + fasciaH + 10;
  if (d.copertina) { const w = larg(), h = w * 9 / 16; doc.addImage(d.copertina, "JPEG", M, y, w, h); y += h + 8; }
  link(linkYT(d.v.id), linkYT(d.v.id), { size: 10.5 });
  scrivi(`${p("creatoIl")} ${quandoCreata(d, A)}`, { size: 9.5, colore: GRIGIO });

  // ——— i gruppi, uno per pagina ———
  for (const k of ORDINE.filter((x) => presente(d, x))) {
    if (k === "mappa") {
      sezione(p("mappa"), "landscape");
      const maxW = W - 2 * M, maxH = H - y - 24, z = Math.min(maxW / d.mappa.png.w, maxH / d.mappa.png.h);
      doc.addImage(d.mappa.png.src, "PNG", M + (maxW - d.mappa.png.w * z) / 2, y, d.mappa.png.w * z, d.mappa.png.h * z);
      continue;
    }
    sezione(titoloSezione(p, k));
    if (k === "tre") d.tre.punti.forEach((x, i) => {
      serve(20);
      doc.setFillColor(...BLU); doc.circle(M + 5, y + 4.5, 5, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.setTextColor(255, 255, 255); doc.text(String(i + 1), M + 5, y + 6.2, { align: "center" });
      if (x.titolo) scrivi(x.titolo, { size: 13, stile: "bold", rientro: 15, dopo: 1 });
      scrivi(x.testo, { size: 11, rientro: 15, dopo: 7 });
    });
    if (k === "semplice") {
      scrivi(d.semplice.riassunto, { size: 12, inter: 1.5, dopo: 4 });
      if (d.semplice.punti?.length) { sotto(p("punti")); d.semplice.punti.forEach((x) => scrivi(`-  ${x}`, { rientro: 2, dopo: 1.2 })); }
      if (d.semplice.glossario?.length) { sotto(p("glossario")); d.semplice.glossario.forEach((g) => { scrivi(g.termine, { stile: "bold", dopo: 0.3 }); scrivi(g.spiegazione, { colore: GRIGIO, rientro: 5, dopo: 2 }); }); }
    }
    if (k === "domande") d.domande.domande.forEach((x, i) => { scrivi(`${i + 1}. ${x.d}`, { size: 11, stile: "bold", dopo: 0.8 }); scrivi(x.r, { colore: GRIGIO, rientro: 6, dopo: 3.5 }); });
    if (k === "tempo") d.tempo.eventi.forEach((e) => {
      serve(14);
      doc.setDrawColor(...BLU); doc.setLineWidth(0.7); doc.line(M + 1.5, y, M + 1.5, y + 11);
      scrivi(e.quando, { stile: "bold", colore: BLU, rientro: 6, dopo: 0.3 });
      scrivi(e.cosa, { rientro: 6, dopo: 0.3 });
      if (e.sec) link(`${p("vaiAlMinuto")} ${tempo(e.sec)}`, linkYT(d.v.id, e.sec), { size: 9, rientro: 6 });
      y += 2.5;
    });
    if (k === "contrario") {
      sotto(p("tesi")); scrivi(d.contrario.tesi, { size: 11.5, dopo: 4 });
      sotto(p("opposta")); scrivi(d.contrario.opposta, { size: 11.5, dopo: 4 });
      if (d.contrario.video?.length) { sotto(p("altraParte")); d.contrario.video.forEach((x) => { scrivi(`${x.titolo}${x.nomeCanale ? ` — ${x.nomeCanale}` : ""}`, { stile: "bold", dopo: 0.2 }); link(linkYT(x.id), linkYT(x.id), { size: 9 }); y += 1.5; }); }
    }
    if (k === "simili") d.simili.momenti.forEach((m) => {
      scrivi(`${m.titolo || m.id}${m.nomeCanale ? ` — ${m.nomeCanale}` : ""}`, { stile: "bold", dopo: 0.4 });
      scrivi(`«${m.estratto}»`, { size: 9.8, colore: GRIGIO, rientro: 5, dopo: 0.4 });
      link(`${p("vaiAlMinuto")} ${tempo(m.da)}`, linkYT(m.id, m.da), { size: 9, rientro: 5 });
      y += 2.5;
    });
    if (k === "appunti") for (const n of d.appunti) {
      const alto = n.foto ? 33 : 0;
      serve(Math.max(alto, 16) + 4);
      const y0 = y, rientro = n.foto ? 62 : 0;
      if (n.foto) doc.addImage(n.foto, "JPEG", M, y, 57, 32);
      link(`${tempo(n.da)}${n.a > n.da ? `–${tempo(n.a)}` : ""}`, linkYT(d.v.id, n.da), { size: 10.5, rientro });
      if (n.testo) scrivi(n.testo, { rientro, dopo: 1 });
      if (n.estratto) scrivi(`«${n.estratto}»`, { size: 9.5, colore: GRIGIO, rientro, dopo: 1 });
      y = Math.max(y, y0 + alto) + 6;
    }
    if (k === "trascrizione") for (const [t, x] of d.trascrizione) {
      const h = 9.5 * 0.3528 * 1.4, righe = doc.splitTextToSize(pulisci(x), larg() - 16);
      serve(h);
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLU); doc.text(tempo(t), M, y + h * 0.78);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...NOTTE);
      for (const r of righe) { serve(h); doc.text(r, M + 16, y + h * 0.78); y += h; }
    }
  }
  if (["tre", "semplice", "domande", "tempo", "contrario", "mappa"].some((k) => presente(d, k))) { y += 6; serve(10); scrivi(p("controlla"), { size: 8.5, stile: "italic", colore: GRIGIO }); }

  // piè di pagina: logo, titolo, numero (non sulla copertina)
  const n = doc.getNumberOfPages();
  for (let i = 2; i <= n; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(221, 227, 241); doc.setLineWidth(0.3); doc.line(M, h - 14, w - M, h - 14);
    if (d.logo) { const lh = 7.5, lw = (d.logo.w / d.logo.h) * lh; doc.addImage(d.logo.src, "PNG", M, h - 12.2, lw, lh); }
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(...GRIGIO);
    doc.text(pulisci(d.v.titolo).slice(0, 80), w / 2, h - 7.5, { align: "center" });
    doc.text(`${i - 1} / ${n - 1}`, w - M, h - 7.5, { align: "right" });
  }
  scarica(doc.output("blob"), `${nomeFile(d.v.titolo)}.pdf`);
}

// ——— 3 · Word vero (.docx), impaginato come il PDF: copertina, un gruppo per pagina (la mappa in orizzontale), tabelle, piè col logo ———
export async function word(d, A, p) {
  await A.caricaScript("/lib/docx.umd.js");
  const D = window.docx;
  const FONT = "Arial", NOTTE_H = "1B2140", BLU_H = "4C6EF5", GRIGIO_H = "5C6585", RIGA_H = "DDE3F1";
  const nessunBordo = { top: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" }, left: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" }, right: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" } };
  const run = (text, o = {}) => new D.TextRun({ text: text ?? "", font: FONT, size: o.size ?? 22, bold: o.bold, italics: o.italics, color: o.colore ?? NOTTE_H });
  const par = (children, o = {}) => new D.Paragraph({ spacing: { after: o.after ?? 140, before: o.before ?? 0, line: o.line ?? 300 }, indent: o.rientro ? { left: o.rientro } : undefined, alignment: o.align, keepNext: o.keepNext, children: Array.isArray(children) ? children : [run(children, o)] });
  const collegamento = (t, url, o = {}) => par([new D.ExternalHyperlink({ link: url, children: [new D.TextRun({ text: t, font: FONT, size: o.size ?? 20, color: BLU_H, underline: {} })] })], o);
  const immagine = (src, w, h) => new D.ImageRun({ data: byte(src), transformation: { width: Math.round(w), height: Math.round(h) } });
  // l'inizio di ogni gruppo: etichetta, titolo grande, barretta blu (sempre a pagina nuova: ogni gruppo è una sezione)
  const testaSezione = (t) => [
    par([run("SCHOOL · DESK", { size: 16, bold: true, colore: BLU_H })], { after: 60 }),
    new D.Paragraph({ heading: D.HeadingLevel.HEADING_1, spacing: { after: 120 }, children: [new D.TextRun({ text: t, font: FONT, size: 44, bold: true, color: NOTTE_H })] }),
    par([run("▬▬", { size: 20, colore: BLU_H })], { after: 280 }),
  ];
  const sotto = (t) => new D.Paragraph({ heading: D.HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 }, keepNext: true, children: [new D.TextRun({ text: t, font: FONT, size: 26, bold: true, color: BLU_H })] });
  const cella = (children, o = {}) => new D.TableCell({ children, width: o.w ? { size: o.w, type: D.WidthType.DXA } : undefined, shading: o.fondo ? { fill: o.fondo, type: D.ShadingType.CLEAR, color: "auto" } : undefined, borders: o.bordi ?? nessunBordo, verticalAlign: o.va ?? D.VerticalAlign.TOP, margins: o.margini ?? { top: 120, bottom: 120, left: 160, right: 160 } });
  const tabella = (righe, larghezze) => new D.Table({ width: { size: 100, type: D.WidthType.PERCENTAGE }, columnWidths: larghezze, borders: { ...nessunBordo, insideHorizontal: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" }, insideVertical: { style: D.BorderStyle.NONE, size: 0, color: "FFFFFF" } }, rows: righe.map((c) => new D.TableRow({ cantSplit: true, children: c })) });

  // piè di pagina (non sulla copertina): logo, titolo, numero di pagina
  const piede = () => new D.Footer({ children: [new D.Paragraph({
    tabStops: [{ type: D.TabStopType.CENTER, position: 4819 }, { type: D.TabStopType.RIGHT, position: 9638 }],
    border: { top: { style: D.BorderStyle.SINGLE, size: 4, color: RIGA_H, space: 6 } },
    children: [
      ...(d.logo ? [immagine(d.logo.src, (d.logo.w / d.logo.h) * 26, 26)] : [run("Lavagna. by sbob", { size: 16, bold: true })]),
      new D.TextRun({ text: `\t${d.v.titolo.slice(0, 70)}\t`, font: FONT, size: 16, color: GRIGIO_H }),
      new D.TextRun({ children: [D.PageNumber.CURRENT], font: FONT, size: 16, color: GRIGIO_H }),
    ] })] });
  const margini = { top: 1134, bottom: 1134, left: 1134, right: 1134, footer: 500 };
  const pagina = (orient) => ({ page: { margin: margini, ...(orient ? { size: { orientation: orient } } : {}) } });
  const sezioni = [];

  // ——— copertina ———
  const cop = [];
  if (d.logo) cop.push(par([immagine(d.logo.src, (d.logo.w / d.logo.h) * 70, 70)], { after: 480 }));
  cop.push(tabella([[cella([
    par([run(p("pdfTipo").toUpperCase(), { size: 18, bold: true, colore: "8FA4FA" })], { after: 160 }),
    par([run(d.v.titolo, { size: 52, bold: true, colore: "FFFFFF" })], { after: 240, line: 276 }),
    par([run([d.v.nomeCanale, d.v.lingua?.toUpperCase()].filter(Boolean).join(" · "), { size: 22, colore: "CDD4EB" })], { after: 60 }),
  ], { fondo: NOTTE_H, margini: { top: 400, bottom: 400, left: 400, right: 400 } })]], [9638]));
  if (d.copertina) cop.push(par([immagine(d.copertina, 600, 338)], { before: 360, after: 240 }));
  cop.push(collegamento(linkYT(d.v.id), linkYT(d.v.id), { size: 21, after: 80 }));
  cop.push(par([run(`${p("creatoIl")} ${quandoCreata(d, A)}`, { size: 19, colore: GRIGIO_H })]));
  sezioni.push({ properties: pagina(), children: cop });

  // ——— i gruppi, ognuno una sezione: comincia sempre a pagina nuova ———
  for (const k of ORDINE.filter((x) => presente(d, x))) {
    const c = [...testaSezione(titoloSezione(p, k))];
    if (k === "mappa") {
      const larg = 900, alto = Math.min(470, (d.mappa.png.h / d.mappa.png.w) * larg);
      c.push(par([immagine(d.mappa.png.src, alto * (d.mappa.png.w / d.mappa.png.h), alto)], { align: D.AlignmentType.CENTER }));
      sezioni.push({ properties: pagina(D.PageOrientation.LANDSCAPE), footers: { default: piede() }, children: c });
      // lo schema della mappa come testo, modificabile, nella stessa pagina orizzontale non ci sta: va in coda alla sezione
      continue;
    }
    if (k === "tre") c.push(tabella(d.tre.punti.map((x, i) => [
      cella([par([run(String(i + 1), { size: 40, bold: true, colore: "FFFFFF" })], { align: D.AlignmentType.CENTER, after: 0 })], { w: 900, fondo: BLU_H, va: D.VerticalAlign.CENTER }),
      cella([...(x.titolo ? [par([run(x.titolo, { size: 26, bold: true })], { after: 80 })] : []), par([run(x.testo, { size: 22 })], { after: 0 })], { w: 8738, margini: { top: 160, bottom: 280, left: 280, right: 160 } }),
    ]), [900, 8738]));
    if (k === "semplice") {
      c.push(par([run(d.semplice.riassunto, { size: 24 })], { line: 340, after: 200 }));
      if (d.semplice.punti?.length) { c.push(sotto(p("punti"))); d.semplice.punti.forEach((x) => c.push(new D.Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: [run(x)] }))); }
      if (d.semplice.glossario?.length) {
        c.push(sotto(p("glossario")));
        c.push(tabella(d.semplice.glossario.map((g) => [
          cella([par([run(g.termine, { bold: true })], { after: 0 })], { w: 2800, bordi: { ...nessunBordo, bottom: { style: D.BorderStyle.SINGLE, size: 4, color: RIGA_H } } }),
          cella([par([run(g.spiegazione, { colore: GRIGIO_H })], { after: 0 })], { w: 6838, bordi: { ...nessunBordo, bottom: { style: D.BorderStyle.SINGLE, size: 4, color: RIGA_H } } }),
        ]), [2800, 6838]));
      }
    }
    if (k === "domande") d.domande.domande.forEach((x, i) => { c.push(par([run(`${i + 1}. ${x.d}`, { bold: true, size: 23 })], { after: 60, keepNext: true })); c.push(par([run(x.r, { colore: GRIGIO_H })], { rientro: 400, after: 220 })); });
    if (k === "tempo") d.tempo.eventi.forEach((e) => {
      c.push(par([run(e.quando, { bold: true, colore: BLU_H, size: 24 })], { after: 40, keepNext: true }));
      c.push(par([run(e.cosa)], { rientro: 300, after: 40 }));
      if (e.sec) c.push(collegamento(`${p("vaiAlMinuto")} ${tempo(e.sec)}`, linkYT(d.v.id, e.sec), { rientro: 300, size: 18, after: 200 }));
    });
    if (k === "contrario") {
      c.push(sotto(p("tesi"))); c.push(par([run(d.contrario.tesi, { size: 23 })]));
      c.push(sotto(p("opposta"))); c.push(par([run(d.contrario.opposta, { size: 23 })]));
      if (d.contrario.video?.length) { c.push(sotto(p("altraParte"))); d.contrario.video.forEach((x) => c.push(collegamento(`${x.titolo}${x.nomeCanale ? ` — ${x.nomeCanale}` : ""}`, linkYT(x.id), { size: 20 }))); }
    }
    if (k === "simili") d.simili.momenti.forEach((m) => {
      c.push(par([run(`${m.titolo || m.id}${m.nomeCanale ? ` — ${m.nomeCanale}` : ""}`, { bold: true })], { after: 40, keepNext: true }));
      c.push(par([run(`«${m.estratto}»`, { italics: true, colore: GRIGIO_H, size: 20 })], { rientro: 300, after: 40, keepNext: true }));
      c.push(collegamento(`${p("vaiAlMinuto")} ${tempo(m.da)}`, linkYT(m.id, m.da), { rientro: 300, size: 18, after: 220 }));
    });
    if (k === "appunti") c.push(tabella(d.appunti.map((n) => [
      cella(n.foto ? [par([immagine(n.foto, 210, 118)], { after: 0 })] : [par("", { after: 0 })], { w: 3400, margini: { top: 120, bottom: 200, left: 0, right: 200 } }),
      cella([collegamento(`${tempo(n.da)}${n.a > n.da ? `–${tempo(n.a)}` : ""}`, linkYT(d.v.id, n.da), { size: 21, after: 60 }),
        ...(n.testo ? [par([run(n.testo)], { after: 60 })] : []), ...(n.estratto ? [par([run(`«${n.estratto}»`, { italics: true, colore: GRIGIO_H, size: 19 })], { after: 0 })] : [])], { w: 6238 }),
    ]), [3400, 6238]));
    if (k === "trascrizione") d.trascrizione.forEach(([t, x]) => c.push(par([run(`${tempo(t)}   `, { bold: true, colore: BLU_H, size: 17 }), run(x, { size: 20 })], { after: 30, line: 276 })));
    sezioni.push({ properties: pagina(), footers: { default: piede() }, children: c });
  }
  // lo schema della mappa come testo (modificabile in Word), e la nota sull'AI
  const ultima = sezioni.at(-1);
  if (d.mappa?.testo && ultima) { ultima.children.push(sotto(`${p("mappa")} · ${p("schema")}`)); d.mappa.testo.split("\n").forEach((r) => ultima.children.push(new D.Paragraph({ bullet: { level: r.startsWith("  ") ? 1 : 0 }, spacing: { after: 40 }, children: [run(r.trim(), { size: 20 })] }))); }
  if (ultima && ["tre", "semplice", "domande", "tempo", "contrario", "mappa"].some((k) => presente(d, k))) ultima.children.push(par([run(p("controlla"), { italics: true, colore: GRIGIO_H, size: 17 })], { before: 300 }));

  const doc = new D.Document({
    creator: "Lavagna. by sbob", title: d.v.titolo, description: p("pdfTipo"),
    styles: { default: { document: { run: { font: FONT, size: 22, color: NOTTE_H } } } },
    sections: sezioni,
  });
  scarica(await D.Packer.toBlob(doc), `${nomeFile(d.v.titolo)}.docx`);
}
