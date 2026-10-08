export interface Story {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  ageGroup: '3-5' | '6-8' | '9-12' | '13+';
  coverImageUrl?: string;
  generatedOutline?: {
    outline: string;
    themes: string[];
  };
  wordCount: number;
  pageCount: number;
  isPublished: boolean;
  publishedAt?: string;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoryPage {
  id: string;
  storyId: string;
  pageNumber: number;
  title?: string;
  text: string;
  imagePrompt?: string;
  imageUrl?: string;
  illustrationStyle: 'watercolor' | 'oil' | 'digital' | 'pencil' | 'vector' | 'comic';
  generatedImageUrl?: string;
  narrationUrl?: string;
  characterIds?: string[];
  hasNarration: boolean;
  narrationVoiceId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  description?: string;
  personality?: string;
  appearance: string;
  age?: string;
  avatarUrl?: string;
  isRecurring: boolean;
  storiesUsedIn: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Voice {
  id: string;
  userId: string;
  name: string;
  description?: string;
  voicePreset: string;
  language: string;
  isCustom: boolean;
  consentVerified: boolean;
  consentDate?: string;
  sampleAudioUrl?: string;
  createdAt: string;
}

export interface GenerationJob {
  id: string;
  userId: string;
  storyPageId?: string;
  jobType: 'outline' | 'character_desc' | 'image_prompt' | 'illustration' | 'narration';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  prompt: string;
  result?: string;
  error?: string;
  processingTimeMs?: number;
  createdAt: string;
  completedAt?: string;
}
