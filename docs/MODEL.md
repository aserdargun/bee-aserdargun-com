# BEE model 0.1.0

This document describes the implemented rules, not an empirical model of bee physiology. The primary boundary is individual information: the world manages physical resource stock, while a bee chooses using its own state, remembered visits and locally encountered signals. Colony metrics are readouts for the human observer.

## Space, time and initial conditions

The world is 1,000 × 680 abstract distance units. The hive is at (470, 340), with radius 34. Coordinates increase rightward and downward. One tick is 0.1 model seconds; flight speed is at most 3.2 units/tick. Wall time and rendering frames never enter kernel calculations. The worker schedules 1, 5 or 20 fixed steps every 100 ms; delayed/background execution advances only the steps actually completed.

Default BEE-003 has seed 518394, 160 bees, 18% scouts (rounded to 29), recruitment strength 0.78, communication noise 0.12 and memory lifetime 1,400 ticks. All bees start inside the hive with empty resource memories. Role is a configured trait in this version; IDs are assigned scouts first. This is not dynamic task specialization.

| Patch | Center | Radius | Quality | Initial amount/capacity | Regeneration |
|---|---|---:|---:|---:|---:|
| A | (270, 160) | 42 | 0.46 | 800 | 0.16/tick |
| B | (795, 440) | 55 | 0.95 | 800 | 0.16/tick |

Both patches are initially unknown to bees, although visible to the observer. A patch is sensed only when active, with amount > 0.01, and within patch radius + 28 sensor units. Local discovery reports its center and quality. The sensing margin and instantaneous local recognition are educational simplifications.

## Decisions and physical state

`BeeBrain.decide(localObservation, bee, random)` is the replaceable departure policy. The kernel owns sensing, flight and state transitions. Only `RuleBasedBeeBrain` is supplied and versioned for portable replay in V0.1; a replacement policy needs its own behavior version and replay factory before exporting compatible runs.

1. A resting scout explores if it has no valid memory, or with probability 0.22 when it has memories. A non-scout without memory waits for a local dance.
2. A bee with memories chooses a remembered source with probability 0.8, otherwise tries a nearby dance, then falls back to a memory if no dance is available. Source selection is personal, not a colony ranking.
3. Search is a correlated random walk. Heading changes every 18 search ticks. Near world edges, movement turns inward. An unsuccessful exploration returns after 420 search ticks.
4. A bee directed by memory flies toward the remembered estimate. It still needs local sensing to find the actual patch. If the estimated location misses, it searches for another 120 ticks before recording a failed visit and invalidating its own memory.
5. Foraging takes 24 ticks. A successful bee removes up to one unit of available nectar, records its quality and returns to the hive. If a source disappears during foraging, the bee records a failed visit, forgets it and returns empty.
6. Cargo is credited once on arrival, then cleared. A successful arrival either begins a dance or rests for 20 ticks; an empty return rests for 25 ticks. There is no separate unloading/receiver process. Rest recovers an energy proxy by 0.8/tick; flight subtracts 0.013 per distance unit. Energy stays in [0,100] and does not model metabolism or constrain flight.

World updates use stable bee-ID order. Regeneration occurs before individual updates. Competing bees can therefore encounter stock in different order; this is a model assumption and a possible source of order bias. Newly created dances become available to other bees on the next tick, preventing same-tick signal cascades.

## Waggle signal and local recruitment

For a successful delivery, define `reward = cargo × sampled_quality` and `d = distance(hive, remembered_source)`.

| Quantity | Implemented rule | Interpretation |
|---|---|---|
| Utility | `reward / (1 + 0.0015 × 2 × d)` | Own reward discounted by approximate round-trip distance; not net energy |
| Probability of dancing | `min(0.9, 1.8 × utility)` | Bernoulli trial after successful return, when recruitment is enabled |
| Dance lifetime | `round(70 + 160 × utility)` ticks | Persistence rises with utility |
| Advertised direction | `atan2(target.y − hive.y, target.x − hive.x)` | Clockwise from east; no sun/gravity transformation |
| Distance duration code | `d / 250` displayed seconds | Educational temporal code; not a calibrated waggle duration |
| Confidence | `1 − 0.4 × noise` | Model assumption shared with the signal |
| Acceptance probability | `min(0.95, strength × utility × confidence)` | Per completed local observation; bounded below certainty |

An observer must be within 30 units of the dancer and within 68 units of the hive center to encounter a signal. The policy randomly selects one eligible nearby dance. Observation takes 12 ticks, during which the observer stays in place. Acceptance requires an unexpired report and recruitment still enabled. An unsuccessful observer returns to resting and can encounter another dance later.

Accepted reports receive independent bounded angular and radial errors:

