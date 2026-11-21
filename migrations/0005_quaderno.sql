-- Il quaderno di ognuno: appunti col minutaggio, lezioni (insegnanti) e ricerche (studenti).
-- `dati` è JSON; `pubblico` è l'id del link condiviso (NULL = privato).
CREATE TABLE IF NOT EXISTS quaderno (
  utente TEXT NOT NULL,
  id TEXT NOT NULL,
  tipo TEXT NOT NULL,           -- 'appunto' | 'lezione'
  dati TEXT NOT NULL,
  aggiornato TEXT NOT NULL,
  pubblico TEXT,
  PRIMARY KEY (utente, id)
);
CREATE UNIQUE INDEX IF NOT EXISTS quaderno_pubblico ON quaderno(pubblico) WHERE pubblico IS NOT NULL;
