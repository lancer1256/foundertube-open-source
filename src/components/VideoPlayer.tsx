import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PlusIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface VideoDetails {
  id: string;
  title: string;
  description: string;
  channel: {
    name: string;
    id: string;
    thumbnail: string;
    subscribers: string;
  };
  views: string;
  likes: string;
  publishedAt: string;
}

const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;

export default function VideoPlayer() {
  const { videoId } = useParams<{ videoId: string }>();
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [backgroundPlay, setBackgroundPlay] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (videoId) {
      fetchVideoData(videoId);
    }
  }, [videoId]);

  const formatNumber = (num: string | number): string => {
    const n = typeof num === 'string' ? parseInt(num, 10) : num;
    if (isNaN(n)) return '';
    return Intl.NumberFormat('en', { notation: 'compact' }).format(n);
  };

  const fetchVideoData = async (id: string) => {
    if (!YT_API_KEY) return;
    try {
      // Fetch video details
      const videoRes = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet,statistics&key=${YT_API_KEY}`
      );
      const videoJson = await videoRes.json();
      const videoItem = videoJson.items?.[0];
      if (!videoItem) return;

      const channelId = videoItem.snippet.channelId;

      // Fetch channel details
      const channelRes = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=snippet,statistics&key=${YT_API_KEY}`
      );
      const channelJson = await channelRes.json();
      const channelItem = channelJson.items?.[0];

      setVideoDetails({
        id,
        title: videoItem.snippet.title,
        description: videoItem.snippet.description,
        channel: {
          name: videoItem.snippet.channelTitle,
          id: channelId,
          thumbnail: channelItem?.snippet?.thumbnails?.default?.url || 'https://via.placeholder.com/40x40',
          subscribers: channelItem ? formatNumber(channelItem.statistics.subscriberCount) : ''
        },
        views: formatNumber(videoItem.statistics.viewCount) + ' views',
        likes: formatNumber(videoItem.statistics.likeCount),
        publishedAt: new Date(videoItem.snippet.publishedAt).toLocaleDateString()
      });
    } catch (err) {
      console.error('Error fetching YouTube data:', err);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, you would control the YouTube player
  };

  const handleAddToPlaylist = () => {
    setShowAddToPlaylist(!showAddToPlaylist);
  };

  const enableBackgroundPlay = () => {
    setBackgroundPlay(true);
    // In a real implementation, you would create an audio-only stream
    // This is complex and might require additional APIs
  };

  // Enhanced YouTube embed parameters for signed-in users
  const getEmbedUrl = () => {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: '1',
      rel: '0', // Don't show related videos from other channels
      modestbranding: '1', // Minimal YouTube branding
      fs: '1', // Allow fullscreen
      cc_load_policy: '0', // Don't show captions by default
      iv_load_policy: '3', // Don't show video annotations
      playsinline: '1', // Play inline on mobile
      // These parameters help ensure the player respects the user's account state
      origin: window.location.origin,
      enablejsapi: '1' // Enable JavaScript API for better control
    });
    
    return `${baseUrl}?${params.toString()}`;
  };

  if (!videoId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-white">Video not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            {/* Enhanced YouTube Embed */}
            <iframe
              src={getEmbedUrl()}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>

          {/* Premium Status Indicator */}
          {isSignedIn && (
            <div className="mb-4 p-3 bg-green-900 border border-green-700 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <span className="text-green-100 text-xs sm:text-sm">
                  ✓ Signed in - YouTube Premium benefits active (no ads, background play)
                </span>
              </div>
            </div>
          )}

          {/* Video Info */}
          {videoDetails && (
            <div className="space-y-4">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                {videoDetails.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <img
                    src={videoDetails.channel.thumbnail}
                    alt={videoDetails.channel.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-semibold text-sm sm:text-base">{videoDetails.channel.name}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">{videoDetails.views} • {videoDetails.publishedAt}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleAddToPlaylist}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors text-sm"
                  >
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    <span className="text-white">Add to Playlist</span>
                  </button>

                  <button
                    onClick={enableBackgroundPlay}
                    className={`px-3 sm:px-4 py-2 rounded-md transition-colors text-sm ${
                      backgroundPlay
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    Background Play
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                  {videoDetails.description}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Related Videos Sidebar - Hidden on mobile, shown below video on mobile */}
        <div className="lg:col-span-1 order-last lg:order-none">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4 text-base sm:text-lg">Up Next</h3>
            <div className="space-y-4">
              {/* Note: In a real app, you'd fetch related videos from ScrapingDog API */}
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">
                  Related videos would appear here.<br />
                  Use the search to find more videos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Playlist Modal */}
      {showAddToPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Add to Playlist</h3>
            <div className="space-y-3 mb-4">
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-white">Watch Later</span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded" />
                <span className="text-white">Favorites</span>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setShowAddToPlaylist(false)}
                className="px-4 py-2 text-gray-400 hover:text-white order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddToPlaylist(false)}
                className="youtube-button order-1 sm:order-2"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Background Play Controls */}
      {backgroundPlay && (
        <div className="fixed bottom-4 right-4 bg-gray-800 p-3 sm:p-4 rounded-lg shadow-lg max-w-xs sm:max-w-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePlayPause}
              className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors flex-shrink-0"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              ) : (
                <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-sm font-medium truncate">
                {videoDetails?.title}
              </p>
              <p className="text-gray-400 text-xs truncate">
                {videoDetails?.channel.name}
              </p>
            </div>
            <button
              onClick={() => setBackgroundPlay(false)}
              className="text-gray-400 hover:text-white text-lg sm:text-xl flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
