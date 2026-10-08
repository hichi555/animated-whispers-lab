// Server function for free AI story outline generation
// Uses: Mistral 7B (free tier via Free.ai or local Ollama)
// Input: story idea, age group, theme
// Output: structured outline + themes array

import { generateText } from 'ai';
import { createMistral } from '@ai-sdk/mistral';

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateStoryOutline({
  idea,
  ageGroup,
  theme,
}: {
  idea: string;
  ageGroup: '3-5' | '6-8' | '9-12' | '13+';
  theme?: string;
}) {
  const ageGroupGuide = {
    '3-5': '2-4 pages, very simple vocabulary, repetitive structure, 50-100 words per page',
    '6-8': '6-8 pages, intermediate vocabulary, clear beginning/middle/end, 100-150 words per page',
    '9-12': '10-12 pages, advanced vocabulary, more complex plot, 150-200 words per page',
    '13+': '12-16 pages, sophisticated themes, subplots, 200-300 words per page',
  };

  const prompt = `You are a professional children's book author creating high-quality, original stories.

Create a story outline for:
- Idea: "${idea}"
- Age Group: ${ageGroup} years old
- Guidelines: ${ageGroupGuide[ageGroup]}
${theme ? `- Theme: ${theme}` : ''}

Provide a JSON response with this exact structure:
{
  "title": "Story Title (age-appropriate, engaging)",
  "outline": "A 2-3 paragraph story outline with clear beginning, middle, end",
  "themes": ["theme1", "theme2", "theme3"],
  "pageCount": <number>,
  "characterCount": <number>,
  "suggestedCharacters": ["name1", "name2", ...],
  "tone": "descriptive tone for this story"
}

Ensure the story is:
- Original and creative (no AI slop)
- Age-appropriate
- Suitable for illustration
- Engaging from start to finish`;

  const { text } = await generateText({
    model: mistral('mistral-small'),
    prompt,
    temperature: 0.8,
    topP: 0.9,
    maxTokens: 1500,
  });

  // Parse JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse story outline');

  return JSON.parse(jsonMatch[0]);
}
