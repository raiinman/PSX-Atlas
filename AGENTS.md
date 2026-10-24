# DOX: PSX Atlas

DOX is installed from `raiinman/dox` at `b88194c34ace1a2a3dc01831d36b8a65986a41f5`. Its original contract and MIT license are preserved in `.dox/FRAMEWORK.md` and `.dox/LICENSE`.

## Core contract

- Before editing, read this root document and each applicable child AGENTS.md. Re-read the chain in the current session; do not rely on memory.
- Root guidance applies project-wide. Child guidance owns its subtree and may not weaken DOX.
- After meaningful changes, update the nearest owning documentation and affected parent/child indexes. Remove stale instructions. Small changes may leave docs unchanged only after a DOX pass.
- Keep instructions concise, current and operational. New child docs use Purpose, Ownership, Local Contracts, Work Guidance, Verification and Child DOX Index sections. Leave guidance/checks empty when none exist rather than inventing them.
- Close out by checking changed paths against this hierarchy, updating contracts and indexes, running existing relevant verification, and reporting any documentation intentionally unchanged and why.

## Project and user contracts

- This is a human/agent offline reference generated from PSX-SPX `master`, not its default `stable` branch. Preserve original text, doubt markers, variants, attribution, headings and every explicit link/branch.
- Preserve the Atlas red/pearl design and system-map geometry. Keep interface code separate from upstream content.
- Do not prescribe a DMA2 route or curate an answer to make discovery tests faster. Agents must remain free to follow downstream changes, alternatives and conflicting evidence.
- Online update jobs must pin one upstream commit, build in staging, verify, then promote. Failure must leave the last working archive/release available.
- Retain upstream branch/tag identity and source hashes. Flag added/removed links, changed headings and changed/missing evidence for manual diagram claims. Never silently treat changed evidence as human-approved.
- Public GitHub project: `raiinman/PSX-Atlas`. DOX is a dependency/documentation framework; do not overwrite `raiinman/dox`.
- Do not publish credentials or local environment artifacts. Runtime reading/search stays fully offline. Daily online maintenance is separate.

## Ownership and child DOX index

- [scripts/AGENTS.md](scripts/AGENTS.md): capture, build, validation, review, packaging, update and installation transactions.
- [src/AGENTS.md](src/AGENTS.md): UI, hardware navigation model and portable agent tools.
- [state/AGENTS.md](state/AGENTS.md): source snapshots, evidence acceptance and update policy.
- [.github/AGENTS.md](.github/AGENTS.md): CI, daily build/release and failure reporting.
- Root owns package metadata, README, design contract and upstream dependency lock. `.dox/` preserves DOX provenance. `evidence/` contains verification records. Generated `offline/`, downloaded `archive/`, upstream checkout, staging and backups are not source-controlled.

## Verification

Use the existing npm scripts for browser/corpus checks, agent retrieval checks, updater tests and packaging. See child instructions for exact commands. No automatic model-generated semantic rewrite belongs in the updater.

## Maintenance entry points
Daily CI is in .github/workflows/update.yml. README documents release installation, review acceptance, UTC/Denver schedules and manual staging. A local installer retains previous archives under _backups/.

The same verified archive is published at https://raiinman.github.io/PSX-Atlas/. README and repository About link launch it; Atlas navigation links back to the normal GitHub repository.

- [docs/AGENTS.md](docs/AGENTS.md): GitHub README showcase and promotional assets; decorative artwork must never be treated as hardware evidence.