```text
angle = advertised_angle + uniform(-1, 1) × noise × 0.65 radians
distance = advertised_distance × (1 + uniform(-1, 1) × noise × 0.35)
```

The resulting coordinate is bounded to the world. A follower learns an estimate and advertised quality, not current stock or global resource quality. A successful local visit replaces that report with personal experience. Memory expiration is tick based; removing a patch does not update any bee memory. Existing signals may continue recruiting unsuccessful visits until they expire. These rules, rather than an allocation optimizer, produce amplification and adaptation.

Recruitment OFF disables both dance creation and dance encounters. In particular, uninformed non-scouts do not independently search. Large ON/OFF differences are partly a consequence of this trait assumption and are not evidence that communication universally improves real foraging.

## Measurement contract

| Metric | Formula / units | Scope and limitation |
|---|---|---|
| Food collected | Sum of delivered `cargo × sampled_quality`; reward units | Not grams or colony fitness; zero-quality cargo contributes zero |
| Throughput | Reward delivered in `(tick−600, tick]` divided by `min(tick,600) × 0.1/60`; reward/model minute | Trailing 60 model seconds, with shorter startup denominator |
| First discovery | First successful local discovery tick × 0.1 seconds | `null` before discovery; not necessarily the globally best resource |
| Active scouts / foragers | Count of that role outside Resting/Dancing/ObservingDance | Role counts, not task-switching rates |
| Inside hive | Count in Resting/Dancing/ObservingDance | State definition rather than geometric occupancy |
| Recruited foragers | Outside bees whose last recruitment flag remains set | Can include scouts; a later independent scouting departure clears it |
| Allocation A/B | Counts of source-directed FlyingToResource/Foraging/Returning states; UI divides by their sum | Excludes searching and hive activity; not a percentage of all bees |
| Recruitments / dances | Cumulative accepted reports / emitted signals | Repeated events by one bee count separately |
| Discoveries | Local encounters without a current personally visited memory for that patch | Rediscovery after memory expiry can count again |
| Failed visits | Missed remembered targets or absent source at collection | Not a complete failure/fitness model |
| Delivered by patch | Cumulative reward attributed to A or B | Returning cargo can arrive briefly after removal |
| Travel cost | Sum of each bee's distance flown; distance units | Not energy expenditure; includes unsuccessful exploration |

Chart history samples every 20 ticks and retains 300 points (approximately 600 model seconds). Each point's throughput still uses the trailing 60-second window. The event journal retains 250 events. Communication view draws recent recruitment events up to 300 ticks old; busy runs may retain a shorter interval. It does not claim a complete historical contact network. Outer-ring participants are a visual projection of bees currently outside the hive, not their flight coordinates.

## Determinism, replay and limits

Mulberry32 and integer seed mixing initialize one stream per bee. The kernel uses no unseeded randomness. Reset reproduces initial positions, roles and empty knowledge. Snapshot copies prevent presentation code from modifying truth. The paired control starts with the same seed, population and environment; it disables recruitment and applies the same environmental/noise interventions. Its random streams naturally diverge as behavior changes.

Exports contain `schemaVersion: 1`, `lab: BEE`, `species: Apis mellifera`, all five model version fields, seed, initial configuration, completed tick count, ordered interventions and final metrics. Every version is currently `0.1.0`. Interventions at tick T execute after T completed steps, before step T+1. Multiple interventions at the same tick retain array order. Reset is a new run, not an intervention.

Import validates versions, finite numbers, bounds, seed consistency and command order, then replays from tick zero. Imported metrics are ignored and recomputed. Imports pause on completion. Browser files are limited to 2 MB; runs to 36,000 ticks, 1,000 bees, 200 interventions and 36 million bee-ticks per colony. The paired worker recomputes two colonies. The browser automatically pauses at the tick ceiling so its exports remain importable. The headless stepping API can continue longer, but such runs exceed this version's browser import contract.

Exact full-state identity is tested in the same JavaScript runtime. Cross-engine tests also compare displayed browser values with Node-derived fixture values, but do not prove bitwise identity across every engine or future math implementation. Version changes must reject incompatible historical files or introduce an explicit migration; never silently reinterpret them.

## Evidence and exclusions

The [foundation evidence list](FOUNDATION.md#evidence-boundary) connects implemented abstractions with three primary papers. Their biological findings motivate the mechanism; none supplies BEE's numerical constants. The live interface labels observed biology, abstraction, assumption and educational simplification separately.

No calibrated metabolism, mortality, odor, wind, sun compass, anatomical dance, queen decisions, brood, receiver specialization, dynamic task thresholds, nest quorum or thermoregulation is implemented. Resource-switching rate, adaptation time and collective fitness are not presented as undefined numerical indicators. A later research version needs explicit operational definitions, sensitivity analysis and empirical calibration before claiming these quantities.
