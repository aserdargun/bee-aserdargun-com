# BEE V0.1 — foundation and implementation contract

## 1. Current state

Inspected 2026-09-06: empty checkout, unborn `master`, no origin, no application or inherited AGENTS.md. Local Node 22.23.1 and npm 10.9.8. No sibling repository is needed to run BEE. No publication is part of this milestone.

## 2. Application architecture

Next.js 16 / React 19 / strict TypeScript; static export to `out/`. Browser-only experiments; no account, database, API key, or server runtime. React owns controls and presentation. A dedicated Web Worker owns paired simulation instances and the fixed-step clock. The same kernel runs in Node for tests and batch experiments. Local JSON exports are the integration boundary for SWI.

## 3. Simulation architecture

`simulation/types.ts` defines the contract. `random.ts` owns reproducible streams. `brain.ts` consumes only a local observation and private memory. `kernel.ts` owns world physics, sensing, state transitions, and event accounting. `run.ts` validates configuration and versioned replay. `worker.ts` is the transport and scheduling adapter. Snapshot copies prevent UI mutation of kernel truth.

World coordinates: 1,000 × 680 abstract distance units; origin at top left; x right, y down. One tick = 0.1 model seconds. These are educational units, not a calibrated field site. No step depends on frame rate. Interventions execute immediately before their recorded tick's next step. Agent order is stable and documented; social signals created this tick are available on the next tick, avoiding same-tick information cascades.

## 4. Bee domain model

World contains one Colony, one Hive, FoodPatches, Bees and a bounded event journal. A Bee has id, position, heading, energy proxy, role (scout or forager), state, private memory, target estimate, cargo, last observed dancer, timer and individual PRNG state. States: Resting → Searching / ObservingDance → FlyingToResource → Foraging → Returning → Dancing / Resting. Energy is an inspection proxy, not metabolism. Receiver specialization is deferred; cargo is credited on arrival, followed by dancing or a fixed rest interval.

## 5. Waggle-dance abstraction

A bee samples position and quality only when inside a resource's local sensor range. On successful return it may advertise its own remembered location. Each signal records dancer, origin, advertised direction, distance, quality, utility, confidence, creation and expiration ticks. Dance persistence and participation depend on that bee's reward estimate. Direction uses a fixed reference axis; distance is encoded as a displayed duration proxy. Sun compensation, gravity reference, odor and actual acoustic/mechanical channels are omitted. Displayed duration is not an empirical calibration.

## 6. Recruitment

Hive observers encounter signals only inside a finite contact radius. They observe one locally selected dance for a short interval. Acceptance is Bernoulli, with probability bounded below 1 and based on recruitment strength, the advertised utility and confidence. Followers receive a noisy location estimate and advertised quality, never the world's food array or current resource stock. They must navigate and rediscover the source locally. Failed visits invalidate only personal memory; stale advertisements persist until expiration. Scouts can abandon known sources and explore again. No allocation optimizer exists.

## 7. Seeded determinism

Use Mulberry32 integer PRNG; a reproducible stream per bee, seeded through an integer mixing function. Same seed creates identical initial worlds under recruitment ON/OFF. Record all version fields, complete initial configuration, tick count and ordered interventions. Replay rebuilds from tick zero; exported metrics are not trusted as state. Test complete snapshot equality, chunked stepping, replay after depletion and parameter changes, and unsupported-version rejection. Floating-point geometry uses JavaScript math: exact equality is guaranteed and tested in the same runtime/version; bitwise identity across future engines/hardware is not claimed.

## 8. Rendering

Use a Canvas 2D renderer adapter for V0.1. Sparse vector agents, no shaders, one world and modest populations make Canvas appropriate without a WebGL dependency or context-loss burden. The view reads immutable snapshots, has zoom/pan and bee selection, and can be replaced by PixiJS. Natural landscape, dance floor and communication views visualize actual positions/signals/events. Rendering never advances the kernel. Benchmark 100 and 1,000 bees; 5,000 is an experiment, not a supported performance promise.

## 9. Experiments

Versioned BEE-001 (independent exploration), 002 (dance recruitment), 003 (competing food) and 004 (exploration/recruitment balance) define question, prediction choices, controlled/independent variables, seed, parameters, expected qualitative phenomena, metrics and evidence. Default is a live BEE-003 world with unknown food. Paired comparison uses the same seed and environment and disables recruitment in the control. Pause, step, reset, seed and tick-stamped depletion let users inspect causes. Predictions remain user hypotheses; measured differences are not biological proof.

## 10. Testing

Mandatory A–H: deterministic state; independent discovery; return; signal creation; local/probabilistic observation; measurable recruitment allocation difference; behavior change after depletion; headless execution. Also test finite positions/energy/stock, snapshot isolation, memory invalidation, replay and input/version boundaries. Browser tests cover worker startup, pause/step/reset, language, views, inspector, comparison, exports/import and mobile overflow. Verify real static export in browser. Setup/Run/Validate/Stop includes owned/foreign listener safety.

## 11. V0.1 implementation sequence

1. Lock runtime and write kernel tests, model and headless batch harness.
2. Prove A–H; save measured evidence, including paired seeds.
3. Build a warm, observational laboratory design and code-native renderer.
4. Wire worker, controls, metrics, four guided experiments and paired comparison.
5. Add versioned JSON replay and local history; render TR/EN equivalents.
6. Validate build, browser, responsive states, accessibility and safe lifecycle. Record outcomes and limitations.

## 12. Scientific assumptions and limitations

This is an agent-based educational model inspired by western honey bee foraging, not a validated biological predictor. Distinguish observed biology, inspired mechanism, model assumption, educational simplification and simulation result. Two round flower patches, abstract nectar, constant flight speed, fixed sensor radius, fixed rest intervals, bounded angular/radial error and independent individual random streams are assumptions. Scout propensity is a configured trait, not developmental task allocation. No brood, queen decisions, quorum, thermoregulation, age, mortality, wind, smell or landscape learning in V0.1. Recruitment does not universally improve real colony fitness. A single seed does not establish a causal biological claim.

## 13. Technical risks

Finite sensor radius and landscape geometry may dominate discovery time: report model units and repeat seeds. Positive feedback can create stale recruitment: retain expiration and failed-trip events. Dense hive contact matching can cost O(N × active dances): benchmark and later add a spatial index if needed. Structured-clone traffic can dominate large populations: publish at bounded frequency, and later use typed-array transport. Background tabs throttle timers: model time advances by completed ticks only. Static worker chunk loading must be tested on the exported site. Imports must be bounded and rejected before expensive replay. Future semantic changes require version increments, not silent reinterpretation.

## Evidence boundary

- Seeley, Camazine & Sneyd (1991), *Collective decision-making in honey bees: how colonies choose among nectar sources*. [DOI](https://doi.org/10.1007/BF00175101). Motivation for profitability-dependent recruitment and abandonment; BEE does not reproduce their differential-equation model.
- *Honey bees infer source location from the dances of returning foragers* (2023). [Primary paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC10041085/). Supports information transfer; BEE's noisy vector is a deliberately narrower abstraction.
- *Honeybees forage more successfully without the “dance language” in challenging environments* (2019). [Primary paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC6374110/). Supports caution about context-dependent communication benefits; no universal improvement claim.
- [Next.js static export documentation](https://nextjs.org/docs/app/guides/static-exports) supports independent static hosting. No deployment has been performed.
