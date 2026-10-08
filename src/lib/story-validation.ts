import { z } from 'zod';

// Age groups with reading level guardrails
const AGE_GUIDELINES = {
  '3-5': {
    minPages: 2,
    maxPages: 8,
    maxWordsPerPage: 50,
    themes: ['friendship', 'adventure', 'family', 'animals', 'nature', 'learning'],
    excludeThemes: ['death', 'violence', 'fear', 'complex emotions'],
  },
  '6-8': {
    minPages: 4,
    maxPages: 16,
    maxWordsPerPage: 120,
    themes: ['friendship', 'adventure', 'problem-solving', 'emotions', 'fantasy', 'mystery'],
    excludeThemes: ['adult content', 'graphic violence', 'substance abuse'],
  },
  '9-12': {
    minPages: 8,
    maxPages: 24,
    maxWordsPerPage: 200,
    themes: ['adventure', 'mystery', 'fantasy', 'social issues', 'emotions', 'discovery'],
    excludeThemes: ['graphic violence', 'sexual content'],
  },
  '13+': {
    minPages: 10,
    maxPages: 48,
    maxWordsPerPage: 300,
    themes: ['any age-appropriate theme'],
    excludeThemes: [],
  },
} as const;

const storySchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  ageGroup: z.enum(['3-5', '6-8', '9-12', '13+']),
  idea: z.string().min(10).max(500),
});

const pageSchema = z.object({
  pageNumber: z.number().positive(),
  title: z.string().max(100).optional(),
  text: z.string().min(5).max(500),
  characterIds: z.string().array().optional(),
});

const characterSchema = z.object({
  name: z.string().min(1).max(100),
  appearance: z.string().min(10).max(500),
  personality: z.string().max(300).optional(),
  age: z.string().max(50).optional(),
});

// Content safety check
export function validateStoryContent(text: string, ageGroup: string): { valid: boolean; issues: string[] } {
  const guidelines = AGE_GUIDELINES[ageGroup as keyof typeof AGE_GUIDELINES];
  const issues: string[] = [];

  if (!guidelines) {
    return { valid: false, issues: ['Invalid age group'] };
  }

  // Check for excluded themes
  const textLower = text.toLowerCase();
  for (const theme of guidelines.excludeThemes) {
    if (textLower.includes(theme.toLowerCase())) {
      issues.push(`Content includes "${theme}" which is not appropriate for age ${ageGroup}`);
    }
  }

  // Check word count
  const wordCount = text.split(/\s+/).length;
  if (wordCount > guidelines.maxWordsPerPage) {
    issues.push(`Page exceeds word limit: ${wordCount}/${guidelines.maxWordsPerPage} words`);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

export { storySchema, pageSchema, characterSchema, AGE_GUIDELINES };
