-- Indici per "Esplora" senza parole (più recenti / più visti) e contatore dei video
CREATE INDEX IF NOT EXISTS video_data ON video(data DESC);
CREATE INDEX IF NOT EXISTS video_viste ON video(viste DESC);
INSERT OR IGNORE INTO stato (chiave, valore) SELECT 'totale', COUNT(*) FROM video;
