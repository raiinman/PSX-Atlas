# PSX Atlas promotional assets

- psx-atlas-hero.png: wide README hero, linked to the working Atlas.
- psx-atlas-dual-reference.png: human/agent feature image, linked to Agent view.
- atlas-interface.png: refreshed screenshot of the public control center Research panel, captured 2026-10-24.
- atlas-control-center-reviews.png: public Reviews panel showing the pending SPU evidence without approval, captured 2026-10-24.

The generated artwork is decorative. Its circuitry, board and book are not evidence about PS1 hardware. Only the actual interface screenshot represents the product's UI. No graph connections or application flow were changed.

## Workflow and provenance
DSL-Helper high-end-visual-design was read at skill-library commit 594499cb9a842822580d847d85abdf832814c27c with maintenance overlay dsi-0.1.13. The user's established red/pearl PS1 design takes priority over generic style defaults. GitHub Markdown constrains the README: no interactive app, custom script or CSS is embedded there.

The two artwork images were generated using the built-in image_gen tool, not a CLI fallback. [Final prompt set](prompts.json).

For future requests: **Create a branded GitHub repository README landing page with a hero banner, promotional graphics, an actual product screenshot, and prominent Launch / Download / View Source links. Host the interactive app on GitHub Pages.**

A **repository social preview** is a separate image used when someone shares the repository URL. These README banners do not automatically set that GitHub setting.

## Configured GitHub social preview
On 2026-10-24, psx-atlas-social.jpg was uploaded and saved through the repository General → Social preview settings. It is a 1774×887, 308,408-byte JPEG of the 2:1 banner adaptation. GitHub cropped the original 3:1 hero, so the adaptation adds vertical room and keeps all lettering visible. The original README hero is unchanged. The PNG master is psx-atlas-social-2x1.png; its final built-in image_gen edit prompt is in prompts.json.

## Dashboard launch and screenshots
The README Launch button, hero banner and interface screenshots link directly to https://raiinman.github.io/PSX-Atlas/#control-center. Repository About uses the same destination. Screenshots are direct browser captures of the working site, without compositing or edits. The dashboard anchor has room for the fixed header on desktop and mobile. Hardware metadata and evidence acceptance are unchanged. Root DOX ownership/index instructions remain applicable; no new ownership scope was introduced.
