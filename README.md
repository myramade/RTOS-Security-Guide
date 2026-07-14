# RTOS/SEC — Interactive Field Guide to Real-Time Operating System Security

An interactive, single-page teaching site covering **25 modules** of RTOS security — kernel to key store — with runnable C snippets, a live rate-monotonic scheduler simulator, and a STRIDE threat map grounded in real incidents (Mars Pathfinder, Jeep Cherokee, Thunderclap-class DMA attacks).

Built as an open educational resource for engineers in **avionics, automotive, and medical** embedded systems. No frameworks, no build step, no external API calls — it's plain HTML/CSS/JS.

**Works fully offline.** Webfonts load non-blocking as a progressive enhancement; with no internet the page renders instantly using system-font fallbacks (Segoe UI / system-ui / ui-monospace). You can double-click `index.html` to open it straight from disk — ideal for no-WiFi training rooms.

The module outline is adapted and substantially expanded from the WIZAPE "Real-Time Operating System Security" course outline (wizape.com), with original explanations, C code, and interactive exercises added.

Access the interactive site ([https://myramade.github.io/RTOS-Security-Guide/#modules])

## What's inside

| Section | What it does |
|---|---|
| **The 25 modules** | Searchable, filterable cards. Each opens a briefing: plain-language explanation, why it matters for real-time, and where the security holes are. Mark modules complete to track your run. |
| **Scheduler lab** | Build a task set (WCET + period) and watch real rate-monotonic analysis: CPU utilisation, the RMS schedulability bound `n(2^(1/n) − 1)`, a verdict, and a simulated timeline showing where deadlines break. |
| **Threat map** | STRIDE across six layers of the stack. Each layer shows the attack, a real-world echo, and the mitigation you'd defend to a certifier. |
| **Code bench** | Six flaw-vs-fix C snippets for the mistakes that dominate embedded security reviews: GCM nonce reuse, hardcoded keys, unauthenticated encryption, weak RNG, MPU task isolation, and trusting a length field. Copy either version. |

## Standards touched

DO-178C (DAL A–E) · DO-326A / ED-202A · ARINC 653 · ISO 26262 · ISO/SAE 21434 · IEC 62443 / ISA-99 · IEC 62304 · CNSA 2.0 (post-quantum).

## Deploy to GitHub Pages

1. Create a new repository and push these files (keep the folder structure).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Pick your branch (e.g. `main`) and the `/ (root)` folder, then **Save**.
5. Your site goes live at `https://<your-username>.github.io/<repo-name>/` in a minute or two.

That's it — no Actions, no Jekyll config needed. The included empty `.nojekyll` file tells Pages to serve the `assets/` folder as-is.

## File structure

```
.
├── index.html          # the whole page structure
├── assets/
│   ├── styles.css      # the "kernel console" design system
│   ├── data.js         # all 25 modules, threats, and code snippets (edit content here)
│   └── app.js          # interactivity (no dependencies)
├── .nojekyll           # lets GitHub Pages serve /assets untouched
└── README.md
```

## Editing the content

All teaching content lives in **`assets/data.js`** — three arrays:

- `MODULES` — the 25 module briefings.
- `THREATS` — the threat-map layers.
- `SNIPPETS` — the flaw/fix code pairs.

Change text there and the page rebuilds itself on reload. No tooling required.

## A note on accuracy

The content is educational and deliberately concise. Before shipping anything real, validate against your platform's actual documentation and your project's certification evidence. Security controls that add unbounded latency can break a real-time system as surely as an exploit — always check timing.

## License

Adapt and reuse freely for teaching. Attribution appreciated.
