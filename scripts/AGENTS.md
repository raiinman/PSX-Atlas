# Scripts

## Purpose
Build, validate, update and install the offline reference.
## Ownership
Capture/import, HTML/agent generation, source-change review, tests, packaging and update transactions.
## Local contracts
- Pin source/render to the same Git commit; never combine a fresh checkout with cached live HTML from another revision.
- Build and test inside a new staging directory. Do not write over the working archive before checks pass.
- Promotion must retain the previous working directory and restore it if the switch fails.
- Extract all article content nodes. Preserve preformatted text and indexed SVG labels. Link graphs represent explicit source navigation, not inferred causal dependencies.
- Review reports must include link/heading changes and carry unresolved manual-evidence flags across updates.
- Source page counts and anchors evolve; validate against the current inventory rather than a hard-coded historical total.
## Work guidance
Use Node.js 24+ and built-in APIs where sufficient. Browser tests support installed Chrome locally and Playwright Chromium in CI. Package before publishing; a draft release is not the last-known-good pointer.
## Verification
`npm test`, `npm run test:agent`, updater transaction/review tests and `npm run package` as applicable.
## Child DOX index
No child documents.

## Current maintenance commands
`npm run update -- --stage-only` renders and verifies a pinned candidate. `npm run install:update` installs the latest verified release with checksums and a retained backup. `npm run test:updater` includes failures both before and after switching directories. Publisher and installer verify the packaged per-file inventory.

`pwsh -File scripts/register-update-task.ps1` registers the current-user, hidden Windows installer at 15:07 UTC. It uses interactive-token/least-privilege execution and catches up when available; the user must be signed in.

Source-change hashes use committed Git blob bytes, not checkout bytes, so Windows/Linux line-ending differences cannot create false evidence reviews. Article/source byte-preservation checks still compare the exact acquired checkout.

`node scripts/prepare-pages.mjs` verifies _release/PSX-Atlas-Offline.zip and extracts _site/ for GitHub Pages, adding hosted canonical URLs, robots.txt and sitemap.xml. It never rewrites upstream article text.
