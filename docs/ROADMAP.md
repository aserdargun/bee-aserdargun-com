# BEE research ladder

The first vertical slice is implemented and validated. Extension work should preserve local information boundaries, versioned semantics and the separate kernel/renderer contract.

| Experiment | V0.1 status | Next useful proof |
|---|---|---|
| BEE-001 — A Scout Finds Food | Guided, dance disabled | Discovery-time distribution across landscapes and seeds |
| BEE-002 — The Waggle Dance | Guided, paired control | Sensitivity to contact radius and acceptance strength |
| BEE-003 — Does Better Food Win? | Guided, competing resources | Quality × distance trade-off and stock-limited cases |
| BEE-004 — Exploration vs Recruitment | Guided, adjustable scout trait | Scout-ratio sweep across changing landscapes |
| BEE-005 — Information Becomes Stale | Removal and replay mechanism available; dedicated lesson pending | Define recovery against a pre-intervention baseline before displaying adaptation time |
| BEE-006 — Communication Noise | Noise intervention available; dedicated lesson pending | Repeated-seed robustness curve and bounded-error interpretation |
| BEE-007 — Many Scouts or Few Scouts? | Scout control available; dedicated lesson pending | Separate exploration capacity from success at existing patches |
| BEE-008 — Division of Labor | Future | Receiver queues and local response thresholds, without global task allocation |
| BEE-009 — Choose a New Home | Future | A separate nest-site/report domain and repeated local inspections |
| BEE-010 — Quorum | Future | Site-local support threshold, commitment criteria and decision accuracy definitions |

Prioritize repeated-seed sensitivity studies for Levels 1–4 before adding new biological modules. Inspect order bias, patch geometry, scarcity, stale signals and the assumption that uninformed non-scouts wait. Current five-seed evidence is a functional demonstration, not a statistical research claim.

For larger populations, profile contact matching, structured-clone snapshots and drawing independently before introducing a spatial index, typed-array transport or PixiJS adapter. The supported interface stops at 1,000 bees. A 5,000-bee experimental mode needs its own measured budget.

A future sandbox can edit world geometry only after these guided experiments remain interpretable. Thermoregulation needs its own field, local sensors and energy assumptions; it should not be added as an animated temperature overlay. Existing experiment and lesson links select authored presets using `?experiment=bee-001` or `?lesson=bee-001-guide`; `?lang=tr|en` selects the language. Arbitrary configuration sharing through URLs and cross-device/public run libraries are future capabilities. Complete run sharing uses a versioned JSON file.

SWI compatibility currently consists of explicit Agent/Environment/Signal/Memory/Experiment/Metric concepts, evidence references, links and portable run data. Shared ILS core/UI 0.2.0 archives are already vendored, with manifest schema 0.1. They provide learning metadata and presentation controls; BEE retains its own simulation and replay semantics. There is no automatic SWI/ANT run transfer or runtime import from a sibling checkout.
