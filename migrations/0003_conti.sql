-- «La mia Lavagna»: account leggeri con passkey (niente email, niente password)
CREATE TABLE IF NOT EXISTS utenti (
  id TEXT PRIMARY KEY,          -- casuale, non dice niente della persona
  nome TEXT NOT NULL,           -- come vuole essere chiamato (anche un nomignolo)
  creato TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS passkey (
  id TEXT PRIMARY KEY,          -- id della credenziale (base64url)
  utente TEXT NOT NULL,
  chiave TEXT NOT NULL,         -- chiave pubblica (base64url): la chiave privata resta sul dispositivo
  contatore INTEGER NOT NULL DEFAULT 0,
  trasporti TEXT,
  creato TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS passkey_utente ON passkey(utente);
CREATE TABLE IF NOT EXISTS sessioni (
  token TEXT PRIMARY KEY,       -- impronta SHA-256 del token: il token vero sta solo nel cookie
  utente TEXT NOT NULL,
  scade TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessioni_utente ON sessioni(utente);

-- canali e argomenti personali: li vede solo chi li ha aggiunti
CREATE TABLE IF NOT EXISTS miei_canali (
  utente TEXT NOT NULL,
  id TEXT NOT NULL,
  nome TEXT NOT NULL,
  lingua TEXT NOT NULL,
  cat TEXT NOT NULL,
  creato TEXT NOT NULL,
  PRIMARY KEY (utente, id)
);
CREATE TABLE IF NOT EXISTS miei_argomenti (
  utente TEXT NOT NULL,
  id TEXT NOT NULL,
  nome TEXT NOT NULL,
  segno TEXT NOT NULL,
  ricerche TEXT NOT NULL,       -- JSON [[testo, lingua], …]
  creato TEXT NOT NULL,
  PRIMARY KEY (utente, id)
);
