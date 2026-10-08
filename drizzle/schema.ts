import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, enum as pgEnum, primaryKey } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Enums
const planEnum = pgEnum('plan', ['free', 'lifetime']);
const storyStatusEnum = pgEnum('story_status', ['draft', 'published', 'archived']);
const generationStatusEnum = pgEnum('generation_status', ['pending', 'processing', 'completed', 'failed']);
const ageGroupEnum = pgEnum('age_group', ['3-5', '6-8', '9-12', '13+']);
const illustrationStyleEnum = pgEnum('illustration_style', ['watercolor', 'oil', 'digital', 'pencil', 'vector', 'comic']);

// ============= AUTH & PROFILES =============
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name'),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  plan: planEnum('plan').default('free').notNull(),
  lifetimePurchaseDate: timestamp('lifetime_purchase_date'),
  monthlyGenerationCredits: integer('monthly_generation_credits').default(10),
  creditsRemaining: integer('credits_remaining').default(10),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// External users table reference (Supabase auth.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
});

// ============= STORIES & PAGES =============
export const stories = pgTable('stories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Untitled Story'),
  description: text('description'),
  status: storyStatusEnum('status').default('draft'),
  ageGroup: ageGroupEnum('age_group').default('6-8'),
  coverImageUrl: text('cover_image_url'),
  generatedOutline: jsonb('generated_outline'), // { outline: string, themes: string[] }
  wordCount: integer('word_count').default(0),
  pageCount: integer('page_count').default(0),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  shareToken: text('share_token').unique(), // For unlisted public sharing
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const storyPages = pgTable('story_pages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storyId: text('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number').notNull(),
  title: text('title'),
  text: text('text').notNull(), // Story text for this page
  imagePrompt: text('image_prompt'), // AI-generated prompt for illustration
  imageUrl: text('image_url'), // Final illustration URL (Supabase Storage signed URL)
  illustrationStyle: illustrationStyleEnum('illustration_style').default('watercolor'),
  generatedImageUrl: text('generated_image_url'), // Raw output before processing
  narrationUrl: text('narration_url'), // Audio narration (Supabase Storage signed URL)
  characterIds: text('character_ids').array(), // [uuid, uuid] for characters on this page
  hasNarration: boolean('has_narration').default(false),
  narrationVoiceId: text('narration_voice_id'),
  version: integer('version').default(1), // Increment on text change to invalidate narration
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============= CHARACTERS =============
export const characters = pgTable('characters', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  personality: text('personality'), // e.g. "brave, curious, kind"
  appearance: text('appearance'), // e.g. "small fox, orange fur, big eyes"
  age: text('age'),
  avatarUrl: text('avatar_url'), // Character portrait
  isRecurring: boolean('is_recurring').default(false),
  storiesUsedIn: text('stories_used_in').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============= VOICES & NARRATION =============
export const voices = pgTable('voices', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // e.g. "Wren", "Rowan", "Luna"
  description: text('description'), // e.g. "warm & gentle"
  voicePreset: text('voice_preset').notNull(), // Coqui TTS preset or ElevenLabs voice ID
  language: text('language').default('en'),
  isCustom: boolean('is_custom').default(false),
  consentVerified: boolean('consent_verified').default(false),
  consentDate: timestamp('consent_date', { withTimezone: true }),
  sampleAudioUrl: text('sample_audio_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============= GENERATION JOBS (For tracking AI work) =============
export const generationJobs = pgTable('generation_jobs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  storyPageId: text('story_page_id').references(() => storyPages.id, { onDelete: 'cascade' }),
  jobType: pgEnum('job_type', ['outline', 'character_desc', 'image_prompt', 'illustration', 'narration'])('job_type').notNull(),
  status: generationStatusEnum('status').default('pending'),
  prompt: text('prompt').notNull(),
  result: text('result'),
  error: text('error'),
  processingTimeMs: integer('processing_time_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

// ============= EXPORTS (Track published/exported work) =============
export const exports = pgTable('exports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storyId: text('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  exportType: pgEnum('export_type', ['pdf', 'video', 'epub', 'print_ready'])('export_type').notNull(),
  fileUrl: text('file_url').notNull(), // Supabase Storage signed URL
  fileSize: integer('file_size'),
  isPublic: boolean('is_public').default(false),
  downloadCount: integer('download_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
