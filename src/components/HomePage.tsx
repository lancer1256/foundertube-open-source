import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface VideoCard {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  views: string;
  duration: string;
}

interface ScrapingDogVideo {
  link?: string;
  title?: string;
  thumbnail?: string | { static?: string; rich?: string };
  published_date?: string;
  views?: string;
  length?: string;
}

// --- Rotating phrase generation ---
const founderCompanyPairs = [
  { company: 'Apple', founder: 'Steve Jobs' },
  { company: 'Microsoft', founder: 'Bill Gates' },
  { company: 'Tesla', founder: 'Elon Musk' },
  { company: 'Amazon', founder: 'Jeff Bezos' },
  { company: 'Facebook', founder: 'Mark Zuckerberg' },
  { company: 'OpenAI', founder: 'Sam Altman' },
  { company: 'Palantir', founder: 'Alex Karp' },
  { company: 'Google', founder: 'Larry Page' },
  { company: 'Google', founder: 'Sergey Brin' },
  { company: 'Twitter', founder: 'Jack Dorsey' },
  { company: 'Stripe', founder: 'Patrick Collison' },
  { company: 'Dropbox', founder: 'Drew Houston' },
  { company: 'Airbnb', founder: 'Brian Chesky' },
  { company: 'LinkedIn', founder: 'Reid Hoffman' },
  { company: 'Nvidia', founder: 'Jensen Huang' },
  { company: 'Spotify', companyAlt:'Spotify', founder: 'Daniel Ek' },
  { company: 'PayPal', founder: 'David Sacks' },
  { company: 'Uber', founder: 'Garrett Camp' },
  { company: 'Slack', founder: 'Stewart Butterfield' },
  { company: 'DoorDash', founder: 'Tony Xu' }
];

const templates = [
  'Best {company_name} interview',
  'Early days of {company_name} – {founder_name} interview',
  '{founder_name} on building {company_name}',
  'How {founder_name} started {company_name}',
  'The untold story of {company_name}',
  'Rare interview with {founder_name} about {company_name}',
  'Best moments from {founder_name} interviews',
  'Lessons from {founder_name} on {company_name}',
  '{founder_name} on the struggles of launching {company_name}',
  'The rise of {company_name} – {founder_name} interview',
  'Behind the scenes: {founder_name} talks about {company_name}',
  'Building {company_name}: {founder_name} tells all',
  'What happened in the early days of {company_name}?',
  'Best interview on {company_name}\'s origins',
  '{founder_name} shares insights on {company_name}',
  'Unfiltered: {founder_name} on the early days of {company_name}',
  'How {founder_name} built {company_name} from scratch',
  '{founder_name} on the biggest challenges of {company_name}',
  '{founder_name} interview: the vision behind {company_name}',
  'Never-before-seen interview with {founder_name}'
];

const randomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

interface PhraseData { phrase: string; company: string; founder: string }

const generatePhrase = (): PhraseData => {
  const { company, founder } = randomElement(founderCompanyPairs);
  const template = randomElement(templates);
  const phrase = template
    .replace(/\{company_name\}/g, company)
    .replace(/\{founder_name\}/g, founder);
  return { phrase, company, founder };
};

// Generate an array of unique phrases for suggestions
const generateSuggestions = (count: number = 5): PhraseData[] => {
  const phrases: PhraseData[] = [];
  const seen = new Set<string>();
  // Simple loop – collisions are extremely unlikely but guarded against
  while (phrases.length < count) {
    const p = generatePhrase();
    if (!seen.has(p.phrase)) {
      seen.add(p.phrase);
      phrases.push(p);
    }
  }
  return phrases;
};

const SCRAPING_DOG_API_KEY = import.meta.env.VITE_SCRAPINGDOG_API_KEY as string | undefined;

// Extract YouTube video ID from various URL formats (shared with SearchPage)
const extractVideoId = (youtubeUrl: string): string => {
  const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : '';
};

export default function HomePage() {
  const [videos, setVideos] = useState<VideoCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [headline, setHeadline] = useState<string>('');
  const [suggestions, setSuggestions] = useState<PhraseData[]>([]);

  useEffect(() => {
    // Prevent double fetch in React StrictMode
    let didFetch = false;
    if (!didFetch) {
      setSuggestions(generateSuggestions());
      fetchLatest();
      didFetch = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLatest = async () => {
    setLoading(true);
    setError(null);
    if (!SCRAPING_DOG_API_KEY) {
      setHeadline('Founder interviews without the noise');
      setError('Add VITE_SCRAPINGDOG_API_KEY to enable live search.');
      setLoading(false);
      return;
    }
    try {
      const phraseData = generatePhrase();
      setHeadline(phraseData.phrase);
      // 1. SEARCH (ScrapingDog) for phrase
      const searchRes = await fetch(
        `https://api.scrapingdog.com/youtube/search?api_key=${SCRAPING_DOG_API_KEY}&search_query=${encodeURIComponent(phraseData.phrase)}&country=us`
      );
      const searchJson = await searchRes.json();

      const videoResults = Array.isArray(searchJson.video_results) ? searchJson.video_results : [];

      const filtered = videoResults
        .filter((video: ScrapingDogVideo) => {
          const t = (video.title || '').toLowerCase();
          return t.includes(phraseData.company.toLowerCase()) || t.includes(phraseData.founder.toLowerCase());
        })
        .slice(0, 20);

      const searchVideos: VideoCard[] = filtered.map((video: ScrapingDogVideo) => ({
        id: extractVideoId(video.link || ''),
        title: video.title || '',
        thumbnail: typeof video.thumbnail === 'string' ? video.thumbnail : video.thumbnail?.static || video.thumbnail?.rich || '',
        publishedAt: video.published_date || '',
        views: video.views || '',
        duration: video.length || ''
      }));

      // Use ScrapingDog results only; avoid any Google/YouTube API calls
      setVideos(searchVideos);
      return;
    } catch (err) {
      setError((err as Error).message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSuggestions = () => {
    setSuggestions(generateSuggestions());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Suggestions row */}
      <div className="flex items-center flex-wrap gap-2 mb-4 overflow-x-auto pb-2">
        {suggestions.map((s, idx) => (
          <Link
            key={idx}
            to={`/search?q=${encodeURIComponent(s.phrase)}`}
            className="bg-gray-700 hover:bg-red-600 text-gray-200 hover:text-white text-xs sm:text-sm px-3 py-1 rounded-full whitespace-nowrap transition-colors"
          >
            {s.phrase}
          </Link>
        ))}
        <button
          onClick={refreshSuggestions}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
          aria-label="Refresh suggestions"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center space-x-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-red-600" />
        <span>{headline}</span>
      </h1>
      <p className="text-gray-400 text-sm mb-4 sm:mb-6">Curated founder interview videos</p>

      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-md mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {videos.map((video) => (
            <Link key={video.id} to={`/watch/${video.id}`} className="video-card group">
              <div className="aspect-video bg-gray-800 mb-3 relative overflow-hidden rounded-lg">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {video.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs sm:text-sm px-2 py-1 rounded">
                    {video.duration}
                  </div>
                )}
              </div>
              <div className="px-2 sm:px-3 pb-3">
                <h3 className="text-white font-semibold line-clamp-2 mb-1 group-hover:text-red-400 transition-colors text-sm sm:text-base">
                  {video.title}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">{video.publishedAt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 
