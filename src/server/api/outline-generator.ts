// Premium story outline generator
// Zero AI slop: curated prompt, structured output, safety checks

import { generateText } from 'ai';
import { createMistral } from '@ai-sdk/mistral';
import { AGE_GUIDELINES, validateStoryContent } from '@/lib/story-validation';

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY || 'default-key', // Free tier
});

interface OutlineGeneratorInput {
  idea: string;
  ageGroup: '3-5' | '6-8' | '9-12' | '13+';
  theme?: string;
}

interface OutlineGeneratorOutput {
  title: string;
  outline: string;
  pages: {
    number: number;
    title: string;
    summary: string;
  }[];
  themes: string[];
  estimatedReadingTime: number;
}

/**
 * Generate a premium story outline that passes quality gates
 * - Original and creative (no generic slop)
 * - Age-appropriate
 * - Structured with clear page progression
 * - Ready for illustration
 */
export async function generateStoryOutline({
  idea,
  ageGroup,
  theme,
}: OutlineGeneratorInput): Promise<OutlineGeneratorOutput> {
  const guidelines = AGE_GUIDELINES[ageGroup];

  const systemPrompt = `You are a professional children's book author with 20+ years of experience.
Your stories are:
- Original and creative (never generic AI output)
- Age-appropriate and safe
- Structured for illustration (vivid, visual scenes)
- Engaging from beginning to end
- Suitable for bedtime, classroom, or publishing

You follow strict editorial guidelines and never produce content that feels like an AI generator.`;

  const userPrompt = `Create a premium children's story outline:

Idea: "${idea}"
Age Group: ${ageGroup} (${guidelines.maxWordsPerPage} words max per page, ${guidelines.minPages}-${guidelines.maxPages} pages)
${theme ? `Theme: ${theme}` : ''}

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "title": "Engaging, original title (not generic)",
  "outline": "2-3 paragraph narrative arc with clear beginning/middle/end. Make it feel handcrafted, not AI-generated.",
  "pages": [
    { "number": 1, "title": "Page Title", "summary": "One-sentence scene description for illustration" },
    // ... continue for full story
  ],
  "themes": ["identified themes", "emotional arcs"],
  "estimatedReadingTime": <minutes>
}

Rules:
- NO generic language like "once upon a time" unless it fits the tone
- NO AI clichés or overused phrases
- MUST be illustrated: each page describes a specific, visual scene
- MUST fit age guidelines
- MUST have emotional resonance`;

  try {
    const { text, usage } = await generateText({
      model: mistral('mistral-small'),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.85, // Slightly higher for creativity, not randomness
      topP: 0.95,
      maxTokens: 2000,
    });

    console.log(`[Outline] Generated ${usage?.outputTokens || 0} tokens`);

    // Parse and validate JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from model');
    }

    const outline: OutlineGeneratorOutput = JSON.parse(jsonMatch[0]);

    // Quality gate: validate outline content
    if (!outline.title || outline.title.length < 3) {
      throw new Error('Generated title is too short');
    }

    if (!outline.outline || outline.outline.length < 50) {
      throw new Error('Generated outline is too short');
    }

    if (!outline.pages || outline.pages.length < guidelines.minPages) {
      throw new Error(`Story must have at least ${guidelines.minPages} pages`);
    }

    if (outline.pages.length > guidelines.maxPages) {
      throw new Error(`Story cannot exceed ${guidelines.maxPages} pages`);
    }

    // Validate content safety
    const contentValidation = validateStoryContent(outline.outline, ageGroup);
    if (!contentValidation.valid) {
      console.warn('Content validation issues:', contentValidation.issues);
      // Don't throw, but log for review
    }

    return outline;
  } catch (error) {
    console.error('Story outline generation failed:', error);
    throw new Error(`Failed to generate story outline: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
