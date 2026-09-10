# V0.1 validation evidence

Validated locally on 2026-09-06 with Node 22.23.1, npm 10.9.8, Next.js 16.3.4, Vitest 5.0.0 and Playwright 1.63.0. This records the initial local verification, before remote publication. Subsequent publication follows the [deployment contract](DEPLOYMENT.md).

## September 10 reliability review

The final local `npm run validate:codex` passed on Node 22.23.1: **26 kernel/worker + 3 environment + 36 Chromium browser tests = 65 passing tests**, plus TypeScript, the production static build, artifact verification and `git diff --check`. The full `npm audit --json` returned zero reported vulnerabilities. This review was local; no commit, push or deployment was performed.

New coverage verifies rejection of unknown fields and non-string identifiers, atomic rejection of interventions and imports, ordered same-tick replay, the 200-intervention limit, custom-policy and oversized headless export rejection, paired worker behavior and the 36,000-tick ceiling. The five-seed behavioral test now has an explicit 30-second timeout because its computation exceeded the framework's five-second default under concurrent machine load; its assertions and workload are unchanged.

Browser regressions cover reduced-motion experiment changes, translated seed errors, imported scout proportions above 50%, startup failure and reset recovery, completed-run controls, stale replay notices after reset, and paused-canvas redraw suppression with working camera controls. The learning checks retain their non-mutating tick/export assertions. The mobile layout workflow also checks both languages at 320px and verifies 44px navigation targets; this caught and fixed an 11px Turkish navigation overflow using a two-row menu at narrow widths.

Additional visual and interaction checks against `http://127.0.0.1:4017/` passed at **1536×1024, 1024×768, 390×844 and 320×740** in both languages. Page title/content, absence of framework overlays, console errors/warnings, horizontal overflow, keyboard skip-link focus, one-tick stepping and reset were checked. Screenshots were inspected at all four sizes. These used the repository's Playwright/Chromium runtime because no Browser skill was available. Safari/WebKit, Firefox, real mobile hardware and biological calibration were not verified by this review.

Simulation rules, PRNG draws, world constants, experiment initial conditions and metric formulas are unchanged; schema/model versions retain their existing meanings. Portable exports now enforce the documented replay limits. The internal worker acknowledgement carries the accepted configuration so the UI updates after a successful replay.

## Required behavioral proof

The initial [kernel test suite](../src/simulation/kernel.test.ts) contained 16 tests, including each mandatory first-slice criterion. The September 10 additions are summarized above.

| Requirement | Concrete verification | Result |
|---|---|---|
| A — Determinism | Full snapshots match after 2,400 ticks, including 800+1,600 chunked stepping; a different seed differs | Passed |
| B — Independent discovery | All initial memories empty; scouts discover with recruitment OFF; uninformed non-scouts retain no resource memory | Passed |
| C — Return and delivery | Delivered reward is positive; sum of individual deliveries and sum of patch deliveries equal colony reward | Passed |
| D — Information creation | Successful returns emit inspectable, expiring signals with distance matching the remembered vector | Passed |
| E — Local/probabilistic response | Hive bees initially sense no food/dance; all observed dances lie within contact radius; recruits exist with acceptance strictly between 0 and 1 | Passed |
| F — Allocation changes | ON/OFF allocation differs for each of five paired seeds at 5,000 ticks; OFF has no recruits and total paired ON reward is higher | Passed |
| G — Environmental adaptation | Removing B at tick 5,000 leaves bee state unchanged immediately; subsequent failed visits increase, B deliveries eventually stop and B allocation becomes zero while A deliveries increase | Passed |
| H — Headless execution | Kernel runs in Node without `document`; making `Math.random` throw does not interrupt discovery | Passed |

Additional tests cover JSON replay after ordered interventions, recomputation despite altered imported metrics, snapshot/config isolation, finite physical bounds over 8,000 noisy ticks, no unseen-patch policy access, invalid inputs/versions/work limits, command order/reset, and zero recruitment strength.

## Paired experiment results

`npm run experiment:batch` uses the default BEE-003 geometry and behavior, 160 bees and 6,000 ticks (600 model seconds). Each pair changes only recruitment ON/OFF at initialization. [Stored JSON](validation/batch-results.json) retains raw results, model versions and runtime; [the script](../scripts/batch.ts) is the reproduction entry point.

