# Content and portfolio review — 2026-09-21

Scope: the local BEE interface in Turkish and English, four experiment presets and their guided lessons, 27 glossary entries, field notes, evidence references, comparison/inspector labels, ILS metadata, README, model/foundation/roadmap documents, and BEE's entry in the aserdargun.com canonical catalog. Historical validation results and design references retain their original dates; this review does not establish a new production release or a comprehensive literature cutoff.

## Changes

- Added visible learning-system context with language-aware links to aserdargun.com, SWI and ANT. The explanation distinguishes related learning resources from automatic run transfer and warns against comparing numerical results from different models.
- Updated the root portfolio's BEE summary and guiding question in both languages, then regenerated its dependent public content. Only the BEE content update date changes; release SHA, release date and live-verification date remain historical.
- Distinguished existing source-removal, noise and scout controls from future dedicated lessons and unimplemented biological modules. Corrected roadmap wording about already-supported preset/lesson URLs and vendored ILS 0.2.0 packages (schema 0.1).
- Renamed the inspector/glossary's active-scout measure: it includes collecting and returning as well as searching/flying. Allocation captions now count bees on source-directed trips, consistent with the existing denominator.
- Made the fixed-role assumption visible beside paired results: uninformed non-scouts wait when recruitment is disabled. Equal tick budgets and repeated seeds are needed to interpret this model comparison.
- Replaced the README's generated Azure address with the public BEE address and identified the initial foundation state as historical.

Simulation transitions, random draws, experiment configurations, metric formulas and replay schemas are unchanged. Their version fields therefore retain their existing meanings.

## Primary-source checks

The three existing references match their titles and publication years:

- [Seeley, Camazine and Sneyd, 1991](https://link.springer.com/article/10.1007/BF00175101): decentralized source selection and recruitment motivate the mechanism; BEE does not reproduce or calibrate the paper's model.
- [Wang et al., 2023](https://pubmed.ncbi.nlm.nih.gov/36917670/): the PubMed record confirms the linked PMC article and radar-tracked navigation study. Field notes now distinguish that spatial-navigation evidence from BEE's noisy-vector abstraction, which has no familiar-landmark model.
- [I'Anson Price et al., 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6374110/): the study disrupted dance orientation in a particular environment. BEE disables recruitment, so its control is not a reproduction of that treatment. The two interventions must not be treated as equivalent.

No new empirical calibration, field connection, literature-completeness claim or cross-application numerical benchmark is introduced.

## Verification

Local validation results are recorded in [VALIDATION.md](VALIDATION.md). The requested scope is local content maintenance; publication requires separate authorization.
