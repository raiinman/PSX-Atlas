# PSX Atlas: agent entry point

This is the machine view of the same offline reference as index.html. Do not crawl HTML or read the entire corpus to orient.

## Quick lookup (Node.js 24+, no dependencies)

From this archive folder:

    node agent/lookup.mjs "DMA2"
    node agent/lookup.mjs "0x1F801810"
    node agent/lookup.mjs "where does DMA3 go"
    node agent/lookup.mjs "texture cache"

Results are bounded: entity connections, register-address hits, ranked excerpts and exact citations. Use --section ID to read one exact record or --page PAGE_ID to read one topic card. All paths resolve relative to this archive regardless of your working directory.

## Without a command runtime

1. Read agent/map.json ({{page_count}} topic routes; no full text).
2. For hardware connections, read agent/entities.json (typed, source-linked edges and aliases). For an address, read agent/symbols.json (lowercase eight-digit physical address key; 0x/h forms equivalent).
3. Open only the selected agent/pages/PAGE_ID.json. It lists section headings, explicit links, incoming topics, original Markdown and exact UTF-8 byte ranges.
4. Read the relevant record in agent/records/PAGE_ID.jsonl. Offsets and lengths are bytes, not Unicode character positions. Use the CLI for an exact byte-range read if available.
5. Cite local_url and source_url. Preserve variant conditions and uncertainty.

Do not treat hyperlinks as causal hardware dependencies. Entity edges are a source-linked navigation model, not emulation. DMA descriptions retain transfer direction. The /dev source notice says recent changes have not all been human-reviewed. Third-party cited websites are outside this archive.

Snapshot: {{captured_at}}
Source commit: {{source_commit}}
Corpus: {{page_count}} pages; {{record_count}} retrieval records.
Full-text fallback: data/reference.sqlite (FTS5) or data/sections.jsonl. Human interface: index.html. Attribution and upstream rights: pages/aboutcredits/index.html and pages/index.html.
