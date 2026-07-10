# Arena AI — Regole di Sviluppo Obbligatorie per Flowgen

Questo documento definisce le regole non negoziabili che ogni assistente AI deve rispettare quando lavora sul progetto **Flowgen**.

## 1. Se funziona, non si tocca

- Non modificare codice, configurazioni o documentazione che già funzionano correttamente, a meno che non sia strettamente necessario per soddisfare una richiesta esplicita dell'utente.
- Evitare il "refactoring estetico" non richiesto.
- Preferire aggiunte minimali e mirate.

## 2. Modifiche reversibili

- Prima di ogni modifica significativa, verificare che sia possibile annullarla facilmente (es. tramite `git revert`, backup o commit separati).
- Non eseguire mai comandi distruttivi senza conferma esplicita dell'utente (es. `git push --force`, cancellazione di file, installazioni globali).
- Mantenere la cronologia di git pulita e comprensibile.

## 3. Continuità tra sessioni

- Se si apre una nuova chat, deve essere possibile riprendere il lavoro dal punto esatto in cui si era fermati, senza errori.
- Documentare sempre lo stato corrente del lavoro in file chiari (es. `TODO.md`, `STATUS.md`, note nel CHANGELOG) quando si interrompe un'attività a metà.
- Riassumere il contesto attuale all'inizio di ogni nuova sessione se necessario.

## 4. Chiarezza prima della velocità

- Preferire soluzioni semplici e comprensibili a soluzioni clever ma fragili.
- Aggiungere commenti solo dove il codice non è ovvio.
- Seguire le convenzioni del progetto esistenti.

## 5. Verifica prima del completamento

- Prima di dichiarare completata un'attività, verificare che:
  - il codice compili o venga interpretato correttamente;
  - i test o i controlli di tipo passino (dove applicabili);
  - non siano stati introdotti errori evidenti.

## 6. Documentazione

- Aggiornare il `CHANGELOG.md` per ogni modifica rilevante.
- Mantenere aggiornata la documentazione in `/docs` quando si toccano funzionalità correlate.

## 7. Rispetto delle convenzioni

- Non introdurre nuove dipendenze senza prima verificarne l'uso esistente nel progetto.
- Non assumere l'esistenza di librerie o framework: verificarne sempre la presenza in `package.json`, `Cargo.toml`, `requirements.txt` o equivalenti.

## 8. Convenzioni specifiche di Flowgen

### Provider AI e modelli

- Il provider predefinito è **OpenRouter** con modello `meta-llama/llama-3.3-70b-instruct:free`.
- L'app supporta anche **OpenAI** ed endpoint **Custom** compatibili con OpenAI.
- Quando si aggiunge un nuovo provider o modello, aggiornare sempre `docs/SUPPORTED-MODELS.md` e, se necessario, `docs/ERROR-LIST.md`.
- Non commettere mai chiavi API, file `.env` o credenziali nel repository.

### Multilingua (i18n)

- Tutte le stringhe dell'interfaccia utente devono essere gestite tramite i18next.
- Ogni nuova chiave di traduzione deve essere aggiunta in tutti i file in `i18n/locales/` (en, it, fr, es, de).
- Le traduzioni non devono essere perfette al 100%, ma devono essere complete.

### Documentazione

- Aggiornare `CHANGELOG.md` per ogni modifica rilevante.
- Mantenere aggiornata la documentazione in `/docs` quando si toccano funzionalità correlate.
- Aggiornare `README.md` quando cambiano istruzioni di setup, deploy o provider supportati.

### Esportazione e flowchart

- I formati di esportazione supportati sono: `.fprg`, `.json`, `.svg`, `.png`, `.jpg`, `.pdf`.
- L'esportatore `.fprg` è euristico: per grafi complessi con merge condivisi ricade su una sequenza flat. Documentare eventuali limitazioni.

### Verifica

- Prima di dichiarare completata un'attività, eseguire `npm run typecheck` e `npm run lint`.
- Per modifiche significative, richiedere una code review con `code-reviewer-kimi`.

---

*Questo documento è vincolante per ogni sessione di sviluppo su Flowgen.*
