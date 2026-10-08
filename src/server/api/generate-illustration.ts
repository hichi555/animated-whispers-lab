// Server function to generate illustrations via Stable Diffusion XL
// Uses Free.ai free tier (no auth required, 30K tokens/day)
// Fallback: local Ollama + Stable Diffusion

export async function generateIllustration({
  prompt,
  style,
}: {
  prompt: string;
  style: string;
}): Promise<string> {
  // Option 1: Free.ai API (simplest, no setup)
  const freeAiResponse = await fetch('https://api.free.ai/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'flux',
      prompt: `${prompt}, children's book illustration, ${style} style, high quality, safe for children`,
      n: 1,
      size: '1024x768',
    }),
  });

  if (!freeAiResponse.ok) {
    throw new Error(`Free.ai generation failed: ${freeAiResponse.statusText}`);
  }

  const { data } = (await freeAiResponse.json()) as { data: { url: string }[] };
  return data[0].url;
}
