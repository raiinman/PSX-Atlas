# PSX-SPX offline capture and reconstruction

Target: https://psx-spx.consoledev.net/dev/ . Capture date: October 24, 2026.

## REA observations

The requested REA plugin and reverse-engineer-anything skill (version 45) were used for controlled browser observations. The REA browser was launched with an isolated, owned Chrome profile and cleaned up after each scenario.

- Live-site Evidence: `ev_2e16f9b9da2c07b00163f0d17f98521174f8f534fb57a257de4383d911d2eb90`.
- Local reconstruction Evidence: `ev_41fc41a08eb9f31c19e8deb8800aeca86e6ca6005ddafd30ca7a755c0df279f2`.
- Complete exported records: `rea-live-site.json` and `rea-offline-site.json` in this directory.

Observed live requests included Google Fonts, GitHub API metadata, Cloudflare analytics, the Material search worker and its search index. The local reconstruction requested only its six loopback HTML/JS/CSS resources. Both REA captures reported complete coverage for the requested observation window; neither capture alone asserts whole-site completeness.

## Whole-site preservation evidence

The sitemap and all 143 corresponding `/dev/` HTML pages were fetched, keeping raw bytes and SHA-256 digests in `archive/inventory.json`. The live sitemap emits stable-root canonical URLs; these were explicitly mapped back to `/dev/` for capture, with both URLs retained in metadata. A source checkout at master commit `112d0914e7af6d29ad088cfc6b66973de9a3c4cd` supplies the original Markdown and committed assets. Normal extraction/build tools perform this full-site preservation; REA supplies runtime dependency evidence.

All 143 source articles, 2,691 preformatted blocks and 163 inline SVG figures were compared against the captured HTML. Cloudflare-obfuscated email citations are deterministically restored locally. All original Markdown/source assets are byte-identical copies. Code-table whitespace is preserved in the HTML and retrieval text. SVG labels receive separate searchable records, including text spread across SVG tspan elements.

The linked PDF is missing upstream (HTTP 404). Third-party cited sites are outside the capture boundary. Their citation URLs are retained and open a local dialog without making an internet request. A malformed upstream `br/` link is recorded in `data/link-issues.json`.

## Design decisions and inference boundaries

- Static HTML preserves readability and crawlability without JavaScript.
- Local JavaScript data and bundled MiniSearch allow full-text search under `file://`, without a web worker, server, CDN or network connection.
- Markdown, JSONL and SQLite FTS5 support agent retrieval without an embedding service or language model.
- Explicit hyperlinks produce the page graph and backlinks. They do not establish causal hardware relationships.
- The curated hardware atlas and four reading paths are added navigation aids, with source links. Read/write connections use two-ended arrows. This is not a hardware simulator or an exhaustive circuit diagram.
- The numeric bit-field tool extracts displayed bit ranges. It does not emulate register side effects and retains uncertainty in field descriptions.
- The upstream development-version notice and original attribution/rights statements are preserved.

## Verification

`verification.json` records the final corpus checks and real-browser tests. Tests run against direct local files with browser networking disabled and assert zero HTTP(S) requests and zero JavaScript errors. They cover term/phrase search, category filtering, empty results, keyboard modal behavior, library filtering, hardware navigation, two GPU tab variants, numeric bit extraction including single-space source ranges, external citation dialogs, and responsive layouts at 320/768/1024/1440 pixels. Automated WCAG A/AA scans cover the atlas, DMA page and GPU tab page; these supplement the interaction checks rather than proving universal accessibility.
