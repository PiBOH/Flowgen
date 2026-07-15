# Changelog

Tutte le modifiche rilevanti di questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) e il progetto segue [Semantic Versioning](https://semver.org/lang/it/).

## [Unreleased]

### Added
- Migrazione al SDK ufficiale `@google/generative-ai` (v0.24.1) per le chiamate Gemini, in sostituzione delle chiamate REST dirette.
- Endpoint API `/api/models` che interroga `models.list` di Gemini per ottenere la lista aggiornata dei modelli disponibili.
- Pulsante "Refresh models" nelle impostazioni Gemini che carica i modelli in tempo reale dall'API e popola il dropdown.
- Modelli Gemini aggiornati: aggiunti `gemini-2.5-flash`, `gemini-2.5-flash-lite` e `gemini-2.5-pro`; rimosso `gemini-3.5-flash` (inesistente) e sostituito `gemini-2.0-flash-lite` (deprecato).

### Changed
- Modello Gemini predefinito aggiornato da `gemini-1.5-flash` a `gemini-2.5-flash`.
- Modelli di fallback Gemini aggiornati: `['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']`.
- Placeholder del modello Gemini in tutte le 5 lingue aggiornato da `gemini-1.5-flash` a `gemini-2.5-flash`.
- `getApiConfig` ora usa `'openai'` come provider predefinito invece di `'gemini'` (Gemini ha un percorso SDK separato).
- `parseFlowchart` rinominata in `parseNonGeminiFlowchart` poiché ora gestisce solo provider non-Gemini.
- Rimosso codice Gemini-specifico (`responseSchema` REST, parsing `candidates[0]`, errori 404/429) dai gestori dei provider non-Gemini.

### Fixed
- Gestione errori SDK con `GoogleGenerativeAIFetchError` per rilevare correttamente rate limit (429) e altri errori di fetch.
- Schema JSON tipizzato con `SchemaType.OBJECT` e `properties: {}` per soddisfare i tipi strict del SDK.

## [0.2.0] - 2026-07-11

### Added
- Sezione Info nell'interfaccia con versione, autore, repository e licenza.
- Dropdown per la selezione del modello Gemini con opzione "Altro (personalizzato)".
- Esempio di prompt tradotto in tutte le lingue supportate.
- Chiavi API lette esclusivamente da variabili d'ambiente server-side; rimosso il campo API Key dall'interfaccia.
- Google Gemini impostato come provider predefinito.
- Supporto per il parametro `?key=` nell'URL delle richieste Gemini per compatibilità con le chiavi AI Studio.
- Schema di risposta JSON (`responseSchema`) e migliore gestione degli errori per Gemini.

### Changed
- Provider AI predefinito impostato su Google Gemini invece di OpenRouter.
- Modello Gemini predefinito corretto in `gemini-1.5-flash` per compatibilità con l'API REST v1beta.
- Aggiornati `README.md`, `docs/SUPPORTED-MODELS.md`, `arenaai.md` e traduzioni i18n.

### Fixed
- Correzione dell'errore 404 su Gemini causato dal nome modello `gemini-1.5-flash-latest` non valido per l'API v1beta.
- Correzione della condizione `response_format` per non applicare `json_mode` al provider predefinito OpenRouter.
- Gestione migliorata degli errori 429 (rate limit) per Gemini, con fallback automatico ai modelli `gemini-1.5-flash` e `gemini-1.5-pro`.

## [0.1.0] - 2026-07-10

### Added
- Inizializzazione del repository Flowgen.
- Definizione del README di progetto.
- Aggiunta della documentazione legale e di sicurezza in `/docs`.
- Aggiunta del CHANGELOG e del file `arenaai.md` per le regole di sviluppo.

---

[Unreleased]: https://github.com/PiBOH-EDU/Flowgen/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/PiBOH-EDU/Flowgen/compare/v0.1.0...v0.2.0
