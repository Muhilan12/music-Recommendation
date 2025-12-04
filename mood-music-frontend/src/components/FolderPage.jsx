import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { folderAPI, songAPI } from '../api';
import './style/FolderPage.css';

function FolderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [folder, setFolder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newSong, setNewSong] = useState({
    title: '',
    artist: '',
    audio_file: null,
  });
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const audioRef = useRef(null);

  useEffect(() => {
    loadFolder();
  }, [id]);

  useEffect(() => {
    if (audioRef.current && currentPlaying) {
      audioRef.current.volume = volume;
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentPlaying, isPlaying, volume]);

  const loadFolder = async () => {
    try {
      setLoading(true);
      const response = await folderAPI.getById(id);
      setFolder(response.data);
    } catch (error) {
      console.error('Error loading folder:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSong = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newSong.title);
    formData.append('artist', newSong.artist);
    formData.append('audio_file', newSong.audio_file);
    formData.append('folder', id);

    try {
      await songAPI.create(formData);
      setShowModal(false);
      setNewSong({ title: '', artist: '', audio_file: null });
      loadFolder();
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  const handleDeleteSong = async (songId) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      try {
        const songElement = document.querySelector(`[data-song-id="${songId}"]`);
        if (songElement) {
          songElement.classList.add('deleting');
        }
        
        setTimeout(async () => {
          await songAPI.delete(songId);
          loadFolder();
        }, 300);
      } catch (error) {
        console.error('Error deleting song:', error);
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSong({ ...newSong, audio_file: file });
      
      // Preview the audio file
      const audio = new Audio(URL.createObjectURL(file));
      audio.onloadedmetadata = () => {
        // File loaded successfully
      };
    }
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      energetic: '⚡',
      relaxed: '😌',
      romantic: '💖',
      angry: '😠',
      focused: '🎯',
      nostalgic: '📻',
      workout: '💪',
      chill: '🌿',
      party: '🎉',
      sleep: '🌙',
    };
    return emojis[mood] || '🎵';
  };

  const getMoodColor = (mood) => {
    const colors = {
      happy: '#FFD166',
      sad: '#6C5CE7',
      energetic: '#EF476F',
      relaxed: '#06D6A0',
      romantic: '#FF6B6B',
      angry: '#FF9E6D',
      focused: '#118AB2',
      nostalgic: '#9B5DE5',
      workout: '#4ECDC4',
      chill: '#83E377',
      party: '#FF8A5B',
      sleep: '#A78BFA',
    };
    return colors[mood] || '#6C5CE7';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = (song) => {
    if (currentPlaying?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlaying(song);
      setIsPlaying(true);
    }
  };

  const handleProgress = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const currentTime = audio.currentTime;
      const duration = audio.duration || 1;
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const rect = e.target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;
      const percentage = x / width;
      audio.currentTime = percentage * audio.duration;
      setProgress(percentage * 100);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const filteredSongs = folder?.songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const sortedSongs = [...filteredSongs].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'artist':
        return a.artist.localeCompare(b.artist);
      case 'recent':
        return new Date(b.created_at) - new Date(a.created_at);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="audio-wave">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
        <p className="loading-text">Loading your playlist...</p>
      </div>
    );
  }

  return (
    <div className="folder-page-container">
      {/* Animated Background */}
      <div className="folder-bg">
        <div className="animated-waves">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="wave"
              style={{
                animationDelay: `${i * 0.2}s`,
                left: `${Math.random() * 100}%`,
                background: getMoodColor(folder.mood) + '40',
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="folder-header">
        <div className="header-content">
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard')}
          >
            <span className="back-icon">←</span>
            <span className="back-text">Back to Dashboard</span>
          </button>
          
          <div className="folder-info">
            <div className="mood-badge" style={{ background: getMoodColor(folder.mood) }}>
              <span className="mood-emoji">{getMoodEmoji(folder.mood)}</span>
              <span className="mood-text">{folder.mood}</span>
            </div>
            <h1 className="folder-title">{folder.name}</h1>
            <p className="folder-description">{folder.description}</p>
            
            <div className="folder-stats">
              <div className="stat">
                <span className="stat-icon">🎵</span>
                <span className="stat-value">{folder.songs?.length || 0}</span>
                <span className="stat-label">Songs</span>
              </div>
              <div className="stat">
                <span className="stat-icon">📅</span>
                <span className="stat-value">
                  {new Date(folder.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button 
              className="btn-add-song"
              onClick={() => setShowModal(true)}
            >
              <span className="btn-icon">+</span>
              <span className="btn-text">Add Song</span>
            </button>
          </div>
        </div>
      </header>

      {/* Controls Bar */}
      

      {/* Songs List */}
      <main className="songs-container">
        {sortedSongs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎵</div>
            <h3 className="empty-title">No songs yet</h3>
            <p className="empty-description">
              {searchTerm ? 'No songs match your search' : 'Add your first song to start this playlist'}
            </p>
            <button 
              className="btn-add-first-song"
              onClick={() => setShowModal(true)}
            >
              + Add Your First Song
            </button>
          </div>
        ) : (
          <div className="songs-grid">
            {sortedSongs.map((song, index) => (
              <div
                key={song.id}
                data-song-id={song.id}
                className={`song-card ${currentPlaying?.id === song.id ? 'playing' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="song-card-content">
                  <div className="song-number">
                    <span className="number">{index + 1}</span>
                  </div>
                  
                  <div className="song-info">
                    <h3 className="song-title">{song.title}</h3>
                    <p className="song-artist">{song.artist}</p>
                    <div className="song-meta">
                      <span className="meta-item">
                        <span className="meta-icon">🎵</span>
                        MP3
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        {new Date(song.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="song-actions">
                    <button 
                      className={`play-btn ${currentPlaying?.id === song.id && isPlaying ? 'playing' : ''}`}
                      onClick={() => handlePlayPause(song)}
                    >
                      {currentPlaying?.id === song.id && isPlaying ? (
                        <span className="pause-icon">⏸️</span>
                      ) : (
                        <span className="play-icon">▶️</span>
                      )}
                    </button>
                    
                    <a 
                      href={song.audio_file} 
                      download
                      className="download-btn"
                      title="Download"
                    >
                      ⬇️
                    </a>
                    
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteSong(song.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                {currentPlaying?.id === song.id && (
                  <div className="now-playing-indicator">
                    <div className="playing-bars">
                      <div className="bar"></div>
                      <div className="bar"></div>
                      <div className="bar"></div>
                      <div className="bar"></div>
                    </div>
                    <span className="now-playing-text">Now Playing</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Audio Player */}
      {currentPlaying && (
        <div className="audio-player-container">
          <div className="audio-player">
            <div className="player-info">
              <div className="currently-playing">
                <div className="playing-icon">🎵</div>
                <div className="playing-details">
                  <h4 className="playing-title">{currentPlaying.title}</h4>
                  <p className="playing-artist">{currentPlaying.artist}</p>
                </div>
              </div>
              
              <div className="player-controls">
                <button 
                  className="control-btn prev-btn"
                  title="Previous"
                >
                  ⏮️
                </button>
                
                <button 
                  className="control-btn play-pause-btn"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? '⏸️' : '▶️'}
                </button>
                
                <button 
                  className="control-btn next-btn"
                  title="Next"
                >
                  ⏭️
                </button>
              </div>
              
              <div className="player-progress">
                <div className="progress-bar" onClick={handleSeek}>
                  <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  ></div>
                  <div 
                    className="progress-thumb"
                    style={{ left: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="time-display">
                  <span className="current-time">
                    {audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}
                  </span>
                  <span className="total-time">
                    {audioRef.current ? formatTime(audioRef.current.duration) : '0:00'}
                  </span>
                </div>
              </div>
              
              <div className="volume-controls">
                <span className="volume-icon">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                />
                <span className="volume-percent">{Math.round(volume * 100)}%</span>
              </div>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={currentPlaying.audio_file}
            onTimeUpdate={handleProgress}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentPlaying(null);
            }}
          />
        </div>
      )}

      {/* Add Song Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">Add New Song</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSong}>
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">🎵</span>
                    Song Title
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={newSong.title}
                    onChange={(e) =>
                      setNewSong({ ...newSong, title: e.target.value })
                    }
                    placeholder="Enter song title"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">👤</span>
                    Artist
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={newSong.artist}
                    onChange={(e) =>
                      setNewSong({ ...newSong, artist: e.target.value })
                    }
                    placeholder="Enter artist name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📁</span>
                    Audio File
                  </label>
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="audio-file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      className="file-input"
                      required
                    />
                    <label htmlFor="audio-file" className="file-label">
                      <span className="file-icon">🎧</span>
                      <span className="file-text">
                        {newSong.audio_file 
                          ? newSong.audio_file.name 
                          : 'Choose audio file (MP3, WAV, etc.)'}
                      </span>
                      <span className="file-browse">Browse</span>
                    </label>
                    {newSong.audio_file && (
                      <div className="file-preview">
                        <span className="preview-icon">✅</span>
                        <span className="preview-name">{newSong.audio_file.name}</span>
                        <span className="preview-size">
                          {(newSong.audio_file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-add"
                  >
                    <span className="btn-icon">+</span>
                    Add Song
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FolderPage;