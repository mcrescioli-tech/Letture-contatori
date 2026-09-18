# Test V8.3

1. Seleziona dall'elenco l'ID del contatore: è il riferimento principale; il riconoscimento della targhetta è solo un controllo ausiliario.
2. Scatta o scegli la foto.
3. Seleziona con il dito un rettangolo stretto intorno alla sola riga numerica del display, includendo il separatore decimale.
4. Verifica che il profilo caricato riporti cifre, decimali e unità attesi.
5. Premi **Leggi il display**, confronta i candidati con il display e conferma manualmente la lettura prima del salvataggio.

Il test deve coprire tutti i 19 campioni in `dataset/ground-truth.json`, non solo QKL8.
Per ciascun errore, conserva la schermata **Diagnostica OCR**, il candidato proposto, quello corretto e il ritaglio display. Non usare il risultato OCR come correzione automatica.

Caso di riferimento: QKL8, lettura attesa dalla foto di test: 940703.3 kWh.
