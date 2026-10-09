# CyliaTales competitive benchmark

**Reviewed:** 2026-10-09

This benchmark uses ReadKidz's public product pages as a capability reference. It is a product strategy document, not a request to copy their protected code, assets, wording, or visual layouts.

## What ReadKidz currently makes legible

| Capability | Public evidence | CyliaTales status |
| --- | --- | --- |
| Picture-book creation | Idea or manuscript → story, characters, illustrated pages | Implemented in `/stories/new` and the story editor |
| Review-first production | User reviews plan, characters and scenes before full generation | Partially implemented; public positioning now reflects this |
| Character consistency | Reusable face, outfit, proportions and palette across pages/scenes | Implemented through character records, private references and image conditioning |
| Animation | Scene-by-scene animation with shot direction, narration and music | Storyboard preview and per-scene motion jobs implemented; final narrated video is still a gap |
| Narration | Built-in voices and editable narration lines | Implemented, including consented cloned voices |
| Music | Background music included in animation workflow | Not yet a first-class production control in the current app |
| Individual regeneration | Replace one page or shot without rebuilding the project | Implemented for illustrations and storyboard scenes |
| Reader/export | Digital reading, PDF/print output and video sharing | Digital reader and print/PDF path implemented; final motion export needs hardening |
| Classroom use | Age adaptation and educational workflows | Classroom activity generator implemented |
| Multi-format product | Picture books, animations, music videos, comics and graphic novels | CyliaTales currently focuses on books, storyboards and classroom activities |
| Credit packaging | Free concept preview plus paid production credits | No production billing/credit system is currently wired |

## Strategic response

CyliaTales should not win by being a visual clone. It should win by making **production quality and control** visible:

1. **Approval checkpoints** at brief, story plan, cast, art direction and scene review.
2. **Character lock** as a named, inspectable system rather than a vague prompt promise.
3. **Selective regeneration** with version history and clear cost/status feedback.
4. **Narration direction** with voice previews, consent records and per-line replacement.
5. **Film assembly** with a real scene timeline, audio mix, captions and export diagnostics.
6. **Safety and ownership** presented plainly for parents, educators and independent authors.

## Next build phases

### Phase A — Production-grade foundation

- Add explicit project states: `brief`, `story-review`, `cast-review`, `art-review`, `assembly`, `ready`.
- Persist generation attempts, provider status, failure reasons and retry/refund semantics.
- Add a project activity log so users can understand what changed and why.
- Replace optimistic language with verified status labels in every workflow.

### Phase B — Animated story pipeline

- Add first-class animation projects separate from the book reader.
- Add scene ordering, shot versions, clip selection and continuity checks.
- Add narration and background music tracks as separate, mixable assets.
- Add captions/transcript export and a final render checklist.
- Keep the existing storyboard preview as a fast local fallback.

### Phase C — Product breadth

- Add a music-video workflow using the same story/cast records.
- Add comic/panel output reusing approved scenes.
- Add educator lesson packs from completed stories.
- Add a public example shelf only from explicitly published projects.

### Phase D — Commercial readiness

- Add usage metering and transparent credit costs only after the generation ledger is reliable.
- Add team workspaces, roles and review permissions.
- Add project retention controls and export history.
- Add legal/product copy for ownership, third-party uploads and non-exclusive AI outputs.

## Originality guardrails

- Do not scrape or reuse ReadKidz source code, proprietary assets, screenshots, copy, or private product behavior.
- Use public pages only to identify category expectations and unmet needs.
- Keep CyliaTales's visual language editorial, warm and production-oriented: cream canvas, ink-blue structure, amber highlights and original commissioned/generated story art.
- Do not publish unsupported claims about consistency, safety, pricing, resolution or export formats.
