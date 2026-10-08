# CyliaTales Audit & Build Plan

## ✅ WHAT'S GOOD (Premium Foundation)
1. **Landing page design** — clean, professional typography (Fraunces + Manrope), clear value pillars, perfect hero copy
2. **Component library** — full Radix UI setup, Tailwind 4, semantic HTML, excellent foundation for scale
3. **Auth flow** — Supabase + Google OAuth already integrated, email/password auth working
4. **Tech stack** — TanStack Start (modern), React 19, TypeScript strict mode, Server-Side Rendering ready
5. **Typography** — premium font pairing (Fraunces display + Manrope body) shows intent

## 🔴 CRITICAL GAPS (Missing)
1. **Database schema** — drizzle/schema.ts is empty; need: users, profiles, stories, pages, characters, narrations, generations, billing
2. **Studio workspace** — no `/studio` layout, no editor UI, no workspace (story writer, character builder, illustrator, narrator)
3. **AI integration** — @ai-sdk/openai installed but no endpoints; need: text generation, image generation, TTS endpoints
4. **API layer** — no server functions for AI pipeline, no job queue, no streaming for long-running tasks
5. **File storage** — no signed URLs, no image storage strategy; need: Supabase Storage integration
6. **Billing/Plans** — no pricing logic, no plan enforcement (free vs $89 lifetime)
7. **Content moderation** — no safety checks, no age-appropriate filtering

## 🟡 NEEDS IMPROVEMENT (Quality)
1. **Auth UX** — missing email verification UI, password reset, account settings, plan selector at signup
2. **Error handling** — basic error boundaries, no granular error recovery
3. **Performance** — no code splitting, no image optimization, no API caching strategy
4. **Accessibility** — good foundation but missing ARIA labels on interactive elements
5. **Mobile** — responsive but untested; need mobile-first polish
6. **Loading states** — no skeleton screens, no progressive loading for stories/illustrations

---

## 🏗️ BUILD PRIORITY (Next 30 Days)

### Phase 1: Database + Auth (Days 1-5)
- [ ] Drizzle schema: users, profiles, stories, story_pages, characters, voices, exports, generation_jobs
- [ ] Supabase RLS policies (users own only their own data)
- [ ] Plan logic: free vs lifetime detection

### Phase 2: Studio Layout (Days 6-8)
- [ ] Protected `/studio` route with sidebar navigation
- [ ] Workspace switcher (Writer → Character → Illustrator → Narrator)
- [ ] Empty states with onboarding
- [ ] Dashboard with story grid

### Phase 3: AI Endpoints (Days 9-15)
- [ ] Story brainstorm endpoint (Mistral 7B free tier)
- [ ] Story outline generator
- [ ] Character description generator
- [ ] Image prompt builder from scene text
- [ ] Illustration endpoint (Stable Diffusion XL via Free.ai API)
- [ ] TTS endpoint (Coqui TTS locally)

### Phase 4: Story Editor UI (Days 16-20)
- [ ] Story page editor (title, text per page)
- [ ] Live preview (book spreads)
- [ ] Character selector per page
- [ ] Illustration regen flow
- [ ] Export options (PDF, video frame)

### Phase 5: Premium Polish (Days 21-30)
- [ ] Narration page-by-page with audio preview
- [ ] Video export to MP4 (FFmpeg)
- [ ] Print-ready PDF export (ISBN fields)
- [ ] Account settings, plan upgrade flow
- [ ] Public share links (unlisted stories)

---

## 🎨 DESIGN UPGRADES (Highest Quality)
1. **Color system** — add: subtle gradients, depth with shadows, accent for interactive states
2. **Micro-interactions** — smooth page transitions, button feedback, loading spinners
3. **Premium typography** — add letter-spacing, line-height tweaks for body text
4. **Spacing** — consistent 4/8/12/16/24/32/48px rhythm
5. **Icons** — Lucide is good; add custom icons for story, character, illustrate, narrate steps

---

## 💰 BUSINESS MODEL
- **Free plan:** brainstorm (3 ideas/month), no generation
- **Lifetime ($89):** unlimited stories, full generation pipeline, exports (PDF, video, ISBN)
- **Monetization trigger:** track free→lifetime conversion; upgrade APIs when 10+ lifetime users

---

## 🚀 SUCCESS METRICS (MVP)
1. Auth works, users can sign up
2. First story created (brainstorm + outline)
3. Character created
4. Illustration generated for 1 page
5. Narration generated for 1 page
6. PDF export works
