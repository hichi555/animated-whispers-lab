<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep authenticated studio navigation within its pathless layout, separate from the public home page, to avoid duplicate chrome.
- The book reader is a dedicated overlay using private signed media URLs and persisted page narration to preserve reading state and privacy.
- Store uploaded showcase art as CDN asset pointers; these are editorial references, not generated user library records.
- Map illustration-style editorial artwork in a shared client-safe catalog so selectors use the same reference images.

- Reader position is stored per story locally; never persist signed URLs or narration media in browser storage, to keep private media access scoped.
- Storyboard scenes use the same story_pages records as the book editor; script changes invalidate narration to prevent stale spoken content.
- Browser video export produces silent 1080p WebM from private illustrations; print uses a dedicated paginated layout without storing signed URLs.
