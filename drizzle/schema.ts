import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

const planEnum = pgEnum('plan', ['free', 'lifetime']);
const storyStatusEnum = pgEnum('story_status', ['draft', 'published', 'archived']);
const generationStatusEnum = pgEnum('generation_status', ['pending', 'processing', 'completed', 'failed']);
const ageGroupEnum = pgEnum('age_group', ['3-5', '6-8', '9-12', '13+']);
const illustrationStyleEnum = pgEnum('illustration_style', ['watercolor', 'oil', 'digital', 'pencil', 'vector', 'comic']);
const exportTypeEnum = pgEnum('export_type', ['pdf', 'video', 'epub', 'print_ready']);
const jobTypeEnum = pgEnum('job_type', ['outline', 'character_desc', 'image_prompt', 'illustration', 'narration']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  fullName: text('full_name'),
  email: text('email').notNull().unique(),
  avatarUrl: text('avatar_url'),
  plan: planEnum('plan').default('free').notNull(),
  lifetimePurchaseDate: timestamp('lifetime_purchase_date', { withTimezone: true }),
  freeStoriesUsed: integer('free_stories_used').default(0),
  booksThisYear: integer('books_this_year').default(0),
  booksThisYearResetAt: timestamp('books_this_year_reset_at', { withTimezone: true }),
  videosThisMonth: integer('videos_this_month').default(0),
  videosThisMonthResetAt: timestamp('videos_this_month_reset_at', { withTimezone: true }),
  generatedBooksTotal: integer('generated_books_total').default(0),
  generatedVideosTotal: integer('generated_videos_total').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const stories = pgTable('stories', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Untitled Story'),
  description: text('description'),
  status: storyStatusEnum('status').default('draft'),
  ageGroup: ageGroupEnum('age_group').default('6-8'),
  coverImageUrl: text('cover_image_url'),
  generatedOutline: jsonb('generated_outline'),
  wordCount: integer('word_count').default(0),
  pageCount: integer('page_count').default(0),
  isPublished: boolean('is_published').default(false),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  shareToken: text('share_token').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const storyPages = pgTable('story_pages', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storyId: text('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  pageNumber: integer('page_number').notNull(),
  title: text('title'),
  text: text('text').notNull(),
  imagePrompt: text('image_prompt'),
  imageUrl: text('image_url'),
  illustrationStyle: illustrationStyleEnum('illustration_style').default('watercolor'),
  generatedImageUrl: text('generated_image_url'),
  narrationUrl: text('narration_url'),
  characterIds: text('character_ids').array(),
  hasNarration: boolean('has_narration').default(false),
  narrationVoiceId: text('narration_voice_id'),
  videoUrl: text('video_url'),
  videoDurationSeconds: integer('video_duration_seconds'),
  version: integer('version').default(1),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const characters = pgTable('characters', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  personality: text('personality'),
  appearance: text('appearance'),
  age: text('age'),
  avatarUrl: text('avatar_url'),
  isRecurring: boolean('is_recurring').default(false),
  storiesUsedIn: text('stories_used_in').array().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const voices = pgTable('voices', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  voicePreset: text('voice_preset').notNull(),
  language: text('language').default('en'),
  isCustom: boolean('is_custom').default(false),
  consentVerified: boolean('consent_verified').default(false),
  consentDate: timestamp('consent_date', { withTimezone: true }),
  sampleAudioUrl: text('sample_audio_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const generationJobs = pgTable('generation_jobs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  storyPageId: text('story_page_id').references(() => storyPages.id, { onDelete: 'cascade' }),
  jobType: jobTypeEnum('job_type').notNull(),
  status: generationStatusEnum('status').default('pending'),
  prompt: text('prompt').notNull(),
  result: text('result'),
  error: text('error'),
  processingTimeMs: integer('processing_time_ms'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const exports = pgTable('exports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  storyId: text('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  exportType: exportTypeEnum('export_type').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  isPublic: boolean('is_public').default(false),
  downloadCount: integer('download_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const usageLogs = pgTable('usage_logs', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  count: integer('count').default(1),
  period: text('period').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const planFeatures = pgTable('plan_features', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  plan: text('plan').notNull(),
  storyLimitPerYear: integer('story_limit_per_year').default(100),
  videosPerMonth: integer('videos_per_month').default(4),
  narrationVoices: integer('narration_voices').default(6),
  illustrationStyles: integer('illustration_styles').default(6),
  isLifetime: boolean('is_lifetime').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const videoExports = pgTable('video_exports', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  storyId: text('story_id').references(() => stories.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  status: text('status').notNull().default('processing'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const billingEvents = pgTable('billing_events', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(),
  amountCents: integer('amount_cents').notNull(),
  currency: text('currency').default('usd'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const planLimits = {
  freeStories: 2,
  freeVideoExports: 0,
  lifetimeStoriesPerYear: 100,
  lifetimeVideosPerMonth: 4,
  lifetimeVoicePresets: 6,
};

export default planLimits;







































































































































































































































































































































































