# Flowgen — Error List

This document lists all the error codes returned by the Flowgen application, along with their meaning and how to resolve them.

## How to read the codes

Each code has the format `FG-XXX`:

- `FG` = Flowgen
- `XXX` = sequential three-digit number

## Error codes

| Code | Error | HTTP Status | Explanation | Solution |
|---|---|---|---|---|
| `FG-001` | Prompt is required | `400` | The request body did not contain a valid `prompt` string. | Enter a description of the algorithm or process you want to visualize. |
| `FG-002` | API key is missing | `400` | No API key was provided in the Settings panel and `OPENROUTER_API_KEY` is not configured on the server. | Add your OpenRouter API key in the Settings panel, or set `OPENROUTER_API_KEY` in your `.env` / `.env.local` file (or in Vercel Environment Variables). |
| `FG-003` | AI provider error | `502` | The upstream AI provider returned a non-2xx response (e.g. `401 Unauthorized`, `429 Too Many Requests`, `500 Internal Server Error`). | Check the `details` field in the response. Verify that your API key is valid, that you have enough credits, and that the selected model is available. |
| `FG-004` | Empty response from AI provider | `502` | The AI provider returned a response, but the content is empty. | Retry the request. If the problem persists, try a different model or provider. |
| `FG-005` | Failed to parse AI response as JSON | `502` | The AI returned content that is not valid JSON. | Simplify your prompt and retry. If it persists, try another model that better follows the system prompt. |
| `FG-006` | Invalid flowchart structure | `502` | The JSON returned by the AI does not contain valid `nodes` and `edges` arrays. | Retry with a clearer prompt. If the issue continues, switch model. |
| `FG-007` | Unknown server error | `500` | An unexpected error occurred on the server. | Check the server logs for more details and retry. |
| `FG-008` | OpenRouter payment required | `502` | OpenRouter returned `402 Payment Required`. Even free models require an active billing profile or positive balance. | Add credits or a payment method in your [OpenRouter billing settings](https://openrouter.ai/settings/billing). |

## Notes for Vercel deployments

When deploying on Vercel:

- Do **not** commit your `.env` file.
- Add `OPENROUTER_API_KEY` and `NEXT_PUBLIC_APP_URL` in **Project Settings → Environment Variables** on the Vercel dashboard.
- The custom API key field in the Settings panel is optional: it is useful for local development or when you want to override the server key.

## Local development

For local development, create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=sk-your-openrouter-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

You can also use `.env.local` for local overrides that are not committed to version control.
