# Letture contatori — PWA V1

Applicazione web installabile su smartphone per acquisire una foto di un contatore elettrico, eseguire OCR nel browser, proporre codice contatore e lettura kWh, farli verificare all'operatore e registrare lo storico.

## Funzioni
- Fotocamera posteriore o immagine esistente.
- Pre-processing locale (scala di grigi + aumento contrasto).
- OCR con Tesseract.js.
- Estrazione euristica di codice e valore numerico.
- Conferma manuale obbligatoria prima del salvataggio.
- Storico locale sul dispositivo.
- Esportazione CSV con separatore `;`, adatto a Excel italiano.
- PWA installabile e application shell disponibile offline dopo il primo caricamento.

## Avvio
Servire la cartella via HTTPS (per esempio GitHub Pages). Aprire `index.html` da smartphone. Su iPhone: Safari → Condividi → Aggiungi alla schermata Home.

## Nota OCR
La V1 non considera l'OCR come fonte affidabile senza verifica umana. Foto inclinate, display LCD a basso contrasto, riflessi e più numeri sulla targhetta possono produrre letture errate. La fase successiva prevista è calibrare ROI e regole di riconoscimento sui modelli reali di contatore e sulle foto di campo.

## Privacy
Nella V1 l'immagine viene elaborata nel browser e non viene salvata nello storico. I dati delle letture sono memorizzati in `localStorage`; l'operatore può esportarli in CSV.