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
  await Promise.all(ai.map(async (k) => {
    const r = await fetch(`/api/banco/${k}/${v.id}?ui=${A.ui()}`).catch(() => null);
    d[k] = r?.ok ? await r.json().catch(() => null) : null;
    avanza(k);
  }));
  if (d.mappa?.testo) d.mappa.png = await svgPng(A.svgMappa(d.mappa.testo, d.mappa.centro || v.titolo)).catch(() => null);
  if (scelte.includes("appunti")) {
    d.appunti = await A.appuntiDi(v.id);
    for (const p of d.appunti) p.foto = (await A.fotogramma(v.id, p.da, v.durata).catch(() => null))?.src || null;
    avanza("appunti");
  }
  if (scelte.includes("trascrizione")) { d.trascrizione = (await A.trascrizione(v.id))?.righe || []; avanza("trascrizione"); }
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

// ——— 2 · PDF vero, impaginato (jsPDF): titoli, testi a capo, link cliccabili, immagini, numeri di pagina ———
// I caratteri fuori dalla codifica dei font standard del PDF si sostituiscono (→ diventa ->), così non escono simboli strani.
const SOSTITUTI = { "→": "->", "←": "<-", "▶": ">", "≈": "~", "≤": "<=", "≥": ">=", "×": "x", "•": "-", "″": '"', "′": "'", " ": " " };
const pulisci = (t) => String(t ?? "").normalize("NFC").replace(/[\s\S]/g, (c) => (SOSTITUTI[c] ?? (c.charCodeAt(0) <= 255 || "–—‘’“”…€".includes(c) ? c : ""))).replace(/[ \t]+\n/g, "\n");

