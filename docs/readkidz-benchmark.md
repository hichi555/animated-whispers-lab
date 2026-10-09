## Verified public benchmark update — 2026-10-09

The public ReadKidz surfaces most clearly differentiate on **reviewable production orchestration** rather than a single model call:

- Picture books: brief or manuscript → age/genre/page-shape settings → story review → art-family proposal → character/style lock → page-level repaint → reorder/add pages → reader/PDF/print.
- Animation: idea/script → 1–3 minute and aspect-ratio settings → script review → concept-board review → cast/set/prop direction → shot-level storyboard → per-shot re-film → narration/music/timeline export.
- Kids music videos: idea → mood/style/age → original lyrics and melody → compare performance takes → character/location lock → timed animation → song/video download.
- Comics/graphic novels: brief → age/genre/language/shape/style → panel/page planning → lettering and reading order → panel-level redraw or localized retouch → reader/image/PDF output.
- Open creation: image/video/music generation with references, model/quality/shape/price shown before confirmation, persistent versions and iteration history.
- Commercial controls: public credit plans, concurrent task limits, watermark distinctions, and stated refund behavior for failed generation.

CyliaTales already has the foundation for selective production: authenticated stories, private character references, per-page illustrations, narration, consented voice cloning, storyboard scene direction, per-scene motion jobs, digital reading, PDF/print, and classroom activities.

### Implemented in this iteration

`/labs` is now a real, data-backed **Production Desk**:

- Selects among the user’s actual stories.
- Reads actual `stories` and `story_pages` records.
- Computes story brief, cast lock, page review, and film assembly gates.
- Shows real illustration, narration, and motion coverage counts.
- Provides a real shot list with asset indicators and direct scene review links.
- Links into the existing story timeline, cast, library, and new-story workflows.
- Uses no fake project cards, mock output, placeholder assets, or unsupported product claims.

### Next highest-impact implementation order

1. Add a persistent project/shot version ledger so users can compare takes and revert safely.
2. Add a first-class film audio mix with separate narration, music, and caption tracks.
3. Add comic-panel and music-video output models only when their actual generators and exports are wired end-to-end.
4. Add transparent generation cost/status/refund records before commercial credit packaging.
5. Add project-level export history and final delivery checks for WebM, PDF, and classroom packs.
