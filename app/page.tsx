'use client';

import { useEffect, useState } from 'react';

const MURF_API_KEY="ap2_73ee81b1-6bcf-48de-91f8-edf37d628033"

type Voice = {
  voiceId: string;
  displayName: string;
  locale: string;
  displayLanguage?: string;
  accent?: string;
};

export default function Home() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceId, setVoiceId] = useState('');
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('https://api.murf.ai/v1/speech/voices', {
          method: 'GET',
          headers: {
            'api-key': MURF_API_KEY,
          },
        });

        const data = await response.json();
        console.log('VOICES RESPONSE:', data);

        // Fix: if backend returns an object instead of array
        let voicesArray: Voice[] = [];
        if (Array.isArray(data)) {
          voicesArray = data;
        } else if (typeof data === 'object') {
          voicesArray = Object.values(data);
        }

        if (voicesArray.length > 0) {
          setVoices(voicesArray);
          setVoiceId(voicesArray[0].voiceId);
        }
      } catch (error) {
        console.error('Failed to fetch voices', error);
      }
    };

    fetchVoices();
  }, []);

  const generateSpeech = async () => {
    if (!text || !voiceId) return;

    setLoading(true);
    setAudioUrl(null);

    try {
      const response = await fetch('https://api.murf.ai/v1/speech/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': MURF_API_KEY,
        },
        body: JSON.stringify({
          text,
          voiceId,
        }),
      });

      const data = await response.json();
      console.log('GENERATE RESPONSE:', data);

      if (data?.audioFile) {
        setAudioUrl(data.audioFile);
      }
    } catch (error) {
      console.error('Speech generation failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h1 className="text-2xl font-bold">Murf TTS</h1>

        <textarea
          className="w-full border rounded-lg p-3"
          rows={4}
          placeholder="Enter text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <select
          className="w-full border rounded-lg p-3"
          value={voiceId}
          onChange={(e) => setVoiceId(e.target.value)}
        >
          {voices.map((voice) => (
            <option key={voice.voiceId} value={voice.voiceId}>
              {voice.displayName} ({voice.locale})
            </option>
          ))}
        </select>

        <button
          onClick={generateSpeech}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-lg"
        >
          {loading ? 'Generating...' : 'Generate Voice'}
        </button>

        {audioUrl && (
          <div className="space-y-2 mt-4">
            {/* Play Button */}
            <audio controls className="w-full">
              <source src={audioUrl} type="audio/mpeg" />
            </audio>

            {/* Download Button */}
            <a
              href={audioUrl}
              download={`murf-${voiceId}.mp3`}
              className="inline-block bg-black text-white px-4 py-2 rounded"
            >
              Download Voice
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
