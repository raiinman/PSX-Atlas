# GitHub automation

## Purpose
Build and publish verified offline releases daily without requiring this computer to be on.
## Ownership
Workflows and failure/review reporting.
## Local contracts
- Scheduled job targets PSX-SPX `master`, runs on the Atlas default branch, and supports manual dispatch.
- Use fresh pinned source, locked dependencies and tests before publication.
- Build jobs have read-only repository access. Publishing uses a separate job with only the required write permissions.
- Upload/verify draft assets before publishing a new latest release. Keep previous releases; never delete last-known-good on failure.
- Preserve branches and connections, flag source/evidence drift, and do not generate curated semantic routes.
- Ordinary runs must not send messages to other people. Repository review/failure issues and workflow artifacts are the maintenance record.
## Work guidance
Keep the schedule away from the top of the hour; record its UTC and user-facing time in README.
## Verification
Run the actual workflow and inspect its conclusion/assets after setup.
## Child DOX index
`workflows/` is owned here; no child document.

## Deployed workflow
`workflows/update.yml`: daily 14:23 UTC, push to main, or manual dispatch. Read-only build → verified artifact → separate draft/publish job; failure creates a repository maintenance issue. Action commit pins are recorded in actions-lock.json.

## Hosted Atlas
After successful release publication, the Pages job extracts the same verified ZIP, validates file hashes, and deploys it through the github-pages environment. Site failure leaves the previous Pages deployment available. No Jekyll theme is applied. The repository About link and README launch the working Atlas.
