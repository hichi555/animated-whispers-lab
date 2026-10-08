// Server function for TTS (Text-to-Speech) narration
// Uses: Coqui TTS (open-source, MIT license, commercial-safe)
// Self-hosted via local Docker or Replicate API

export async function generateNarration({
  text,
  voicePreset,
  language = 'en',
}: {
  text: string;
  voicePreset: string; // e.g. "jenny", "male_english", etc.
  language?: string;
}): Promise<{ audioUrl: string; duration: number }> {
  // Option 1: Replicate API (simple, pay-per-use)
  // Option 2: Local Coqui TTS server (self-hosted)
  // For MVP, use Replicate (no server setup)

  const replicateResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'c16c4eb01f3f0e21c2f4fa7b8a6c1e9f', // Coqui TTS v1
      input: {
        text,
        speaker: voicePreset,
        language,
      },
    }),
  });

  const prediction = (await replicateResponse.json()) as {
    id: string;
    output?: string[];
    status: string;
  };

  // Poll for completion
  let completed = false;
  let result = prediction;
  while (!completed && result.status !== 'failed') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const checkResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { 'Authorization': `Token ${process.env.REPLICATE_API_KEY}` },
    });
    result = (await checkResponse.json()) as typeof prediction;
    completed = result.status === 'succeeded';
  }

  if (!result.output || result.status === 'failed') {
    throw new Error('Narration generation failed');
  }

  return {
    audioUrl: result.output[0],
    duration: 0, // Calculate from audio file
  };
}