| Seed | Reward ON | Reward OFF | Recruits ON | First discovery, both (tick) |
|---:|---:|---:|---:|---:|
| 518394 | 1,887.964 | 434.760 | 496 | 111 |
| 718923 | 1,972.136 | 349.710 | 376 | 77 |
| 42 | 1,815.070 | 419.020 | 534 | 107 |
| 104 | 2,049.900 | 362.440 | 360 | 72 |
| 2026 | 2,122.366 | 412.170 | 343 | 94 |
| Mean | 1,969.487 | 395.620 | — | — |

For seed 518394, source-directed allocation at tick 6,000 is A=44/B=54 with recruitment and A=7/B=10 without. All five OFF runs have zero recruits. These are computed outcomes, not numbers placed in the UI.

The approximately 4.98× mean reward ratio describes **this model and configuration**. It is not a confidence interval, fitted biological effect or claim that real bees always benefit from dancing. In particular, uninformed non-scouts wait in the OFF model, and the environment has two stationary sources. Broader research needs sensitivity analysis, scarcity/changing-landscape cases, larger seed samples and independent calibration.

## Browser and lifecycle validation

`npm run validate:codex` completed with **16 kernel + 3 environment + 14 browser tests = 33 passing tests**, TypeScript checks and a successful static export. The browser suite serves the built `out/` artifact, including its actual worker chunk.

Seven workflows each run at desktop 1536×1024 and mobile 390×844 in Chromium:

1. Worker startup, pause, exact one-tick step, reset and resumed progression; no console/page errors. Timing follows the actual step count and clears after reset.
2. Recomputed 3,000-tick fixture, dance information, private memory, individual follow, communication view and same-tick paired comparison.
3. Source removal and recruitment intervention at tick 1,400; downloaded JSON records ordered commands and tick 1,401; reimport reproduces measured values and local history.
4. Invalid seed and invalid file preserve an existing valid run; a prediction resets to tick zero before execution.
5. Four experiment presets, TR/EN explanations, primary evidence links and Escape dismissal of dialogs.
6. Rendered fonts/art, no horizontal document overflow, mobile primary touch targets at least 44px, and desktop/mobile screenshots in both languages.
7. Reduced-motion preference begins paused; explicit playback still works.

Manual Codex In-app Browser checks additionally exercised the live development site and the static artifact: pause/step, English/Turkish switching, dance inspection, personal source knowledge, follow and paired worlds. The observed dancer exposed direction, distance, duration code, utility and expiration. Console inspection on that path returned no errors or warnings. Visual evidence is documented in [design verification](design/VERIFICATION.md).

The three real-process environment tests verify the Setup/Run/Validate/Stop command mapping, stopping an owned listener including a repeated no-op, and refusing a foreign working-directory listener. Setup (`npm ci` and Chromium install), Run, Validate and Stop were also executed locally. No foreign listener was terminated.

## Performance observations

Headless timings below measure 1,000 steps after 1,000 warm-up steps, one colony, default seed. They include all kernel work; they are not an isolated per-agent or communication microbenchmark.

| Population | Measured 1,000 ticks | Mean per tick | Approximate ticks/s |
|---:|---:|---:|---:|
| 100 | 15.1 ms | 0.015 ms | 66,225 |
| 1,000 | 168.2 ms | 0.168 ms | 5,945 |

A manual In-app Browser observation at 1,000 bees, 20× playback, dance view and tick 24,600 showed **120 rendered FPS** and **3.40 ms for 20 paired ticks** (two colonies). This is a point observation on the local display/runtime, not a sustained percentile or a guarantee for other devices. The worker measurement excludes snapshot cloning, message transport and rendering. At initial validation, the FPS readout measured animation-frame callbacks over approximately 1.5 seconds. The September 10 renderer counts actual draws instead and skips unchanged paused frames; a zero paused FPS is expected.

Communication matching is currently O(bees × active dances); no separate communication-cost or heap profile was collected. The supported population cap is 1,000. A 5,000-bee mode, full memory budget, slower-device profiling and WebKit/Firefox coverage remain future validation work. Full cross-engine bitwise determinism is not claimed.

## Delivery boundary

The initial slice produced a static application with a CI configuration and Azure-compatible static configuration. It was delivered locally before the user separately authorized GitHub and Azure publication. No accounts, database, backend or LLM agents were introduced. Quorum, nest choice, dynamic roles and thermoregulation are explicitly future modules.
