// «La mia Lavagna»: account leggeri con passkey (Face ID, Touch ID, impronta, chiave di sicurezza).
// Niente email e niente password: il server tiene solo un id casuale, il nome scelto e la chiave pubblica della passkey.
import {
  generateRegistrationOptions, verifyRegistrationResponse,
  generateAuthenticationOptions, verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

const COOKIE = "lavagna_sessione";
const DURATA_GIORNI = 180;
// freni contro chi si registra tante volte (nessuno basta da solo, insieme sì):
// · per indirizzo: poche al giorno e al mese · per dispositivo: un segno nel browser, al massimo 2 Lavagne
// · per SCHOOL: ogni Lavagna deve avere la sua chiave Gemini, e una chiave vale per una sola Lavagna
const MAX_REGISTRAZIONI_IP = 3, MAX_REGISTRAZIONI_IP_MESE = 6, MAX_PER_DISPOSITIVO = 2;
const DISPOSITIVO = "lavagna_dispositivo";

const json = (dati, stato = 200, intestazioni = {}) =>
  new Response(JSON.stringify(dati), { status: stato, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...intestazioni } });
const casuale = (n = 32) => isoBase64URL.fromBuffer(crypto.getRandomValues(new Uint8Array(n)));
const ora = () => new Date().toISOString();
async function impronta(testo) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(testo));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const cookieDi = (req) => (req.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) || "";
const dispositivoDi = (req) => (req.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(`${DISPOSITIVO}=`))?.slice(DISPOSITIVO.length + 1) || "";
async function contiRegistrazioni(env, req) {
  const ip = req.headers.get("cf-connecting-ip") || "locale", d = ora();
  const disp = dispositivoDi(req);
  const chiavi = { giorno: `reg:${ip}:${d.slice(0, 10)}`, mese: `regm:${ip}:${d.slice(0, 7)}`, disp: disp ? `disp:${await impronta(disp)}` : "" };
  const [g, m, x] = await Promise.all([env.LAVAGNA.get(chiavi.giorno), env.LAVAGNA.get(chiavi.mese), chiavi.disp ? env.LAVAGNA.get(chiavi.disp) : null]);
  return { chiavi, giorno: Number(g) || 0, mese: Number(m) || 0, disp: Number(x) || 0, troppe: (Number(g) || 0) >= MAX_REGISTRAZIONI_IP || (Number(m) || 0) >= MAX_REGISTRAZIONI_IP_MESE || (Number(x) || 0) >= MAX_PER_DISPOSITIVO };
}
const cookieSessione = (token, secondi) =>
  `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${secondi}`;

// chi sta facendo la richiesta (null se nessuno)
export async function utenteDa(req, env) {
  const token = cookieDi(req);
  if (!token || !env.DB) return null;
  const r = await env.DB.prepare(
    "SELECT u.id, u.nome FROM sessioni s JOIN utenti u ON u.id = s.utente WHERE s.token = ? AND s.scade > ?",
  ).bind(await impronta(token), ora()).first();
  return r || null;
}

async function apriSessione(env, utente) {
  const token = casuale();
  const scade = new Date(Date.now() + DURATA_GIORNI * 864e5).toISOString();
  await env.DB.prepare("INSERT INTO sessioni (token, utente, scade) VALUES (?, ?, ?)").bind(await impronta(token), utente, scade).run();
  return cookieSessione(token, DURATA_GIORNI * 86400);
}

// la sfida della passkey vale 5 minuti
async function salvaSfida(env, dati) {
  const id = casuale(16);
  await env.LAVAGNA.put(`sfida:${id}`, JSON.stringify(dati), { expirationTtl: 300 });
  return id;
}
async function prendiSfida(env, id) {
  if (!/^[\w-]{10,40}$/.test(id || "")) return null;
  const d = await env.LAVAGNA.get(`sfida:${id}`, "json");
  if (d) await env.LAVAGNA.delete(`sfida:${id}`); // una sola volta
  return d;
}

