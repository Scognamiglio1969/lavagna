-- quante finestre di parlato contengono ogni parola: serve a capire quali parole sono rare (e quindi dicono di cosa parla un video)
CREATE VIRTUAL TABLE IF NOT EXISTS parlato_vocab USING fts5vocab(parlato, 'row');
