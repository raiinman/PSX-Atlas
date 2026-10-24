# Fresh-agent DMA2 trial: before fixes

A new subagent was launched without conversation history. It was given only the archive path and the task of tracing DMA2 from main RAM through the GPU to VRAM, including ports, modes, command lists, image transfers and exact citations. It was restricted to the offline directory and forbidden from browsing, reading parent files, inspecting implementation or editing files.

The agent reported its first useful source at approximately 6.1 seconds and a completed answer at approximately 40.9 seconds. These are approximate agent-reported wall-clock intervals: its first monotonic stopwatch was inadvertently not persisted, so it applied an estimated 0.5-second adjustment to subsequent timing. Do not present them as precise benchmark measurements.

Route: directory listing → START HERE.txt / AGENTS.md / README.txt → ordinary DMA2 lookup → topic cards → exact sections. Nine tool calls contained 17 lookup invocations and retrieved eleven exact records. Three directly read entry files totaled 3,364 bytes. Total underlying filesystem I/O was not instrumented.

The answer correctly distinguished GP0 data from GP1 control, linked-list SyncMode 2 from image-transfer SyncMode 1, GPU-local VRAM from CPU-mapped memory, and DMA6's RAM-only role. It supplied exact local anchors and original URLs entirely from archived metadata.

Reported friction: the GPU overview calls image DMA “Continuous,” while the DMA register page calls SyncMode 1 “Slice.” Additional tool invocations were needed to collect the full path's source sections.

A curated trace bundle and batch retrieval experiment were proposed and briefly tested. The user correctly identified that prescribing a DMA2 path would bias the trial and could conceal branches or conflicting downstream evidence. The experiment was withdrawn, including CLI changes, entry-point hints, route files and related tests. Its faster follow-up result is not treated as a valid improvement in unguided discovery.

The complete offline archive was restored from the pre-trial ZIP. All 649 baseline file hashes match. Original source prose, navigation and discovery behavior are unchanged. Future evaluation must preserve open-ended branching and distinguish general retrieval improvements from answers curated for the test question.
