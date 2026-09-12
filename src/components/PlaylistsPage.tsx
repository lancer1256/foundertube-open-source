import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { fetchPlaylists, upsertPlaylist, deletePlaylist as blobDeletePlaylist, Playlist as BlobPlaylist } from '../lib/blobPlaylists';

type Playlist = BlobPlaylist;

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    (async () => {
      let dbPlaylists = await fetchPlaylists();

      // Seed defaults if DB empty
      if (!dbPlaylists || dbPlaylists.length === 0) {
        dbPlaylists = [
          {
            id: 'watch-later',
            name: 'Watch Later',
            description: 'Videos to watch later',
            videoCount: 0,
            thumbnail: '',
            videos: []
          },
          {
            id: 'favorites',
            name: 'Favorites',
            description: 'Your favorite videos',
            videoCount: 0,
            thumbnail: '',
            videos: []
          }
        ];
        await Promise.all(dbPlaylists.map(p => upsertPlaylist(p)));
      }

      setPlaylists(dbPlaylists);
    })();
  }, []);

  const createPlaylist = async () => {
    if (newPlaylistName.trim()) {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name: newPlaylistName,
        description: newPlaylistDescription,
        videoCount: 0,
        thumbnail: '',
        videos: []
      };
      
      await upsertPlaylist(newPlaylist);
      setPlaylists((prev) => [...prev, newPlaylist]);
      
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateModal(false);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    await blobDeletePlaylist(playlistId);
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
  };

  const removeVideoFromPlaylist = async (playlistId: string, videoId: string) => {
    const target = playlists.find(p => p.id === playlistId);
    if (!target) return;

    const updatedPlaylist: Playlist = {
      ...target,
      videos: target.videos.filter(v => v.id !== videoId),
    };
    updatedPlaylist.videoCount = updatedPlaylist.videos.length;

    await upsertPlaylist(updatedPlaylist);

    setPlaylists(prev => prev.map(p => p.id === playlistId ? updatedPlaylist : p));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 space-y-4 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Playlists</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="youtube-button flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {playlists.map((playlist) => (
          <div key={playlist.id} className="video-card">
            <div 
              className="aspect-video bg-gray-800 mb-3 relative overflow-hidden cursor-pointer rounded-lg"
              onClick={() => setSelectedPlaylist(playlist)}
            >
              {playlist.thumbnail ? (
                <img
                  src={playlist.thumbnail}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-500" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs sm:text-sm px-2 py-1 rounded">
                {playlist.videoCount} videos
              </div>
            </div>
            
            <div className="px-2 sm:px-3 pb-3">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-white font-semibold line-clamp-2 text-sm sm:text-base flex-1">
                  {playlist.name}
                </h3>
                {playlist.id !== 'watch-later' && playlist.id !== 'favorites' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id);
                    }}
                    className="text-red-500 hover:text-red-400 ml-2 p-1 flex-shrink-0"
                  >
                    <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>
                )}
              </div>
              
              <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">
                {playlist.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-white font-semibold mb-4">Create New Playlist</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="youtube-input"
                  placeholder="Playlist name"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="youtube-input"
                  placeholder="Playlist description"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={createPlaylist}
                className="youtube-button order-1 sm:order-2"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Details Modal */}
      {selectedPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex-1 min-w-0 pr-4">
                <h3 className="text-white font-semibold text-lg sm:text-xl mb-2">{selectedPlaylist.name}</h3>
                <p className="text-gray-400 text-sm sm:text-base">{selectedPlaylist.description}</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1">{selectedPlaylist.videoCount} videos</p>
              </div>
              <button
                onClick={() => setSelectedPlaylist(null)}
                className="text-gray-400 hover:text-white text-xl sm:text-2xl flex-shrink-0"
              >
                ×
              </button>
            </div>

            {selectedPlaylist.videos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No videos in this playlist</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {selectedPlaylist.videos.map((video, index) => (
                  <div key={video.id} className="flex items-center space-x-3 sm:space-x-4 p-3 bg-gray-900 rounded-lg">
                    <div className="text-gray-400 text-xs sm:text-sm w-6 sm:w-8 flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="w-20 h-12 sm:w-32 sm:h-18 bg-gray-600 rounded flex-shrink-0 overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/watch/${video.id}`}
                        className="text-white font-medium hover:text-red-400 line-clamp-2 text-sm sm:text-base"
                      >
                        {video.title}
                      </Link>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1">{video.channel}</p>
                    </div>
                    <div className="text-gray-400 text-xs sm:text-sm flex-shrink-0 hidden sm:block">
                      {video.duration}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVideoFromPlaylist(selectedPlaylist.id, video.id);
                      }}
                      className="text-red-500 hover:text-red-400 p-1 flex-shrink-0"
                    >
                      <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 