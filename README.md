# S4 - Presentations

Slide decks for S4 presentations. Each topic has its content files in `content/<topic>/` and its decks in `slide/<topic>/<variant>/`, one deck per content file.

## Setup

Node.js 22+ and npm. Install the shared toolchain once, from the repository root:

```sh
npm install
```

All HyperFrames decks share the root `package.json`. Run every command below from the repository root.

## Decks

| Topic | Deck | Engine | Content | Slides | Status |
|---|---|---|---|---|---|
| vLLM | `slide/vllm/restaurant/` | HyperFrames | [`content/vllm/restaurant.md`](content/vllm/restaurant.md) | 23, about 25 min | ready |
| vLLM | `slide/vllm/llmhotel48/` | HyperFrames | [`content/vllm/llmhotel48.md`](content/vllm/llmhotel48.md) | 10, about 18 min | ready |
| vLLM | not built yet | - | [`content/vllm/hotel.md`](content/vllm/hotel.md) | 14, about 20 min | content in progress: slides 10 and 12 await figure verification |

### vLLM - restaurant

```sh
node slide/vllm/restaurant/src/build.mjs                          # regenerate index.html from src/ and the content file
npx hyperframes check slide/vllm/restaurant --json                # validate
npx hyperframes present slide/vllm/restaurant --port 3004         # serve, then click Present or press P
```

Edit `slide/vllm/restaurant/src/` (`build.mjs`, `deck.css`) or the content file, never `index.html`: the build overwrites it, and the speaker notes come from the `### Slide N - ` sections of the content file.

### vLLM - llmhotel48

```sh
node slide/vllm/llmhotel48/src/build.mjs                          # regenerate index.html from src/ and the content file
npx hyperframes check slide/vllm/llmhotel48 --json                # validate
npx hyperframes present slide/vllm/llmhotel48 --port 3005         # serve, then click Present or press P
```

Slides are in English, speaker notes in Vietnamese. Edit `slide/vllm/llmhotel48/src/` (`build.mjs`, `deck.css`) or the content file, never `index.html`.

## Presenting

Open the URL `present` prints, then click Present or press P to open the audience tab. Google Meet: share the audience tab. Zoom: drag the audience tab into its own window and share that window. Give each deck its own `--port` to serve several at once.
