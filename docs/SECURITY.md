# Security Policy / Politica di Sicurezza

## 1. Segnalazione di vulnerabilità

Apprezziamo il contributo della community per mantenere Flowgen sicuro. Se scopri una vulnerabilità o un comportamento sospetto, ti preghiamo di segnalarlo in modo responsabile.

### Come segnalare

1. **Non aprire una issue pubblica** per problemi di sicurezza.
2. Invia una descrizione dettagliata tramite i canali privati del repository o via email agli amministratori del progetto.
3. Includi, se possibile:
   - passaggi per riprodurre il problema;
   - impatto potenziale;
   - suggerimenti per la mitigazione.

## 2. Buone pratiche di sicurezza per gli utenti

- **Non inserire dati sensibili** nei prompt o nei diagrammi.
- **Non condividere chiavi API** o credenziali all'interno dell'applicazione.
- **Verifica i file esportati** prima di eseguirli o importarli in altri software.
- **Aggiorna regolarmente** il browser e le dipendenze del progetto.

## 3. Sicurezza del codice

Il progetto si impegna a:

- mantenere le dipendenze aggiornate;
- evitare l'esecuzione di codice arbitrario lato client;
- sanificare gli input utente prima di inviarli ai servizi AI;
- non eseguire parsing XML non sicuro (XXE) durante l'elaborazione dei file `.fprg`.

## 4. Dipendenze e supply chain

Si raccomanda di utilizzare strumenti come `npm audit`, `pnpm audit` o equivalenti per verificare periodicamente la presenza di vulnerabilità nelle dipendenze.

## 5. Risposta alle segnalazioni

Cercheremo di rispondere alle segnalazioni di sicurezza entro **5 giorni lavorativi** e di fornire un aggiornamento sullo stato della correzione entro **10 giorni lavorativi**.

## 6. Ringraziamenti

Ringraziamo in anticipo tutti coloro che contribuiscono a migliorare la sicurezza di Flowgen.

---

*Ultimo aggiornamento: 2026-07-10*
