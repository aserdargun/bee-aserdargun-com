# BEE working contract

- Build the deterministic scientific laboratory, with Apis mellifera as inspiration.
- Keep simulation truth in `src/simulation`; no React, DOM, wall clock, or unseeded randomness there.
- A bee receives local observations, private memory, and nearby social signals only. Colony metrics are observer outputs, never decision inputs.
- Behavior, experiment, world, simulation, metric, and export schema versions are explicit. Update affected versions when semantics change.
- Every intervention is tick stamped and included in replay exports. Reject invalid or unsupported runs.
- Keep Turkish and English controls and explanations equivalent. Label model assumptions and simulation units.
- Verify `npm run validate:codex` and review `git diff --check` before handoff.
- Local work only unless the user authorizes external publication. Preserve unrelated work and processes.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
