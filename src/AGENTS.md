# Atlas interface and agent tools

## Purpose
Human/agent views over one source corpus.
## Ownership
Styles, UI interactions, hardware-map metadata and portable lookup CLI.
## Local contracts
- Preserve red armor/pearl styling, diagram layout and keyboard access.
- Reading and search must work from file URLs without remote dependencies.
- Agent tools offer general search, citations and open-ended navigation. Do not add predetermined answer paths to improve benchmark scores.
- A curated hardware edge is a navigation claim with source evidence; changed evidence requires a visible review status. Do not automatically change its semantic assertion.
## Work guidance
Keep the initial page payload small; load the full search index only on request.
## Verification
Browser offline/responsive/accessibility checks and agent retrieval checks.
## Child DOX index
No child documents.

Navigation exposes an explicit Exit Atlas → GitHub link and offline-release download. These links navigate only on user activation; they add no remote runtime dependencies.

The homepage project control center adds offline search and keyboard-accessible Research / Updates / Reviews / Downloads / GitHub panels around the unchanged hardware map. Snapshot status is explicitly not a live network check. Review panels expose evidence and citations, with no approval action.
