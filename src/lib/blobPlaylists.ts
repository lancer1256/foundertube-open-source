const STORAGE_KEY = 'foundertube-playlists';

export interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  channel: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  videoCount: number;
  thumbnail: string;
  videos: PlaylistVideo[];
}

const read = (): Playlist[] => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? (JSON.parse(value) as Playlist[]) : [];
  } catch {
    return [];
  }
};

const write = (playlists: Playlist[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
};

export async function fetchPlaylists(): Promise<Playlist[]> {
  return read();
}

export async function upsertPlaylist(playlist: Playlist): Promise<void> {
  const playlists = read();
  const index = playlists.findIndex((candidate) => candidate.id === playlist.id);
  if (index === -1) playlists.push(playlist);
  else playlists[index] = playlist;
  write(playlists);
}

export async function deletePlaylist(id: string): Promise<void> {
  write(read().filter((playlist) => playlist.id !== id));
}
