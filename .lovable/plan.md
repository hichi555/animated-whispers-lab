# CiliaTales production upgrade

## Goal
Turn the uploaded CiliaTales project into a polished, coherent story-production studio centered on reusable characters, professional narration, visual storyboards, and family/educator image uploads.

## Build sequence
1. **Stabilize the imported studio**
   - Bring across the existing story, book-reader, illustration, storage, and storyboard foundations.
   - Apply the existing secure database schema and confirm authentication, private media, and generated content work together.

2. **Professional creation workspace**
   - Replace the dark navigation with a crisp white editorial sidebar and refine hierarchy, spacing, labels, empty states, and mobile navigation.
   - Replace the puppy showcase with a useful “Production desk” showing stories, characters, narration, and recent work.

3. **Character design lab**
   - Upgrade the form into a visual sculpting workflow with structured face, build, hair, wardrobe, palette, expression, and silhouette controls.
   - Add parent/teacher photo or sketch uploads, private storage, reference preview/removal, and generated character sheets.
   - Allow a saved voice to be assigned to a character.

4. **Consented voice cloning**
   - Add microphone/file sample capture, explicit rights-and-consent confirmation, clone naming, ElevenLabs voice creation, preview, persistence, assignment, and deletion.
   - Route story narration through the selected cloned ElevenLabs voice while retaining curated narrator options.

5. **Storyboards and motion**
   - Refine scene planning into a professional timeline with shot direction, duration, narration state, and image readiness.
   - Wire production-quality motion generation as explicit per-scene jobs, with clear progress and failure states; keep the existing immediate preview/export path available.

6. **Quality and verification**
   - Improve illustration prompts and reference consistency, error messages, loading states, accessibility, and responsive behavior.
   - Verify the live preview, key signed-in workflows, provider calls, and current build diagnostics.

## Technical details
- Keep private media and project data in Lovable Cloud with per-user access rules.
- Keep AI/provider keys server-side; use ElevenLabs directly through the linked project connection.
- Use Lovable AI’s quality image model for illustrations and its video job API for scene motion.
- Firecrawl remains connected for future research/import workflows; it will not be forced into unrelated generation paths.
- SambaNova, Groq, and provider-specific infrastructure will not be added without credentials and a concrete role; the existing high-quality model path remains authoritative.

## Delivery boundary
This pass delivers the strongest end-to-end product slice first: polished studio, visual character creation, image references, consented voice cloning, narration assignment, and a professional storyboard workflow. True arbitrary 3D mesh sculpting is treated as a future specialist editor rather than mislabeled 2D controls.
