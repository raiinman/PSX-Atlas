# SPU update 848ed5db: evidence review, not approval

Upstream commit: [SPU: Document the LSAX write latch and Key On timing](https://github.com/psx-spx/psx-spx.github.io/commit/848ed5db432ad68a97a3fcfcca4de28018a4c94b). Characterization is credited to Stenzek in the commit message.

Comparison: 112d0914e7af6d29ad088cfc6b66973de9a3c4cd → 848ed5db432ad68a97a3fcfcca4de28018a4c94b.
Only docs/ps1/spu/soundprocessingunitspu.md changed: **22 added lines, one removed line**, in four diff hunks. No page, heading or explicit-link additions/removals were detected.

[Exact unmodified Git diff](SPU-848ed5db.patch).

| Section | Previous documentation | What the commit adds or corrects |
| --- | --- | --- |
| [LSAX loop-start address, lines 150–162](https://github.com/psx-spx/psx-spx.github.io/blob/848ed5db432ad68a97a3fcfcca4de28018a4c94b/docs/ps1/spu/soundprocessingunitspu.md#L150-L162) | Described the loop-start address register and its use; did not document this write latch or its startup exception. | Any write normally sets a per-voice latch blocking Loop-Start-Bits from overwriting LSAX, even a same-value write or a write while keyed off. Key On clears the latch without itself changing LSAX. During the first three samples after Key On is serviced, the first block header is fetched repeatedly; if its Loop-Start-Bit is set, its address is copied to LSAX on each fetch. A write before the third fetch does not set the latch, so a subsequent Loop-Start-Bit can overwrite it. A later write sets it normally. This cutoff depends on Key On timing, independently of pitch and the first block's Loop-Start-Bit. |
| [Key On latency, lines 597–601](https://github.com/psx-spx/psx-spx.github.io/blob/848ed5db432ad68a97a3fcfcca4de28018a4c94b/docs/ps1/spu/soundprocessingunitspu.md#L597-L601) | Already discussed Key On service latency and capture timing; lacked this exact startup sequence. | After service, four samples remain silent. The first three fetch/apply the first block header; ENDX clears on the first. Attack begins on sample five, with ENVX becoming nonzero four samples after ENDX clears. |
| [Key Off, lines 616–617](https://github.com/psx-spx/psx-spx.github.io/blob/848ed5db432ad68a97a3fcfcca4de28018a4c94b/docs/ps1/spu/soundprocessingunitspu.md#L616-L617) | Explained the transition into Release. | A keyed-off voice continues advancing through sample data and applying Loop-Start-Bits to LSAX, regardless of whether SPU IRQ is enabled. |
| [ENDX clear, lines 629–630](https://github.com/psx-spx/psx-spx.github.io/blob/848ed5db432ad68a97a3fcfcca4de28018a4c94b/docs/ps1/spu/soundprocessingunitspu.md#L629-L630) | Said clearing occurred when setting the corresponding KEY ON bits. | Clearing occurs on the first sample after Key On is serviced. The register write and its eventual service are distinct moments. |

## Why this Atlas connection was flagged

Connection ID: spu->soundram@ps1/spu/soundprocessingunitspu/

Its existing label is **Samples / capture / reverb**, with bidirectional navigation between SPU and Sound RAM. Its citation is the whole SPU document, rather than a specific paragraph. The updater compares the SHA-256 of that committed document's bytes with its retained evidence baseline. Any change in that document therefore flags the connection conservatively.

- Retained baseline hash: 51cf23258e9860c2bba20ec55ee8ca9f392d842039d7af6ab27313c56c0d5804
- New document hash: b95d7357a51f392181fa61be9ef1afb99488f8f3e895c8045ca2082bf719d111
- Current status: **needs-review**

The flag means **supporting source changed**. It does not establish that the edge is false, that its direction changed, or that RAM/DMA/GPU routes should be altered. The changed paragraphs concern sample decoding/loop addresses and voice timing; the broad citation is why this specific edge received the flag. No new causal inference is being accepted here.

Later builds show the same upstream SHA on both sides and zero fresh source changes, but carry this unresolved flag forward. That is deliberate: another successful build is not human approval.

No connection, journey, routing behavior, evidence-acceptance entry or approval status was changed for this explanation. [Review issue](https://github.com/raiinman/PSX-Atlas/issues/1) remains open.
