// Server function to generate image prompts for story pages
// Input: scene text, character descriptions, illustration style, age group
// Output: refined Stable Diffusion XL prompt

import { generateText } from 'ai';
import { createMistral } from '@ai-sdk/mistral';

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export async function generateIllustrationPrompt({
  sceneText,
  characters,
  illustrationStyle,
  ageGroup,
}: {
  sceneText: string;
  characters: { name: string; appearance: string }[];
  illustrationStyle: 'watercolor' | 'oil' | 'digital' | 'pencil' | 'vector' | 'comic';
  ageGroup: '3-5' | '6-8' | '9-12' | '13+';
}) {
  const characterDescriptions = characters.map((c) => `${c.name}: ${c.appearance}`).join('; ');

  const prompt = `You are a professional illustrator creating prompts for a children's book.

Scene: "${sceneText}"
Characters: ${characterDescriptions}
Style: ${illustrationStyle}
Age Group: ${ageGroup}

Generate a detailed Stable Diffusion XL prompt that:
- Describes the scene, lighting, composition
- Names each character with their appearance
- Specifies the art style (${illustrationStyle})
- Includes "children's book illustration" and "high quality"
- Avoids text/words in the image
- Is age-appropriate and safe
- Results in a single cohesive scene

Respond with ONLY the prompt, no explanation.`;

  const { text } = await generateText({
    model: mistral('mistral-small'),
    prompt,
    temperature: 0.7,
    maxTokens: 300,
  });

  return text.trim();
}
