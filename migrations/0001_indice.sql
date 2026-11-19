-- Tutti i video che il server ha visto, da qualunque fonte
CREATE TABLE IF NOT EXISTS video (
  id TEXT PRIMARY KEY,
  fonte TEXT NOT NULL DEFAULT 'yt',
  titolo TEXT NOT NULL,
  descrizione TEXT,
  data TEXT,
  canale TEXT NOT NULL,
  nome_canale TEXT,
  lingua TEXT,
  cat TEXT,
  thumb TEXT,
  link TEXT,
  embed TEXT,
  durata INTEGER,           -- secondi; NULL se non si sa ancora
  viste INTEGER DEFAULT 0,
  visto_il TEXT NOT NULL,   -- quando il server l'ha incontrato la prima volta
  vettore INTEGER DEFAULT 0 -- 1 quando è nell'indice per significato
);
CREATE INDEX IF NOT EXISTS video_cat_data ON video(cat, data DESC);
CREATE INDEX IF NOT EXISTS video_canale_data ON video(canale, data DESC);
CREATE INDEX IF NOT EXISTS video_vettore ON video(vettore, data DESC);
CREATE INDEX IF NOT EXISTS video_durata ON video(fonte, durata);

-- Ricerca a parole (senza accenti: "citta" trova "città")
CREATE VIRTUAL TABLE IF NOT EXISTS parole USING fts5(
  id UNINDEXED, titolo, descrizione, nome_canale,
  tokenize = 'unicode61 remove_diacritics 2'
);

-- Stato dei lavori periodici (a che punto è il giro, pagine dell'archivio YouTube già lette)
CREATE TABLE IF NOT EXISTS stato (chiave TEXT PRIMARY KEY, valore TEXT);
