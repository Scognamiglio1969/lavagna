-- SCHOOL: ognuno usa la sua chiave Gemini gratuita. Il server non la conserva: tiene solo l'impronta (SHA-256),
-- così una stessa chiave non può servire a più Lavagne (un freno a chi si registra tante volte).
CREATE TABLE IF NOT EXISTS chiavi_gemini (
  impronta TEXT PRIMARY KEY,
  utente TEXT NOT NULL UNIQUE,
  creato TEXT NOT NULL
);
