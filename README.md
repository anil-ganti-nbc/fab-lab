# Fab Lab

Interactive semiconductor manufacturing practice lab: Rayleigh optics, yield economics, process sequencing.

Part of the Dead Air University practice-lab ecosystem. Implements the
[`dau-practice-labs`](https://github.com/anil-ganti-nbc/dau-practice-labs)
`?practice=` contract: DAU launches this app with a signed-shape payload,
and finished takes are posted back to the opener window.

## Run

```sh
npm install
npm run dev          # http://localhost:8092
```

Standalone demo: `http://localhost:8092/?practice=demo`

## Develop

```sh
npm run typecheck    # strict TS, no emit
npm test             # schema + model + cross-repo contract conformance
npm run build        # production build
```

## Contract

- Payload: `?practice=<url-safe-base64-json>` (`semi-rayleigh` / `rayleigh` in the demo)
- Result: `postMessage` to `window.opener` as `fab-lab:practice-result`
- This lab never writes DAU mastery, reviews, or quiz scores.

MIT — see LICENSE.