export async function pdf(d, A, p) {
  await A.caricaScript("/lib/jspdf.umd.min.js");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  doc.setProperties({ title: d.v.titolo, subject: "Lavagna", creator: "Lavagna. by sbob" });
  let W = 210, H = 297, y = 0;
  const M = 18;
  const larg = () => W - 2 * M;
  const serve = (h) => { if (y + h > H - 20) { doc.addPage("a4", "portrait"); W = 210; H = 297; y = M + 4; } };
  const scrivi = (t, { size = 10.5, stile = "normal", colore = NOTTE, rientro = 0, dopo = 2.2, inter = 1.38 } = {}) => {
    doc.setFont("helvetica", stile); doc.setFontSize(size); doc.setTextColor(...colore);
    const h = size * 0.3528 * inter;
    for (const r of doc.splitTextToSize(pulisci(t), larg() - rientro)) { serve(h); doc.text(r, M + rientro, y + h * 0.78); y += h; }
    y += dopo;
  };
  const link = (t, url, { size = 10, rientro = 0 } = {}) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(size); doc.setTextColor(...BLU);
    const h = size * 0.3528 * 1.4; serve(h);
    doc.textWithLink(pulisci(t), M + rientro, y + h * 0.78, { url }); y += h + 1;
  };
  const sezione = (t) => {
    serve(22); y += 5;
    doc.setFillColor(...BLU); doc.roundedRect(M, y, 10, 1.6, 0.8, 0.8, "F"); y += 4.5;
    scrivi(t, { size: 15.5, stile: "bold", dopo: 2.5 });
  };
  const sottotitolo = (t) => scrivi(t, { size: 11.5, stile: "bold", dopo: 1.2 });

  // copertina
  y = M + 6;
  doc.setFillColor(...NOTTE); doc.rect(0, 0, W, 9, "F");
  scrivi(p("pdfTipo").toUpperCase(), { size: 9, stile: "bold", colore: BLU, dopo: 2 });
  scrivi(d.v.titolo, { size: 21, stile: "bold", inter: 1.2, dopo: 3 });
  scrivi([d.v.nomeCanale, d.v.lingua?.toUpperCase()].filter(Boolean).join(" · "), { size: 11, colore: GRIGIO, dopo: 1 });
  link(linkYT(d.v.id), linkYT(d.v.id));
  scrivi(`${p("creatoIl")} ${d.data.toLocaleDateString(A.ui() === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}`, { size: 9.5, colore: GRIGIO, dopo: 4 });

  if (d.tre?.punti?.length) {
    sezione(p("tre"));
    d.tre.punti.forEach((x, i) => {
      serve(14);
      doc.setFillColor(...BLU); doc.circle(M + 3.6, y + 3.4, 3.6, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(255, 255, 255); doc.text(String(i + 1), M + 3.6, y + 4.6, { align: "center" });
      if (x.titolo) scrivi(x.titolo, { size: 11.5, stile: "bold", rientro: 11, dopo: 0.6 });
      scrivi(x.testo, { rientro: 11, dopo: 3.5 });
    });
  }
  if (d.semplice?.riassunto) {
    sezione(p("semplice"));
    scrivi(d.semplice.riassunto, { size: 11.5, dopo: 3 });
    if (d.semplice.punti?.length) { sottotitolo(p("punti")); d.semplice.punti.forEach((x) => scrivi(`-  ${x}`, { rientro: 2, dopo: 1 })); y += 2; }
    if (d.semplice.glossario?.length) { sottotitolo(p("glossario")); d.semplice.glossario.forEach((g) => { scrivi(g.termine, { stile: "bold", dopo: 0.3 }); scrivi(g.spiegazione, { colore: GRIGIO, rientro: 4, dopo: 1.8 }); }); }
  }
  if (d.domande?.domande?.length) {
    sezione(p("domande"));
    d.domande.domande.forEach((x, i) => { scrivi(`${i + 1}. ${x.d}`, { stile: "bold", dopo: 0.6 }); scrivi(x.r, { colore: GRIGIO, rientro: 5, dopo: 2.6 }); });
  }
  if (d.tempo?.eventi?.length) {
    sezione(p("tempo"));
    d.tempo.eventi.forEach((e) => {
      scrivi(e.quando, { stile: "bold", colore: BLU, dopo: 0.3 });
      scrivi(e.cosa, { rientro: 4, dopo: 0.3 });
      if (e.sec) link(`${p("vaiAlMinuto")} ${tempo(e.sec)}`, linkYT(d.v.id, e.sec), { size: 9, rientro: 4 });
      y += 1.5;
    });
  }
  if (d.contrario?.tesi) {
    sezione(p("contrario"));
    sottotitolo(p("tesi")); scrivi(d.contrario.tesi, { dopo: 3 });
    sottotitolo(p("opposta")); scrivi(d.contrario.opposta, { dopo: 3 });
    if (d.contrario.video?.length) { sottotitolo(p("altraParte")); d.contrario.video.forEach((x) => { scrivi(`${x.titolo}${x.nomeCanale ? ` — ${x.nomeCanale}` : ""}`, { dopo: 0.2 }); link(linkYT(x.id), linkYT(x.id), { size: 9 }); }); }
  }
  if (d.simili?.momenti?.length) {
    sezione(p("simili"));
    d.simili.momenti.forEach((m) => {
      scrivi(`${m.titolo || m.id}${m.nomeCanale ? ` — ${m.nomeCanale}` : ""}`, { stile: "bold", dopo: 0.3 });
      scrivi(`«${m.estratto}»`, { size: 9.8, colore: GRIGIO, rientro: 4, dopo: 0.3 });
      link(`${p("vaiAlMinuto")} ${tempo(m.da)}`, linkYT(m.id, m.da), { size: 9, rientro: 4 });
      y += 1.5;
    });
  }
  if (d.appunti?.length) {
    sezione(p("ap"));
    for (const n of d.appunti) {
      const alto = n.foto ? 32 : 0;
      serve(Math.max(alto, 14) + 4);
      const y0 = y;
      if (n.foto) doc.addImage(n.foto, "JPEG", M, y, 56, 31.5);
      const rientro = n.foto ? 61 : 0;
      link(`${tempo(n.da)}${n.a > n.da ? `–${tempo(n.a)}` : ""}`, linkYT(d.v.id, n.da), { size: 10, rientro });
      if (n.testo) scrivi(n.testo, { rientro, dopo: 1 });
      if (n.estratto) scrivi(`«${n.estratto}»`, { size: 9.5, colore: GRIGIO, rientro, dopo: 1 });
      y = Math.max(y, y0 + alto) + 4;
    }
  }
  if (d.trascrizione?.length) {
    sezione(p("tr"));
    for (const [t, x] of d.trascrizione) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...BLU);
      const h = 9.5 * 0.3528 * 1.35;
      const righe = doc.splitTextToSize(pulisci(x), larg() - 16);
      serve(h);
      doc.text(tempo(t), M, y + h * 0.78);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9.5); doc.setTextColor(...NOTTE);
      for (const r of righe) { serve(h); doc.text(r, M + 16, y + h * 0.78); y += h; }
    }
  }
  y += 4; scrivi(p("controlla"), { size: 8.5, stile: "italic", colore: GRIGIO });
  // la mappa mentale: una pagina orizzontale tutta per lei
  if (d.mappa?.png) {
    doc.addPage("a4", "landscape"); W = 297; H = 210; y = M;
    scrivi(p("mappa"), { size: 15.5, stile: "bold", dopo: 3 });
    const maxW = W - 2 * M, maxH = H - y - 18, k = Math.min(maxW / d.mappa.png.w, maxH / d.mappa.png.h);
    doc.addImage(d.mappa.png.src, "PNG", M + (maxW - d.mappa.png.w * k) / 2, y, d.mappa.png.w * k, d.mappa.png.h * k);
  }
  // piè di pagina su ogni pagina
  const n = doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.getWidth(), h = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...[221, 227, 241]); doc.setLineWidth(0.3); doc.line(M, h - 13, w - M, h - 13);
    doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...NOTTE); doc.text("Lavagna.", M, h - 8.5);
    doc.setFont("helvetica", "normal"); doc.setTextColor(...GRIGIO); doc.text("by sbob", M + 13.5, h - 8.5);
    doc.text(pulisci(d.v.titolo).slice(0, 70), w / 2, h - 8.5, { align: "center" });
    doc.text(`${i} / ${n}`, w - M, h - 8.5, { align: "right" });
  }
  scarica(doc.output("blob"), `${nomeFile(d.v.titolo)}.pdf`);
}

