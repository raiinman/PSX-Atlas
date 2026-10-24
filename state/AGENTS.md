# Update state

## Purpose
Reproducible source identity and durable review state.
## Ownership
Baseline snapshot, updater policy and explicit evidence acceptance.
## Local contracts
- Track upstream `master`; retain all discovered branch and tag refs separately.
- A snapshot identifies source commit, tracked-file hashes, page headings, explicit links and evidence hashes.
- Never clear a pending evidence review merely because the next update sees the same changed text. Acceptance must be explicit.
- Release snapshots are build metadata; source prose remains upstream-owned.
## Work guidance
Retain known-good state until the replacement has passed verification and publication/installation succeeds.
## Verification
Source-change comparison and promotion/failure tests.
## Child DOX index
No child documents.

## Operational files
update-policy.json owns schedule/repository settings; source-snapshot.json is the initial baseline, with subsequent baselines recovered from the latest release. accepted-evidence.json records explicit human acceptance. local-install.json is machine-local and ignored.
