import type { NextApiRequest, NextApiResponse } from "next";

const MURF_BASE_URL = "https://api.murf.ai/v1/speech";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, voiceId } = req.body;

  if (!text || !voiceId) {
    return res.status(400).json({ error: "Missing text or voiceId" });
  }

  try {
    const response = await fetch(`${MURF_BASE_URL}/generate`, {
      method: "POST",
      headers: {
        "api-key": process.env.MURF_API_KEY as string,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_id: voiceId,
        format: "MP3",
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate speech" });
  }
}
