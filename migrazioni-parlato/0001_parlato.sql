-- Database a parte (lavagna-parlato): le trascrizioni dei video e la ricerca dentro il parlato.
-- Il testo intero sta compresso (gzip) in `righe`; la ricerca usa finestre di 120 secondi.
CREATE TABLE IF NOT EXISTS trascrizioni (
  n INTEGER PRIMARY KEY,        -- numero breve: la finestra k di questo video è la riga n*100000+k di `parlato`
  id TEXT NOT NULL UNIQUE,      -- id del video YouTube
  lingua TEXT,
  fonte TEXT NOT NULL,          -- 'yt' sottotitoli di YouTube, 'yt-auto' automatici, 'gemini', 'nessuna'
  righe BLOB,                   -- gzip di JSON [[secondi, testo], …]; NULL se il video non ha parlato
  storyboard TEXT,              -- per i fotogrammi (miniature che YouTube prepara ogni pochi secondi)
  creato TEXT NOT NULL
);
-- solo l'indice delle parole (contentless): il testo vero si rilegge da `righe`
CREATE VIRTUAL TABLE IF NOT EXISTS parlato USING fts5(testo, content = '', columnsize = 0, tokenize = 'unicode61 remove_diacritics 2');
-- video aperti senza trascrizione: lo script dal Mac li fa per primi
CREATE TABLE IF NOT EXISTS richieste (id TEXT PRIMARY KEY, volte INTEGER NOT NULL DEFAULT 1, ultima TEXT NOT NULL);