export async function gestisciConto(req, env, pathname) {
  const url = new URL(req.url);
  const rpID = url.hostname, origine = url.origin;
  const corpo = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const azione = pathname.slice("/api/conto".length) || "/";

  if (azione === "/" && req.method === "GET") {
    const u = await utenteDa(req, env);
    return json(u ? { nome: u.nome } : null);
  }

  // ——— registrazione: un nome e una passkey ———
  if (azione === "/registra-inizio") {
    const nome = String(corpo.nome || "").trim().replace(/\s+/g, " ").slice(0, 40);
    if (nome.length < 2) return json({ errore: "nome" }, 400);
    if ((await contiRegistrazioni(env, req)).troppe) return json({ errore: "troppe" }, 429);
    const idUtente = casuale(16);
    const opzioni = await generateRegistrationOptions({
      rpName: "Lavagna", rpID, userName: nome, userDisplayName: nome,
      userID: new TextEncoder().encode(idUtente), attestationType: "none",
      authenticatorSelection: { residentKey: "required", userVerification: "preferred" },
    });
    const sfida = await salvaSfida(env, { challenge: opzioni.challenge, idUtente, nome });
    return json({ sfida, opzioni });
  }
  if (azione === "/registra-fine") {
    const s = await prendiSfida(env, corpo.sfida);
    if (!s) return json({ errore: "scaduta" }, 400);
    let esito;
    try {
      esito = await verifyRegistrationResponse({ response: corpo.risposta, expectedChallenge: s.challenge, expectedOrigin: origine, expectedRPID: rpID });
    } catch { return json({ errore: "passkey" }, 400); }
    if (!esito.verified) return json({ errore: "passkey" }, 400);
    const c = esito.registrationInfo.credential;
    const r = await contiRegistrazioni(env, req);
    if (r.troppe) return json({ errore: "troppe" }, 429);
    // il segno del dispositivo: resta due anni nel browser (non dice niente di chi sei, conta solo le Lavagne create qui)
    const disp = dispositivoDi(req) || casuale(18);
    await Promise.all([
      env.LAVAGNA.put(r.chiavi.giorno, String(r.giorno + 1), { expirationTtl: 86400 }),
      env.LAVAGNA.put(r.chiavi.mese, String(r.mese + 1), { expirationTtl: 31 * 86400 }),
      env.LAVAGNA.put(`disp:${await impronta(disp)}`, String(r.disp + 1)),
    ]);
    await env.DB.batch([
      env.DB.prepare("INSERT INTO utenti (id, nome, creato) VALUES (?, ?, ?)").bind(s.idUtente, s.nome, ora()),
      env.DB.prepare("INSERT INTO passkey (id, utente, chiave, contatore, trasporti, creato) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(c.id, s.idUtente, isoBase64URL.fromBuffer(c.publicKey), c.counter || 0, JSON.stringify(c.transports || []), ora()),
    ]);
    const h = new Headers({ "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
    h.append("set-cookie", await apriSessione(env, s.idUtente));
    h.append("set-cookie", `${DISPOSITIVO}=${disp}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${2 * 365 * 86400}`);
    return new Response(JSON.stringify({ nome: s.nome }), { status: 200, headers: h });
  }

  // ——— accesso: la passkey già salvata sul dispositivo ———
  if (azione === "/entra-inizio") {
    const opzioni = await generateAuthenticationOptions({ rpID, userVerification: "preferred" });
    const sfida = await salvaSfida(env, { challenge: opzioni.challenge });
    return json({ sfida, opzioni });
  }
  if (azione === "/entra-fine") {
    const s = await prendiSfida(env, corpo.sfida);
    if (!s) return json({ errore: "scaduta" }, 400);
    const p = await env.DB.prepare("SELECT * FROM passkey WHERE id = ?").bind(String(corpo.risposta?.id || "")).first();
    if (!p) return json({ errore: "sconosciuta" }, 400);
    let esito;
    try {
      esito = await verifyAuthenticationResponse({
        response: corpo.risposta, expectedChallenge: s.challenge, expectedOrigin: origine, expectedRPID: rpID,
        credential: { id: p.id, publicKey: isoBase64URL.toBuffer(p.chiave), counter: p.contatore, transports: JSON.parse(p.trasporti || "[]") },
      });
    } catch { return json({ errore: "passkey" }, 400); }
    if (!esito.verified) return json({ errore: "passkey" }, 400);
    await env.DB.prepare("UPDATE passkey SET contatore = ? WHERE id = ?").bind(esito.authenticationInfo.newCounter, p.id).run();
    const u = await env.DB.prepare("SELECT nome FROM utenti WHERE id = ?").bind(p.utente).first();
    return json({ nome: u?.nome || "" }, 200, { "set-cookie": await apriSessione(env, p.utente) });
  }

  // ——— SCHOOL: la chiave Gemini di chi usa Lavagna (resta nel suo browser; qui solo l'impronta) ———
  if (azione === "/gemini" && req.method === "POST") {
    const u = await utenteDa(req, env);
    if (!u) return json({ errore: "accesso" }, 401);
    const chiave = String(corpo.chiave || "").replace(/\s+/g, "");
    if (!/^[\w.-]{30,200}$/.test(chiave)) return json({ errore: "formato" }, 400);
    // la chiave funziona? (l'elenco dei modelli non consuma la quota)
    const prova = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", { headers: { "x-goog-api-key": chiave } }).catch(() => null);
    if (!prova?.ok) return json({ errore: "nonValida" }, 400);
    const imp = await impronta(`gemini:${chiave}`);
    const gia = await env.DB.prepare("SELECT utente FROM chiavi_gemini WHERE impronta = ?").bind(imp).first();
    if (gia && gia.utente !== u.id) return json({ errore: "giaUsata" }, 409);
    await env.DB.batch([
      env.DB.prepare("DELETE FROM chiavi_gemini WHERE utente = ?").bind(u.id),
      env.DB.prepare("INSERT INTO chiavi_gemini (impronta, utente, creato, cifrata) VALUES (?, ?, ?, ?)").bind(imp, u.id, ora(), await cifra(env, chiave)),
    ]);
    return json({ ok: true });
  }
  if (azione === "/gemini-togli" && req.method === "POST") {
    const u = await utenteDa(req, env);
    if (!u) return json({ errore: "accesso" }, 401);
    await env.DB.prepare("DELETE FROM chiavi_gemini WHERE utente = ?").bind(u.id).run();
    return json({ ok: true });
  }

  if (azione === "/esci") {
    const token = cookieDi(req);
    if (token) await env.DB.prepare("DELETE FROM sessioni WHERE token = ?").bind(await impronta(token)).run();
    return json({ ok: true }, 200, { "set-cookie": cookieSessione("", 0) });
  }

  // cancellare l'account: via utente, passkey, sessioni e tutto ciò che aveva aggiunto
  if (azione === "/cancella") {
    const u = await utenteDa(req, env);
    if (!u) return json({ errore: "accesso" }, 401);
    await env.DB.batch(["miei_canali", "miei_argomenti", "miei_video", "quaderno", "chiavi_gemini", "sessioni", "passkey"].map((t) =>
      env.DB.prepare(`DELETE FROM ${t} WHERE utente = ?`).bind(u.id)).concat(env.DB.prepare("DELETE FROM utenti WHERE id = ?").bind(u.id)));
    return json({ ok: true }, 200, { "set-cookie": cookieSessione("", 0) });
  }

  return json({ errore: "azione" }, 404);
}

// la chiave mandata con la richiesta è proprio quella collegata a questa Lavagna?
export async function chiaveDi(env, utente, chiave) {
  if (!utente || !/^[\w.-]{30,200}$/.test(chiave || "")) return false;
  const r = await env.DB.prepare("SELECT utente FROM chiavi_gemini WHERE impronta = ?").bind(await impronta(`gemini:${chiave}`)).first();
  return r?.utente === utente;
}
export async function haChiave(env, utente) {
  return !!(await env.DB.prepare("SELECT 1 AS x FROM chiavi_gemini WHERE utente = ?").bind(utente).first().catch(() => null));
}

// ——— la chiave Gemini conservata nella Lavagna di ciascuno, cifrata (AES-GCM; il segreto CHIAVE_CIFRA sta solo nel server) ———
async function chiaveAes(env) {
  if (!env.CHIAVE_CIFRA) throw new Error("manca CHIAVE_CIFRA");
  const grezza = Uint8Array.from(atob(env.CHIAVE_CIFRA), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", await crypto.subtle.digest("SHA-256", grezza), "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function cifra(env, testo) {
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const c = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await chiaveAes(env), new TextEncoder().encode(testo)));
    return `${isoBase64URL.fromBuffer(iv)}.${isoBase64URL.fromBuffer(c)}`;
  } catch { return null; }
}
async function decifra(env, scatola) {
  try {
    const [iv, c] = String(scatola || "").split(".");
    const t = await crypto.subtle.decrypt({ name: "AES-GCM", iv: isoBase64URL.toBuffer(iv) }, await chiaveAes(env), isoBase64URL.toBuffer(c));
    return new TextDecoder().decode(t);
  } catch { return ""; }
}
// la chiave salvata di questa Lavagna ("" se non c'è)
export async function chiaveSalvata(env, utente) {
  const r = await env.DB.prepare("SELECT cifrata FROM chiavi_gemini WHERE utente = ?").bind(utente).first().catch(() => null);
  return r?.cifrata ? await decifra(env, r.cifrata) : "";
}
// una chiave arrivata dal browser e già collegata a questa Lavagna, ma non ancora salvata: si salva (così non si chiede più)
export async function salvaSeManca(env, utente, chiave) {
  await env.DB.prepare("UPDATE chiavi_gemini SET cifrata = ? WHERE utente = ? AND cifrata IS NULL").bind(await cifra(env, chiave), utente).run().catch(() => {});
}
