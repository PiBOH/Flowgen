# Changelog

Tutte le modifiche rilevanti di questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) e il progetto segue [Semantic Versioning](https://semver.org/lang/it/).

## [Unreleased]

### Added
- Implementazione completa della webapp Flowgen con Next.js 14, React 18, TypeScript e Tailwind CSS.
- Canvas interattivo per flowchart basato su React Flow.
- Generazione di flowchart tramite prompt testuale con supporto multi-provider:
  - Google Gemini (provider predefinito, modello `gemini-1.5-flash`).
  - OpenRouter (modello `meta-llama/llama-3.3-70b-instruct:free`).
  - OpenAI.
  - Endpoint custom compatibili con OpenAI.
- Supporto multilingua completo (i18next) per inglese, francese, spagnolo, tedesco e italiano.
- Esportazione dei flowchart in tutti i formati richiesti:
  - `.fprg` (Flowgorithm XML) con ricostruzione di strutture nidificate e fallback flat.
  - `.json` (rappresentazione astratta nodi/archi).
  - `.svg`, `.png`, `.jpg` tramite `html-to-image`.
  - `.pdf` tramite `jspdf`.
- Pannello impostazioni AI per scegliere provider, modello, URL API e chiave API.
- Endpoint `/api/config` per esporre lo stato della chiave server senza rivelarla.
- Codici errore strutturati (`FG-001` ... `FG-010`) con documentazione in `docs/ERROR-LIST.md`.
- Documentazione iniziale in `/docs`: `DISCLAIMER.md`, `PRIVACY.md`, `SECURITY.md`, `ERROR-LIST.md`, `SUPPORTED-MODELS.md`.
- `README.md` aggiornato con istruzioni di setup, variabili d'ambiente e link alla documentazione.
- Esempio di flowchart caricabile su richiesta per aiutare l'utente a capire come scrivere un prompt.
- Tooltip informativo nel pannello impostazioni che spiega la policy "free" di OpenRouter, con supporto mobile.
- Preset rapidi per provider gratuiti senza carta di credito: Ollama (locale), SambaNova Cloud e GitHub Models.

### Changed
- Provider AI predefinito impostato su OpenRouter invece di OpenAI.
- Riferimenti alle chiavi API aggiornati per usare `.env` come file principale (con `.env.local` come override locale).
- Migliorata la gestione degli errori dell'AI provider, incluso il riconoscimento specifico dell'errore `402 Payment Required` di OpenRouter.

### Fixed
- Correzione della condizione `response_format` per non applicare `json_mode` al provider predefinito OpenRouter.
- Correzione di un typo nelle virgolette del prompt di esempio in `lib/examples.ts`.

## [0.1.0] - 2026-07-10

### Added
- Inizializzazione del repository Flowgen.
- Definizione del README di progetto.
- Aggiunta della documentazione legale e di sicurezza in `/docs`.
- Aggiunta del CHANGELOG e del file `arenaai.md` per le regole di sviluppo.

---

[Unreleased]: https://github.com/PiBOH-EDU/Flowgen/compare/v0.1.0...HEAD
