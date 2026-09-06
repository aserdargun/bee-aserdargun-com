# Design implementation verification

Working reference: [laboratory-concept.png](laboratory-concept.png), generated at 1536×1024 after the headless A–H proof. The [working specification](SPEC.md) records the functional amendments to this reference. Implementation was authorized directly by the product request; the concept did not require a separate approval exchange.

## Evidence and method

The latest static-build screenshots are [desktop Turkish](final-desktop.png), [mobile Turkish](final-mobile.png) and [communication with an inspected bee](final-communication.png). Desktop uses a 1536×1024 viewport and mobile 390×844; full-page capture retains the lower controls. Both the reference and final screenshots were opened with `view_image` at original size in the same verification pass. Mobile was inspected at its actual 390px width, not as a scaled desktop.

Core interactions were manually inspected in Codex In-app Browser. Final reproducible screenshots were captured by the application’s Playwright regression suite against the static build because In-app Browser’s screenshot/viewport override produced a scaled top-left image with unused capture space. That capture issue did not block In-app Browser interaction or DOM inspection. Browser checks and direct reference/screenshot comparison were separate checks.

## Fidelity ledger

| Comparison | Reference evidence | Final rendered evidence | Resolution |
|---|---|---|---|
| Main layout | Narrow left experiment rail, wide living landscape, right colony rail | Same three-part desktop structure, actual worker-driven world at the center | Faithful to the amended specification; required extra controls extend the full page vertically |
| Typography | Large quiet serif question, small sans labels, monospaced figures | Georgia title; self-hosted DM Sans and DM Mono, 52px desktop / responsive mobile question | Preserved hierarchy and reading scale; font loading awaited before capture |
| Palette and surfaces | Warm paper, pale panels, fine gray-green borders, sage and amber | Matching paper/surface tokens and subdued source colors; no neon or gradients | No remaining material mismatch |
| Botanical asset treatment | Soft meadow vignettes embedded in the field | Meadow glyphs inside real patch bounds, cream matched to the field | Replaced an initial checkerboard-contaminated asset with a generated solid-paper version; no visible checkerboard remains |
| Bees and trajectories | Illustrative bee placements and curved example flight paths | Code-native bees at measured positions, short velocity marks and real signal links | Intentional: geometry and movement derive from snapshots; decorative curves cannot imply simulated flight history |
| Copy and navigation | Better Food Wins, experiment controls, three modes and core metrics; Experiments incorrectly highlighted | Localized TR/EN question, Laboratory active, the same information hierarchy | Active navigation corrected; exact copy reviewed against SPEC's allowed-copy rules |
| Quantitative chart | Illustrative A/B curves and static values | One actual total-throughput time series, current source allocation and delivered reward | Intentional: no invented A/B series or decorative metric values |
| Spacing and controls | Thin dividers, restrained rounding, compact controls | Same component system with native radios/sliders/selects, visible focus, 44px mobile primary targets | Seed Apply, population, depletion and import/history add required functional space |
| Mobile presentation | No separate mobile concept; same design system required | World/playback first, then experiment and inspector; readable A/B legend, no horizontal page overflow | Added HTML source legend and minimum bee glyph size after small labels were found in mobile review |
| Expanded scientific states | Dance/communication implied by view controls | Separate hive-scale projection, inspectable real dances, bounded recent recruitment graph and follow mode | Reuses the same type/palette/control system; does not fabricate network history |

Above-the-fold copy review found only documented functional amendments: the correct active Laboratory tab; localized wording; dynamically measured numbers; seed Apply and source-removal actions; and a single accurately named throughput series. The record/knowledge distinctions and model-unit notices are deliberate requirements from the product brief. No unrelated marketing claims or invented results were added.

## Interaction and scope sign-off

Verified path: open live world → pause → select prediction/reset → run → inspect a dancer’s private knowledge and encoded signal → compare a same-seed control → remove B → export → import/recompute and pause at the recorded tick. Bilingual dialogs, invalid-file recovery, reduced-motion startup and mobile controls passed the regression suite.

Other material fixes during verification: worker-authoritative toggle assertions, an import-complete acknowledgement replacing a stale busy message, and performance timings tied to the actual completed batch rather than the selected speed. The final implementation was faithfully verified against the working reference and its documented functional amendments. No material visual mismatch remains against that specification. Literal pixel identity to the generated illustration is not claimed: live bee positions, measured chart shape, native fonts, extra scientific controls and mobile rearrangement are intentional deviations.
