import axiosInstance from "./axiosInstance";

/**
 * Normalize a raw song object from the API.
 */
function normalizeSong(raw) {
  return {
    id: raw.id,
    name: raw.name,
    albumId: raw.album_id || raw.albumId,
    duration: raw.duration,
    genre: raw.genre,
    artistIds: raw.artist_ids || raw.artistIds || (raw.artists ? raw.artists.map(a => a.id) : []),
    artists: raw.artists || [],
    album: raw.album || null,
    audioUrl: raw.audio_url || raw.audioUrl || "",
  };
}

export async function fetchSongs() {
  const { data } = await axiosInstance.get("/songs");
  let raw = [];
  if (Array.isArray(data)) {
    raw = data;
  } else if (data && Array.isArray(data.songs)) {
    raw = data.songs;
  } else if (data && Array.isArray(data.data)) {
    raw = data.data;
  }
  return raw.map(normalizeSong);
}

/**
 * Upload multiple songs. Uses FormData for multipart/form-data.
 * Expected payload: Array of objects { file, name, albumId, duration, genre, artistIds }
 */
export async function uploadSongs(songs, onProgress) {
  const formData = new FormData();
  
  songs.forEach((song, index) => {
    formData.append(`songs[${index}][file]`, song.file);
    formData.append(`songs[${index}][name]`, song.name);
    formData.append(`songs[${index}][album_id]`, song.albumId);
    if (song.duration) formData.append(`songs[${index}][duration]`, song.duration);
    if (song.genre) formData.append(`songs[${index}][genre]`, song.genre);
    
    // artistIds is an array
    if (song.artistIds && song.artistIds.length > 0) {
      song.artistIds.forEach(id => {
        formData.append(`songs[${index}][artist_ids][]`, id);
      });
    }
  });

  const { data } = await axiosInstance.post("/songs/bulk_create", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  let raw = [];
  if (Array.isArray(data)) raw = data;
  else if (data && Array.isArray(data.songs)) raw = data.songs;
  
  return raw.map(normalizeSong);
}

export async function updateSong(id, payload) {
  // If editing involves changing the audio file, we need FormData.
  // Assuming basic metadata edit here for PUT.
  const { data } = await axiosInstance.put(`/songs/${id}`, {
    name: payload.name,
    album_id: payload.albumId,
    duration: payload.duration,
    genre: payload.genre,
    artist_ids: payload.artistIds,
  });
  return normalizeSong(data);
}

export async function deleteSong(id) {
  await axiosInstance.delete(`/songs/${id}`);
}
