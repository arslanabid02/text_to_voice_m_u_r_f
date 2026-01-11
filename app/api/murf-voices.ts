import type { NextApiRequest, NextApiResponse } from "next";

const MURF_BASE_URL = "https://api.murf.ai/v1/speech";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch(`${MURF_BASE_URL}/voices`, {
      headers: {
        "api-key": process.env.MURF_API_KEY as string,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch voices" });
  }
}
