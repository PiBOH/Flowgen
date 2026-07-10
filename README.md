# Flowgen

> Universal AI-powered flowchart generator

Flowgen lets you generate interactive flowcharts from plain text using AI, and export them in multiple formats:

- `.fprg` — Flowgorithm native XML
- `.json` — Abstract nodes/edges representation
- `.svg` — Scalable vector graphic
- `.png` / `.jpg` — High-resolution raster images
- `.pdf` — Vector PDF document

## Tech Stack

- **Next.js 14** (App Router)
- **React 18 + TypeScript**
- **Tailwind CSS**
- **React Flow** — interactive diagram canvas
- **i18next** — multilingual support (EN, FR, ES, DE, IT)
- **html-to-image** — SVG/PNG/JPG export
- **jspdf** — PDF export

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your keys:

```bash
cp .env.example .env
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Create a `.env` file in the project root (or use `.env.local` for local overrides) and add:

| Variable | Description |
|---|---|
| `OPENROUTER_API_KEY` | OpenRouter API key (default provider) |
| `OPENAI_API_KEY` | OpenAI API key |
| `GEMINI_API_KEY` | Google Gemini API key from AI Studio |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

## AI Providers

The API route supports:

- **OpenRouter** (default — e.g. `meta-llama/llama-3.3-70b-instruct:free`)
- **OpenAI** (e.g. `gpt-4o-mini`)
- **Google Gemini** (e.g. `gemini-1.5-flash`, free tier via Google AI Studio)
- **Custom endpoints** compatible with OpenAI chat completions format

### Note on OpenRouter "free" models

OpenRouter lists several models as **Free** (including `meta-llama/llama-3.3-70b-instruct:free`). However, OpenRouter still requires an **active billing profile** or a **positive account balance** to use any model, free or paid. If you see a `402 Payment Required` error, it means your OpenRouter account needs a payment method or credits, even though the model itself does not charge per request.

To resolve this:

1. Log in to your [OpenRouter account](https://openrouter.ai/).
2. Go to **Settings → Billing** and add a payment method or purchase credits.
3. Retry the request.

## Documentation

- [Error List](./docs/ERROR-LIST.md) — all application error codes and how to fix them.
- [Supported Models](./docs/SUPPORTED-MODELS.md) — recommended AI providers and models.
- [Disclaimer](./docs/DISCLAIMER.md)
- [Privacy Policy](./docs/PRIVACY.md)
- [Security](./docs/SECURITY.md)

## Known Limitations

- **`.fprg` export**: the exporter tries to reconstruct nested `if`/`while`/`for` blocks from the graph. Complex diagrams with shared merge nodes or non-standard edge labels may fall back to a flat sequence.
- **AI generation**: output quality depends on the chosen model and prompt clarity. Always verify the generated flowchart.
- **Translations**: the UI is available in multiple languages, but translations may not be 100% accurate.

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/PiBOH-EDU/Flowgen)

## License

This project is released into the public domain. See [LICENSE](./LICENSE).
