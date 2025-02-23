import React, { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Languages, Volume2, Type, Home, ArrowLeft, Youtube } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useNavigate, useLocation } from 'react-router-dom';

const genAI = new GoogleGenerativeAI('AIzaSyC27RzExtjVS0c9GxAmleRA90TkRbvCtgA');

interface VideoPlayerProps {
  url: string;
  darkMode: boolean;
}

interface TranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'ur', name: 'Urdu' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

const SAMPLE_TRANSCRIPT: TranscriptSegment[] = [
  { startTime: 0, endTime: 5, text: "Hello and welcome to this video!" },
  { startTime: 5, endTime: 10, text: "Today we're going to discuss some interesting topics." },
  { startTime: 10, endTime: 20, text: "First, let's talk about artificial intelligence and its impact on our daily lives." },
  { startTime: 20, endTime: 30, text: "Then, we'll explore how technology is shaping the future of education." },
  { startTime: 30, endTime: 40, text: "Finally, we'll look at some practical applications of these technologies." }
];

function VideoPlayer({ url: initialUrl, darkMode }: VideoPlayerProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [url, setUrl] = useState(initialUrl || (location.state?.url || ''));
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>(SAMPLE_TRANSCRIPT);
  const [translatedTranscript, setTranslatedTranscript] = useState<TranscriptSegment[]>([]);
  const [audioUrl, setAudioUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<ReactPlayer>(null);

  const validateYouTubeUrl = (url: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return pattern.test(url);
  };

  useEffect(() => {
    const isValid = url && validateYouTubeUrl(url) && ReactPlayer.canPlay(url);
    setIsValidUrl(isValid);
  }, [url]);

  useEffect(() => {
    if (currentTime && transcript.length > 0) {
      const newActiveIndex = transcript.findIndex(
        segment => currentTime >= segment.startTime && currentTime < segment.endTime
      );
      if (newActiveIndex !== activeSegmentIndex) {
        setActiveSegmentIndex(newActiveIndex);
        if (audioRef.current && translatedTranscript[newActiveIndex]) {
          audioRef.current.currentTime = translatedTranscript[newActiveIndex].startTime;
          if (isPlaying) {
            audioRef.current.play();
          }
        }
      }
    }
  }, [currentTime, transcript, activeSegmentIndex, translatedTranscript, isPlaying]);

  const goHome = () => navigate('/');
  const goBack = () => navigate(-1);

  const synthesizeAudio = async (segments: TranscriptSegment[]) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mediaStreamDest = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(mediaStreamDest.stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorder.start();

      for (const segment of segments) {
        const utterance = new SpeechSynthesisUtterance(segment.text);
        utterance.lang = selectedLanguage;
        
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(selectedLanguage)) || voices[0];
        if (voice) {
          utterance.voice = voice;
        }

        await new Promise<void>((resolve) => {
          utterance.onend = () => resolve();
          window.speechSynthesis.speak(utterance);
        });
      }

      mediaRecorder.stop();
    } catch (error) {
      console.error('Audio synthesis failed:', error);
      throw error;
    }
  };

  const handleTranslate = async () => {
    if (!isValidUrl) {
      setTranslatedTranscript([]);
      return;
    }

    setIsTranslating(true);
    setIsPlaying(true);
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const selectedLangName = LANGUAGES.find(lang => lang.code === selectedLanguage)?.name;

      const translatedSegments: TranscriptSegment[] = [];
      
      for (const segment of transcript) {
        const prompt = `Translate the following text to ${selectedLangName}: "${segment.text}"`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        translatedSegments.push({
          startTime: segment.startTime,
          endTime: segment.endTime,
          text: response.text().replace(/["""]/g, '')
        });
      }

      setTranslatedTranscript(translatedSegments);
      await synthesizeAudio(translatedSegments);

    } catch (error) {
      console.error('Translation failed:', error);
      setTranslatedTranscript([]);
    } finally {
      setIsTranslating(false);
    }
  };

  const onProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  const scrollToSegment = (index: number) => {
    const element = document.getElementById(`segment-${index}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    if (activeSegmentIndex >= 0) {
      scrollToSegment(activeSegmentIndex);
    }
  }, [activeSegmentIndex]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between mb-6">
        <div className="flex space-x-4">
          <button
            onClick={goHome}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Home className="mr-2" size={20} />
            Home
          </button>
          <button
            onClick={goBack}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="aspect-w-16 aspect-h-9 relative" style={{ paddingTop: '56.25%' }}>
              {!url ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700">
                  <Youtube className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Enter a YouTube URL to get started
                  </p>
                </div>
              ) : !isValidUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20">
                  <p className="text-red-600 dark:text-red-400 text-lg mb-2">Invalid YouTube URL</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Please enter a valid YouTube video URL
                  </p>
                </div>
              ) : (
                <ReactPlayer
                  ref={playerRef}
                  url={url}
                  width="100%"
                  height="100%"
                  controls
                  playing={isPlaying}
                  onProgress={onProgress}
                  style={{ position: 'absolute', top: 0, left: 0 }}
                  config={{
                    youtube: {
                      playerVars: { origin: window.location.origin }
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Languages className="mr-2 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Translation Settings
              </h3>
            </div>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !isValidUrl}
              className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <Volume2 className="mr-2 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Translated Audio
              </h3>
            </div>
            <audio
              ref={audioRef}
              controls
              className="w-full"
              src={audioUrl}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center mb-4">
            <Type className="mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Original Transcript
            </h3>
          </div>
          <div className="prose dark:prose-invert max-w-none h-96 overflow-y-auto">
            {transcript.map((segment, index) => (
              <p
                key={index}
                id={`segment-${index}`}
                className={`py-2 px-3 rounded-lg transition-colors ${
                  activeSegmentIndex === index
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {segment.text}
              </p>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
          <div className="flex items-center mb-4">
            <Type className="mr-2 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Translated Transcript
            </h3>
          </div>
          <div className="prose dark:prose-invert max-w-none h-96 overflow-y-auto">
            {translatedTranscript.length > 0 ? (
              translatedTranscript.map((segment, index) => (
                <p
                  key={index}
                  id={`translated-segment-${index}`}
                  className={`py-2 px-3 rounded-lg transition-colors ${
                    activeSegmentIndex === index
                      ? 'bg-blue-50 dark:bg-blue-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {segment.text}
                </p>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                Translated transcript will appear here after translation
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;