-- La chiave Gemini di ciascuno si conserva nella sua Lavagna, cifrata (AES-GCM con un segreto del server):
-- così vale su tutti i suoi dispositivi e non serve chiederla di nuovo. L'impronta resta per «una chiave = una Lavagna».
ALTER TABLE chiavi_gemini ADD COLUMN cifrata TEXT;
