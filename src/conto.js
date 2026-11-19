// «La mia Lavagna»: account leggeri con passkey (Face ID, Touch ID, impronta, chiave di sicurezza).
// Niente email e niente password: il server tiene solo un id casuale, il nome scelto e la chiave pubblica della passkey.
import {
  generateRegistrationOptions, verifyRegistrationResponse,
  generateAuthenticationOptions, verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

const COOKIE = "lavagna_sessione";
const DURATA_GIORNI = 180;
const MAX_REGISTRAZIONI_IP = 10; // al giorno, per indirizzo: basta per una famiglia, ferma i robot

const json = (dati, stato = 200, intestazioni = {}) =>
  new Response(JSON.stringify(dati), { status: stato, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...intestazioni } });
const casuale = (n = 32) => isoBase64URL.fromBuffer(crypto.getRandomValues(new Uint8Array(n)));
const ora = () => new Date().toISOString();
async function impronta(testo) {
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(testo));
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
const cookieDi = (req) => (req.headers.get("cookie") || "").split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) || "";
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
    const ip = req.headers.get("cf-connecting-ip") || "locale";
    const chiave = `reg:${ip}:${ora().slice(0, 10)}`;
    const n = Number(await env.LAVAGNA.get(chiave)) || 0;
    if (n >= MAX_REGISTRAZIONI_IP) return json({ errore: "troppe" }, 429);
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
    const ip = req.headers.get("cf-connecting-ip") || "locale";
    const chiave = `reg:${ip}:${ora().slice(0, 10)}`;
    await env.LAVAGNA.put(chiave, String((Number(await env.LAVAGNA.get(chiave)) || 0) + 1), { expirationTtl: 86400 });
    await env.DB.batch([
      env.DB.prepare("INSERT INTO utenti (id, nome, creato) VALUES (?, ?, ?)").bind(s.idUtente, s.nome, ora()),
      env.DB.prepare("INSERT INTO passkey (id, utente, chiave, contatore, trasporti, creato) VALUES (?, ?, ?, ?, ?, ?)")
        .bind(c.id, s.idUtente, isoBase64URL.fromBuffer(c.publicKey), c.counter || 0, JSON.stringify(c.transports || []), ora()),
    ]);
    return json({ nome: s.nome }, 200, { "set-cookie": await apriSessione(env, s.idUtente) });
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

  if (azione === "/esci") {
    const token = cookieDi(req);
    if (token) await env.DB.prepare("DELETE FROM sessioni WHERE token = ?").bind(await impronta(token)).run();
    return json({ ok: true }, 200, { "set-cookie": cookieSessione("", 0) });
  }

  // cancellare l'account: via utente, passkey, sessioni e tutto ciò che aveva aggiunto
  if (azione === "/cancella") {
    const u = await utenteDa(req, env);
    if (!u) return json({ errore: "accesso" }, 401);
    await env.DB.batch(["miei_canali", "miei_argomenti", "sessioni", "passkey"].map((t) =>
      env.DB.prepare(`DELETE FROM ${t} WHERE utente = ?`).bind(u.id)).concat(env.DB.prepare("DELETE FROM utenti WHERE id = ?").bind(u.id)));
    return json({ ok: true }, 200, { "set-cookie": cookieSessione("", 0) });
  }

  return json({ errore: "azione" }, 404);
}