// ——— 3 · Word vero (.docx): titoli con gli stili di Word, elenchi, link, immagini, numeri di pagina ———
export async function word(d, A, p) {
  await A.caricaScript("/lib/docx.umd.js");
  const D = window.docx;
  const k = [];
  const par = (testo, o = {}) => new D.Paragraph({ spacing: { after: o.after ?? 120 }, indent: o.rientro ? { left: o.rientro } : undefined, children: [new D.TextRun({ text: testo || "", bold: o.bold, italics: o.italics, color: o.colore, size: o.size })] });
  const titolo = (t, livello = D.HeadingLevel.HEADING_1) => new D.Paragraph({ heading: livello, children: [new D.TextRun(t)] });
  const collegamento = (t, url, o = {}) => new D.Paragraph({ spacing: { after: o.after ?? 120 }, indent: o.rientro ? { left: o.rientro } : undefined, children: [new D.ExternalHyperlink({ link: url, children: [new D.TextRun({ text: t, style: "Hyperlink", size: o.size })] })] });
  const immagine = (src, w, h, after = 160) => new D.Paragraph({ spacing: { after }, children: [new D.ImageRun({ data: byte(src), transformation: { width: Math.round(w), height: Math.round(h) } })] });

  k.push(par(p("pdfTipo").toUpperCase(), { bold: true, colore: "4C6EF5", size: 18 }));
  k.push(titolo(d.v.titolo, D.HeadingLevel.TITLE));
  k.push(par([d.v.nomeCanale, d.v.lingua?.toUpperCase()].filter(Boolean).join(" · "), { colore: "5C6585" }));
  k.push(collegamento(linkYT(d.v.id), linkYT(d.v.id)));
  k.push(par(`${p("creatoIl")} ${d.data.toLocaleDateString(A.ui() === "it" ? "it-IT" : "en-GB", { day: "numeric", month: "long", year: "numeric" })}`, { colore: "5C6585", size: 18, after: 240 }));

  if (d.tre?.punti?.length) {
    k.push(titolo(p("tre")));
    d.tre.punti.forEach((x, i) => {
      k.push(new D.Paragraph({ spacing: { after: 40 }, children: [new D.TextRun({ text: `${i + 1}  `, bold: true, color: "4C6EF5", size: 28 }), new D.TextRun({ text: x.titolo || "", bold: true })] }));
      k.push(par(x.testo, { rientro: 400, after: 160 }));
    });
  }
  if (d.semplice?.riassunto) {
    k.push(titolo(p("semplice")));
    k.push(par(d.semplice.riassunto, { size: 23 }));
    if (d.semplice.punti?.length) { k.push(titolo(p("punti"), D.HeadingLevel.HEADING_2)); d.semplice.punti.forEach((x) => k.push(new D.Paragraph({ text: x, bullet: { level: 0 } }))); }
    if (d.semplice.glossario?.length) { k.push(titolo(p("glossario"), D.HeadingLevel.HEADING_2)); d.semplice.glossario.forEach((g) => k.push(new D.Paragraph({ spacing: { after: 80 }, children: [new D.TextRun({ text: `${g.termine}: `, bold: true }), new D.TextRun(g.spiegazione)] }))); }
  }
  if (d.mappa?.png) {
    k.push(titolo(p("mappa")));
    const larg = 600, alto = (d.mappa.png.h / d.mappa.png.w) * larg;
    k.push(immagine(d.mappa.png.src, larg, Math.min(alto, 800)));
    // anche come schema di testo, che si può modificare in Word
    d.mappa.testo.split("\n").forEach((r) => k.push(new D.Paragraph({ text: r.trim(), bullet: { level: r.startsWith("  ") ? 1 : 0 } })));
  }
  if (d.domande?.domande?.length) {
    k.push(titolo(p("domande")));
    d.domande.domande.forEach((x, i) => { k.push(par(`${i + 1}. ${x.d}`, { bold: true, after: 40 })); k.push(par(x.r, { rientro: 360, colore: "5C6585" })); });
  }
  if (d.tempo?.eventi?.length) {
    k.push(titolo(p("tempo")));
    d.tempo.eventi.forEach((e) => {
      k.push(new D.Paragraph({ spacing: { after: 40 }, children: [new D.TextRun({ text: `${e.quando}  `, bold: true, color: "4C6EF5" }), new D.TextRun(e.cosa)] }));
      if (e.sec) k.push(collegamento(`${p("vaiAlMinuto")} ${tempo(e.sec)}`, linkYT(d.v.id, e.sec), { rientro: 360, size: 18 }));
    });
  }
  if (d.contrario?.tesi) {
    k.push(titolo(p("contrario")));
    k.push(titolo(p("tesi"), D.HeadingLevel.HEADING_2)); k.push(par(d.contrario.tesi));
    k.push(titolo(p("opposta"), D.HeadingLevel.HEADING_2)); k.push(par(d.contrario.opposta));
    if (d.contrario.video?.length) { k.push(titolo(p("altraParte"), D.HeadingLevel.HEADING_2)); d.contrario.video.forEach((x) => k.push(collegamento(`${x.titolo}${x.nomeCanale ? ` — ${x.nomeCanale}` : ""}`, linkYT(x.id)))); }
  }
  if (d.simili?.momenti?.length) {
    k.push(titolo(p("simili")));
    d.simili.momenti.forEach((m) => {
      k.push(par(`${m.titolo || m.id}${m.nomeCanale ? ` — ${m.nomeCanale}` : ""}`, { bold: true, after: 40 }));
      k.push(par(`«${m.estratto}»`, { italics: true, colore: "5C6585", rientro: 360, after: 40 }));
      k.push(collegamento(`${p("vaiAlMinuto")} ${tempo(m.da)}`, linkYT(m.id, m.da), { rientro: 360, size: 18 }));
    });
  }
  if (d.appunti?.length) {
    k.push(titolo(p("ap")));
    for (const n of d.appunti) {
      k.push(collegamento(`${tempo(n.da)}${n.a > n.da ? `–${tempo(n.a)}` : ""}`, linkYT(d.v.id, n.da), { after: 60 }));
      if (n.foto) k.push(immagine(n.foto, 240, 135, 60));
      if (n.testo) k.push(par(n.testo, { after: 60 }));
      if (n.estratto) k.push(par(`«${n.estratto}»`, { italics: true, colore: "5C6585", after: 200 }));
    }
  }
  if (d.trascrizione?.length) {
    k.push(titolo(p("tr")));
    d.trascrizione.forEach(([t, x]) => k.push(new D.Paragraph({ spacing: { after: 30 }, children: [new D.TextRun({ text: `${tempo(t)}  `, bold: true, color: "4C6EF5", size: 18 }), new D.TextRun({ text: x, size: 20 })] })));
  }
  k.push(par(p("controlla"), { italics: true, colore: "5C6585", size: 18 }));

  const doc = new D.Document({
    creator: "Lavagna. by sbob", title: d.v.titolo, description: "Lavagna · SCHOOL",
    styles: {
      default: { document: { run: { font: "Calibri", size: 22, color: "1B2140" } } },
      paragraphStyles: [
        { id: "Title", name: "Title", basedOn: "Normal", next: "Normal", run: { size: 44, bold: true, color: "1B2140" }, paragraph: { spacing: { after: 120 } } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, color: "1B2140" }, paragraph: { spacing: { before: 360, after: 140 }, border: { top: { color: "4C6EF5", space: 6, style: D.BorderStyle.SINGLE, size: 12 } } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 24, bold: true, color: "4C6EF5" }, paragraph: { spacing: { before: 200, after: 80 } } },
      ],
    },
    sections: [{
      footers: { default: new D.Footer({ children: [new D.Paragraph({ alignment: D.AlignmentType.RIGHT, children: [
        new D.TextRun({ text: "Lavagna.", bold: true, size: 16, color: "1B2140" }), new D.TextRun({ text: " by sbob · ", size: 16, color: "5C6585" }),
        new D.TextRun({ children: [D.PageNumber.CURRENT], size: 16, color: "5C6585" }) ] })] }) },
      children: k,
    }],
  });
  scarica(await D.Packer.toBlob(doc), `${nomeFile(d.v.titolo)}.docx`);
}
