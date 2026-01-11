'use client';

import { useEffect, useState, useRef } from 'react';

const MURF_API_KEY = 'ap2_73ee81b1-6bcf-48de-91f8-edf37d628033';

type Voice = {
  voiceId: string;
  displayName: string;
  locale: string;
  displayLanguage?: string;
  accent?: string;
};

const DEFAULT_VOICE: Voice = {
  voiceId: 'en-US-daisy',
  displayName: 'Daisy (F)',
  locale: 'en-US',
};

export default function Home() {
  const [voices, setVoices] = useState<Voice[]>([DEFAULT_VOICE]);
  const [voiceId, setVoiceId] = useState(DEFAULT_VOICE.voiceId);
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch('https://api.murf.ai/v1/speech/voices', {
          method: 'GET',
          headers: { 'api-key': MURF_API_KEY },
        });
        const data = await response.json();
        let voicesArray: Voice[] = Array.isArray(data) ? data : Object.values(data);
        if (!voicesArray.some((v) => v.voiceId === DEFAULT_VOICE.voiceId)) voicesArray.unshift(DEFAULT_VOICE);
        setVoices(voicesArray);
        setVoiceId(DEFAULT_VOICE.voiceId);
      } catch (error) {
        console.error('Failed to fetch voices', error);
        setVoices([DEFAULT_VOICE]);
        setVoiceId(DEFAULT_VOICE.voiceId);
      }
    };
    fetchVoices();
  }, []);

  const filteredVoices = voices.filter((v) =>
    v.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generateSpeech = async () => {
    if (!text || !voiceId) return;
    setLoading(true);
    setAudioUrl(null);
    try {
      const response = await fetch('https://api.murf.ai/v1/speech/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': MURF_API_KEY },
        body: JSON.stringify({ text, voiceId }),
      });
      const data = await response.json();
      if (data?.audioFile) setAudioUrl(data.audioFile);
    } catch (error) {
      console.error('Speech generation failed', error);
    } finally {
      setLoading(false);
    }
  };

  // Replace functionality
  const handleReplaceAll = () => {
    if (searchTerm && replaceTerm) {
      const regex = new RegExp(searchTerm, 'g');
      setText(text.replace(regex, replaceTerm));
    }
  };

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <main className="h-screen w-screen flex flex-col bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 p-4 md:p-6 lg:p-8">
      <div className="flex-1 flex flex-col max-w-full">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white text-center mb-4 md:mb-6">🎙 Murf TTS Generator</h1>

        <div className="flex-1 flex flex-col gap-4 md:gap-6 min-h-0">
          {/* Notepad-style Textarea with scrollbar */}
          <div className="flex-1 relative flex flex-col min-h-0">
            {searchMode && (
              <div className="absolute top-2 right-2 flex gap-2 bg-white p-2 rounded-xl shadow-md z-10 flex-wrap">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border p-1 rounded w-24 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <input
                  type="text"
                  placeholder="Replace..."
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  className="border p-1 rounded w-24 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={handleReplaceAll}
                  className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-all text-sm"
                >
                  Replace All
                </button>
                <button
                  onClick={() => setSearchMode(false)}
                  className="bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400 transition-all"
                >
                  ✕
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              className="flex-1 w-full border border-gray-300 rounded-xl p-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none overflow-y-auto font-mono bg-white"
              placeholder="Type something here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {/* Search button top right */}
            {!searchMode && (
              <button
                onClick={() => setSearchMode(true)}
                className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-all text-sm"
              >
                🔍 Search/Replace
              </button>
            )}
          </div>

          {/* Voice Dropdown with Search */}
          <div className="relative" ref={dropdownRef}>
            <div
              className="w-full border border-gray-300 rounded-xl p-3 cursor-pointer flex justify-between items-center focus:ring-2 focus:ring-purple-400 bg-white"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <span className="text-gray-700">{voices.find((v) => v.voiceId === voiceId)?.displayName || 'Select Voice'}</span>
              <span className="transform transition-transform duration-200">{dropdownOpen ? '▲' : '▼'}</span>
            </div>

            {dropdownOpen && (
              <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-xl mt-1 max-h-64 overflow-y-auto shadow-lg">
                <input
                  type="text"
                  placeholder="Search voice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 border-b border-gray-200 focus:outline-none"
                />
                {filteredVoices.length > 0 ? (
                  filteredVoices.map((voice) => (
                    <div
                      key={voice.voiceId}
                      className="p-3 hover:bg-purple-100 cursor-pointer text-gray-700"
                      onClick={() => {
                        setVoiceId(voice.voiceId);
                        setDropdownOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      {voice.displayName} ({voice.locale})
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500">No voices found</div>
                )}
              </div>
            )}
          </div>

          {/* Generate Button */}
          <button
            onClick={generateSpeech}
            disabled={loading || !text}
            className="cursor-pointer w-full bg-purple-800 border border-white border-2 text-white py-3 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg"
          >
            {loading ? 'Generating...' : 'Generate Voice'}
          </button>

          {/* Audio & Download */}
          {audioUrl && (
            <div className="space-y-3 bg-white p-4 rounded-xl shadow-inner">
              <audio controls className="w-full rounded-lg">
                <source src={audioUrl} type="audio/mpeg" />
              </audio>
              <div className="cursor-pointer flex justify-end space-x-2">
                <a
                  href={audioUrl}
                  download={`murf-${voiceId}.mp3`}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all"
                >
                  Download
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
