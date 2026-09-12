import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  views: string;
  channel: {
    name: string;
    id: string;
    thumbnail: string;
  };
  publishedAt: string;
}

interface ScrapingDogVideo {
  link?: string;
  title?: string;
  description?: string;
  thumbnail?: string | { static?: string; rich?: string };
  length?: string;
  views?: string;
  channel?: { name?: string; link?: string; thumbmail?: string; thumbnail?: string };
  published_date?: string;
}

const SCRAPING_DOG_API_KEY = import.meta.env.VITE_SCRAPINGDOG_API_KEY as string | undefined;

export default function SearchPage() {
  const [searchParams] = useSearchParams();

  // Initialise state from URL params so date filtering is applied up-front
  const initialAfter = searchParams.get('after') || '';
  const initialBefore = searchParams.get('before') || '';
  const initialQuery = searchParams.get('q') || '';

  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [afterDate, setAfterDate] = useState<string>(initialAfter);
  const [beforeDate, setBeforeDate] = useState<string>(initialBefore);
  const initialDuration = searchParams.get('dur') || '';
  const [durationFilter, setDurationFilter] = useState<string>(initialDuration);
  const requestIdRef = useRef(0);

  // Utility to compute YYYY-MM-DD for N years ago
  const dateYearsAgo = (years: number): string => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - years);
    // format to yyyy-mm-dd
    return d.toISOString().slice(0, 10);
  };

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const after = searchParams.get('after') || '';
    const before = searchParams.get('before') || '';
    const dur = searchParams.get('dur') || '';

    setSearchQuery(q);
    setAfterDate(after);
    setBeforeDate(before);
    setDurationFilter(dur);

    if (q) {
      searchVideos(q, after, before);
    }
  }, [searchParams]);

  const extractVideoId = (youtubeUrl: string): string => {
    const match = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : '';
  };

  // Extract YouTube channel identifier / handle from a variety of URL formats returned by ScrapingDog
  const extractChannelId = (channelUrl: string): string => {
    if (!channelUrl) return '';

    // 1. Standard channel ID  -> youtube.com/channel/UCxxxxxxxxx
    let match = channelUrl.match(/\/channel\/([^/?]+)/);
    if (match) return match[1];

    // 2. Handle style URL      -> youtube.com/@handle
    match = channelUrl.match(/\/@([^/?]+)/);
    if (match) return '@' + match[1];

    // 3. Custom URL            -> youtube.com/c/CustomName
    match = channelUrl.match(/\/c\/([^/?]+)/);
    if (match) return match[1];

    return '';
  };

  const searchVideos = async (searchTerm: string, after: string = afterDate, before: string = beforeDate) => {
    requestIdRef.current += 1;
    setVideos([]);
    const currentId = requestIdRef.current;
    setLoading(true);
    setError(null);
    if (!SCRAPING_DOG_API_KEY) {
      setError('Add VITE_SCRAPINGDOG_API_KEY to enable live search.');
      setLoading(false);
      return;
    }
    
    try {
      // Map duration filter to ScrapingDog sp token
      const spParam = durationFilter === '4-20'
        ? 'EgIYAw%253D%253D'
        : durationFilter === '20+'
          ? 'EgIYAg%253D%253D'
          : '';
      const dateFilters = `${after ? ' after:' + after : ''}${before ? ' before:' + before : ''}`;
      const effectiveQuery = `${searchTerm}${dateFilters}`.trim();
      const response = await fetch(
        `https://api.scrapingdog.com/youtube/search?api_key=${SCRAPING_DOG_API_KEY}&search_query=${encodeURIComponent(effectiveQuery)}&country=us&language=&sp=${spParam}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the ScrapingDog response to our Video interface
      const transformedVideos = (Array.isArray(data.video_results) ? data.video_results : []).map((video: ScrapingDogVideo) => ({
        id: extractVideoId(video.link || ''),
        title: video.title,
        description: video.description || '',
        // Prioritise static thumbnail, fall back to rich or the root-level string if provided
        thumbnail: typeof video.thumbnail === 'string' ? video.thumbnail : video.thumbnail?.static || video.thumbnail?.rich || '',
        duration: video.length || '',
        views: video.views || '',
        channel: {
          name: video.channel?.name || '',
          id: extractChannelId(video.channel?.link || ''),
          // API uses a typo "thumbmail" – add fallback to correctly-spelled property in case they fix it in future
          thumbnail: video.channel?.thumbmail || video.channel?.thumbnail || ''
        },
        publishedAt: video.published_date || ''
      }));
      
      if (currentId === requestIdRef.current) {
        setVideos(transformedVideos);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      console.error('Search error:', err);
    } finally {
      if (currentId === requestIdRef.current) setLoading(false);
    }
  };

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchVideos(searchQuery.trim());
    }
  };

  // helper to decide if we have any video results yet
  const emptyState = (
    <div className="text-center py-12">
      <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h2 className="mt-4 text-lg font-semibold text-white">Search for videos</h2>
      <p className="mt-2 text-gray-400 text-sm px-4">Use the search bar above and/or set date filters.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Search Results Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-2">
          {searchQuery && `Search results for "${searchQuery}"`}
        </h1>
        
        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
          <div className="flex items-center gap-1">
            <label className="text-gray-300">After</label>
            <input
              type="date"
              value={afterDate}
              onChange={(e)=>setAfterDate(e.target.value)}
              className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-300">Before</label>
            <input
              type="date"
              value={beforeDate}
              onChange={(e)=>setBeforeDate(e.target.value)}
              className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none"
            />
            {/* Quick presets */}
            <select
              value=""
              onChange={(e)=>{
                const yrs = parseInt(e.target.value,10);
                if(yrs) setBeforeDate(dateYearsAgo(yrs));
              }}
              className="bg-gray-700 text-white text-xs rounded px-1 py-1 focus:outline-none"
            >
              <option value="" disabled>Preset</option>
              <option value="5">&lt; 5y</option>
              <option value="10">&lt; 10y</option>
              <option value="15">&lt; 15y</option>
            </select>
          </div>
          <button
            onClick={()=>{searchVideos(searchQuery.trim());}}
            className="youtube-button px-3 py-1 text-xs"
          >Apply</button>
        </div>

        {/* Duration Filter */}
        <div className="flex items-center gap-2 mb-4 text-sm">
          <label className="text-gray-300">Duration</label>
          <select
            value={durationFilter}
            onChange={(e)=>setDurationFilter(e.target.value)}
            className="bg-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none"
          >
            <option value="">Any</option>
            <option value="4-20">4–20 min</option>
            <option value="20+">Over 20 min</option>
          </select>
        </div>

        {/* Additional Search Bar - Hidden on Mobile (already in navbar) */}
        <div className="max-w-2xl hidden sm:block">
          <form onSubmit={handleLocalSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="youtube-input pr-12"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-700 rounded-md"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </button>
          </form>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-md mb-6">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Video Results */}
      {!loading && !error && videos.length>0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {videos.map((video) => (
            <Link
              key={video.id}
              to={`/watch/${video.id}`}
              className="video-card group"
            >
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
                <h3 className="text-white font-semibold line-clamp-2 mb-2 group-hover:text-red-400 transition-colors text-sm sm:text-base">
                  {video.title}
                </h3>
                
                <div className="flex items-center space-x-2 mb-2">
                  {video.channel.thumbnail && (
                    <img
                      src={video.channel.thumbnail}
                      alt={video.channel.name}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                    />
                  )}
                  <span className="text-gray-400 text-xs sm:text-sm truncate">{video.channel.name}</span>
                </div>
                
                <div className="text-gray-400 text-xs sm:text-sm space-y-1">
                  {video.views && <p className="truncate">{video.views}</p>}
                  {video.publishedAt && <p className="truncate">{video.publishedAt}</p>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && videos.length === 0 && emptyState}
    </div>
  );
} 
