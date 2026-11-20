-- video singoli aggiunti da una ricerca su YouTube: li vede solo chi li ha aggiunti
CREATE TABLE IF NOT EXISTS miei_video (
  utente TEXT NOT NULL,
  id TEXT NOT NULL,
  titolo TEXT NOT NULL,
  canale TEXT,
  nome_canale TEXT,
  lingua TEXT,
  cat TEXT NOT NULL,
  durata INTEGER,
  data TEXT,
  creato TEXT NOT NULL,
  PRIMARY KEY (utente, id)
);
