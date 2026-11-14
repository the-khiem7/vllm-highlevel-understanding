# vLLM - Serve more AI with the same GPU

vLLM does not make AI smarter. It lets one GPU answer many more people at once, so the same hardware serves more users at lower cost. This repository is the pitch: slide decks that explain how, in plain language, with a story you can retell after one viewing.

Two ideas carry the whole talk:

- **PagedAttention** - the GPU's memory is the real bottleneck, not its speed. Instead of reserving one huge block per conversation, vLLM hands out small blocks only as they are needed and keeps a block table, like a receptionist with a seating plan. Memory stops going to waste.
- **Continuous batching** - the moment one request finishes, the next one takes its place. Nobody waits for the slowest guest of the group to leave, so the GPU never sits idle between rounds.

Each deck tells it through one running metaphor, with animated figures and speaker notes:

- **Restaurant** - for an audience that has used a chatbot but never looked inside. A kitchen that is fast but a floor that is small. No jargon without an everyday name beside it.
- **48-room hotel** - for AI and software engineers. Tours book rooms, a front desk keeps the ledger, and the technical names (KV cache, block table, batching) stay in plain sight.

Pick the deck that fits your audience below, or open it online and present it yourself.


## Decks

Every deck is online at **https://the-khiem7.github.io/vllm-highlevel-understanding/**. Open a deck, then click Present or press P inside it for the presenter view with notes; Audience reopens the audience screen, which follows the deck tab in the same browser only.

| vLLM - restaurant | vLLM - llmhotel48 |
|---|---|
| [<img src="slide/vllm/restaurant/thumbnail/cover.webp" width="400" alt="vLLM restaurant deck, title slide">](https://the-khiem7.github.io/vllm-highlevel-understanding/vllm/restaurant/) | [<img src="slide/vllm/llmhotel48/thumbnail/cover.webp" width="400" alt="vLLM llmhotel48 deck, first slide">](https://the-khiem7.github.io/vllm-highlevel-understanding/vllm/llmhotel48/) |
| [Open deck](https://the-khiem7.github.io/vllm-highlevel-understanding/vllm/restaurant/) - [Audience](https://the-khiem7.github.io/vllm-highlevel-understanding/vllm/restaurant/?mode=audience) | [Open deck](https://the-khiem7.github.io/vllm-highlevel-understanding/vllm/llmhotel48/) - [Audience](https://the-khiem7.github.io/vllm-highlevel-understanding/vllm/llmhotel48/?mode=audience) |

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

Open the URL `present` prints, or a deck on the site, then click Present or press P to open the audience tab. Google Meet: share the audience tab. Zoom: drag the audience tab into its own window and share that window. Give each deck its own `--port` to serve several at once. The audience tab follows the presenter tab through the browser, so both must be in the same browser on the same machine.
