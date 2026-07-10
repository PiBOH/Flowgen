# Flowgen — Supported Models

Flowgen supports both built-in providers and any AI provider that exposes an OpenAI-compatible chat completions endpoint. API keys are read from server-side environment variables only.

## Supported providers

| Provider | Default model | Notes |
|---|---|---|
| **Google Gemini** | `gemini-1.5-flash` | **Default provider**. Native Gemini API support; free tier available via Google AI Studio. |
| **OpenRouter** | `meta-llama/llama-3.3-70b-instruct:free` | Supports many open and commercial models. |
| **OpenAI** | `gpt-4o-mini` | Reliable JSON output, good instruction following. |
| **Custom** | — | Any endpoint compatible with `/v1/chat/completions`. |

For every built-in provider, set the corresponding server-side environment variable (`GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`) in `.env`, `.env.local` or Vercel Environment Variables.

## Recommended models on OpenRouter

These models work well for generating structured JSON flowcharts.

| Model | Cost | Context | Notes |
|---|---|---|---|
| `meta-llama/llama-3.3-70b-instruct:free` | Free | 131K | Default. Good multilingual support, but requires an active OpenRouter billing profile. |
| `openai/gpt-4o-mini` | Paid | 128K | Excellent JSON adherence and prompt following. |
| `openai/gpt-4o` | Paid | 128K | Best quality, higher cost. |
| `anthropic/claude-3.5-sonnet` | Paid | 200K | Strong reasoning, good for complex diagrams. |

## Important note on "free" models

OpenRouter labels some models as **Free**, but the platform still requires a valid **billing profile** or **positive account balance** before you can make any request. If you see a `402 Payment Required` error, add a payment method or credits in your [OpenRouter billing settings](https://openrouter.ai/settings/billing). You will not be charged for requests to free models as long as you stay within their limits.

## Free options without a credit card

If you do not have a credit card, you still have a few options.

### 1. Ollama (local, 100% free)

[Ollama](https://ollama.com/) lets you run open-source models directly on your computer. It is completely free and does not require an internet connection or API key.

1. Install Ollama from [ollama.com](https://ollama.com/).
2. Pull a model, for example: `ollama pull llama3.1`.
3. Start the Ollama server (usually runs on `http://localhost:11434`).
4. In Flowgen Settings, select **Custom** and set:
   - **API URL**: `http://localhost:11434/v1/chat/completions`
   - **Model**: `llama3.1`
   - **API Key**: leave empty

**Limitation**: this only works when you run the Flowgen development server on the same machine. A Vercel deployment cannot reach your local Ollama instance.

### 2. SambaNova Cloud (free tier)

[SambaNova Cloud](https://cloud.sambanova.ai/) offers a permanent free tier with 20 requests per minute for several Llama models. Sign-up is free and does not require a credit card.

- **API URL**: `https://api.sambanova.ai/v1/chat/completions`
- **Model**: `Meta-Llama-3.3-70B-Instruct`
- Get your API key from the SambaNova dashboard.

### 3. GitHub Models (free for prototyping)

[GitHub Models](https://github.com/marketplace/models) lets you experiment with many models through your GitHub account. It is free for prototyping within rate limits.

- **API URL**: `https://models.inference.ai.azure.com/chat/completions`
- **Model**: `meta-llama-3.3-70b-instruct`
- Use a GitHub Personal Access Token as the API key.

### 4. Google Gemini (free tier)

[Google Gemini](https://ai.google.dev/) offers a free tier with rate limits. Note that there is no "Gemini 3.5 Flash"; the correct model names are `gemini-1.5-flash` or `gemini-2.0-flash`.

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. In Flowgen Settings, select **Google Gemini** as the provider.
3. Paste your API key and, if you want, change the model (default is `gemini-1.5-flash`).

**Note**: the key from AI Studio is sent to the Gemini API in a request header. Make sure you keep it secret and do not commit it to version control. You can also set `GEMINI_API_KEY` on the server (`.env`, `.env.local` or Vercel Environment Variables) and leave the Settings field empty.

### 5. OVHcloud AI Endpoints (anonymous tier)

[OVHcloud AI Endpoints](https://ai.endpoints.ovh.net/) has an fully anonymous tier with no API key required, but it is limited to 2 requests per minute.

- **API URL**: check the latest endpoint in the OVHcloud documentation.
- **Model**: depends on the endpoint.

## Choosing a model

- For **best results**, use `gpt-4o` or `claude-3.5-sonnet`.
- For **free usage**, use **Google Gemini** with a key from AI Studio (default), or use `meta-llama/llama-3.3-70b-instruct:free` on OpenRouter (requires billing profile).
- For **local or self-hosted models**, use the **Custom** provider with your own endpoint.

## Adding a custom provider

In the Settings panel, select **Custom** and provide:

- **API URL**: the full URL of your chat completions endpoint (e.g. `http://localhost:11434/v1/chat/completions` for Ollama).
- **Model**: the model name accepted by your endpoint.
- **API Key**: your endpoint key, if required.
