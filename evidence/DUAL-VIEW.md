# Dual-document update

DSL-Helper workflows used: performance-optimization and frontend-design, at the retained live DSI source revision `594499cb9a842822580d847d85abdf832814c27c`, maintenance overlay `dsi-0.1.13`.

The human view retains the original system map geometry and wiring, now in a PS1/Zero-inspired candy-red and pearl interface. The machine view starts at `agent/START.md`, routes through a 143-topic map and 24 entity definitions, and reads exact sections through byte offsets or a dependency-free Node.js 24+ CLI. Attributions and development notices are consolidated in the sidebar snapshot block; original source credits remain intact.

The measured bottleneck was a 15.6 MB corpus loaded on every human page and indexed at the first search. The browser now loads a 43 KB reference bootstrap, then opens a prebuilt local search index only when search is requested. Synchronous restoration of the prebuilt index outperformed rebuilding it in the browser. An asynchronous restoration experiment was within the old search-time variance and was discarded.

Retrieval validation found two defects in the earlier machine export: repeated insertion into nested div containers duplicated prose, and using element-only children omitted text nodes left outside paragraphs by malformed upstream HTML. The revised extractor uses one container and all article content nodes. Every page's resulting non-diagram retrieval text is compared against the source capture, ignoring whitespace only; exact original preformatted content remains checked separately in the HTML. The corrected export contains 3,015 records, including diagram labels.

`performance-after.json` reports before/after measurements from three fresh offline browser contexts on the same host and bounded agent query measurements including process startup. These are local synthetic results, not guarantees for other hardware. `verification.json` records full text, links, offline browser behavior and accessibility checks. `scripts/verify-agent.mjs` validates every exact UTF-8 record byte range, source-text coverage, typed DMA3 direction, hexadecimal address forms/mirrors, diagram label retrieval and operation from an arbitrary working directory.

The agent connection model is deliberately typed and source-linked. Explicit hyperlinks do not establish causal hardware dependencies; curated component edges and DMA descriptions retain their evidence and direction. No language model, cloud service or embeddings are required.
