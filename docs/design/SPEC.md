# Working visual specification

Reference: `laboratory-concept.png`, 1536 × 1024. The request authorizes implementation without an intermediate design gate. Core behavior was proved before UI implementation.

- Palette: warm paper #f7f5ee, panel #faf9f5, ink #29332f, secondary #66726b, borders #d8d8cc, sage #6e8874, amber #bd8638, blue #6e8caa. No color overlays on the botanical sprite or gradients.
- Typography: Georgia for the main experiment title and large readout; DM Sans for 13–16px controls and 14–16px body; DM Mono for small measured values. Main title scales 34–52px, not a marketing hero.
- Anatomy: 60px header, title band, 260px experiment rail, flexible landscape, 270px inspector. Thin dividers and modest 6px radii. The living world is the central focal point. Bottom playback strip and explanatory band continue the same grid.
- Controls: outline Lucide icons at 16–18px, 1.6–1.8px strokes; text labels on important actions. Visible focus rings. All touch controls at least 44px high. Sliders and toggle operate native inputs.
- Canvas: code-native bee positions, flight marks, hive, signals, sensor/target debug and patch boundaries. Botanical assets are illustrative glyphs inside true patch bounds; they do not determine sensing. The art is from the selected concept; no opaque overlays.
- Required views: landscape, dance floor, communication; renderer operates on actual snapshots. Inspector has accessible bee selection as a pointer alternative. Paired comparison adds a second synchronized world and a measured outcome table.
- Responsive: world and playback first on narrow screens, then experiment and inspector. Header abbreviates the product subtitle; no horizontal page scrolling. Text/controls remain HTML outside the canvas.
- Allowed copy: user-specified experiment labels, controls, metrics, species/model distinction; the concept's English text with equivalent Turkish copy. All numeric readings come from simulation state.

Intentional functional deviations from the concept: Laboratory is the active navigation item (the image mistakenly highlights Experiments); live readings replace illustrative values; the chart is one measured total throughput series rather than invented A/B series; seed Apply, population, depletion, import and replay history controls are required to make the requested workflow usable; source/evidence detail and metrics definitions are accessible in Field notes. Dense anatomy shown in the concept is extended using the same component system for dance/communication/compare/mobile. Selecting or revising a prediction resets the run to tick zero and pauses before execution; the choice is a hypothesis, not automatically graded as biological truth.
