import React, { useState, useEffect, useRef } from 'react';
import { songAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import './style/Recommendations.css';

function Recommendations() {
  const [selectedMood, setSelectedMood] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [shuffleActive, setShuffleActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const moods = [
    { value: 'happy', label: 'Happy', emoji: '😊', color: '#FFD166', gradient: 'linear-gradient(135deg, #FFD166, #FF9E6D)', description: 'Upbeat and cheerful tunes to brighten your day' },
    { value: 'sad', label: 'Melancholy', emoji: '😢', color: '#6C5CE7', gradient: 'linear-gradient(135deg, #6C5CE7, #A29BFE)', description: 'Emotional and thoughtful melodies for reflection' },
    { value: 'energetic', label: 'Energetic', emoji: '⚡', color: '#EF476F', gradient: 'linear-gradient(135deg, #EF476F, #FF9E6D)', description: 'High-energy tracks to get you moving' },
    { value: 'relaxed', label: 'Relaxed', emoji: '😌', color: '#06D6A0', gradient: 'linear-gradient(135deg, #06D6A0, #83E377)', description: 'Calm and peaceful sounds for relaxation' },
    { value: 'romantic', label: 'Romantic', emoji: '💖', color: '#FF6B6B', gradient: 'linear-gradient(135deg, #FF6B6B, #FD79A8)', description: 'Love songs and heartfelt ballads' },
    { value: 'angry', label: 'Intense', emoji: '😠', color: '#FF9E6D', gradient: 'linear-gradient(135deg, #FF9E6D, #EF476F)', description: 'Powerful rhythms for release' },
    { value: 'focused', label: 'Focused', emoji: '🎯', color: '#118AB2', gradient: 'linear-gradient(135deg, #118AB2, #4ECDC4)', description: 'Concentration-enhancing music' },
    { value: 'nostalgic', label: 'Nostalgic', emoji: '📻', color: '#9B5DE5', gradient: 'linear-gradient(135deg, #9B5DE5, #A78BFA)', description: 'Throwback tracks from the past' },
    { value: 'workout', label: 'Workout', emoji: '💪', color: '#4ECDC4', gradient: 'linear-gradient(135deg, #4ECDC4, #06D6A0)', description: 'Pump-up anthems for exercise' },
    { value: 'chill', label: 'Chill', emoji: '🌿', color: '#83E377', gradient: 'linear-gradient(135deg, #83E377, #06D6A0)', description: 'Lo-fi and ambient beats' },
    { value: 'party', label: 'Party', emoji: '🎉', color: '#FF8A5B', gradient: 'linear-gradient(135deg, #FF8A5B, #FFD166)', description: 'Dance tracks and club bangers' },
    { value: 'sleep', label: 'Sleep', emoji: '🌙', color: '#A78BFA', gradient: 'linear-gradient(135deg, #A78BFA, #6C5CE7)', description: 'Soothing sounds for relaxation' },
  ];

  const filters = [
    { id: 'popular', label: '🔥 Popular', icon: '🔥' },
    { id: 'new', label: '🆕 New', icon: '🆕' },
    { id: 'chill', label: '🌿 Chill', icon: '🌿' },
    { id: 'dance', label: '💃 Dance', icon: '💃' },
    { id: 'study', label: '📚 Study', icon: '📚' },
    { id: 'travel', label: '✈️ Travel', icon: '✈️' },
  ];

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

  useEffect(() => {
    if (currentPlaying) {
      const index = songs.findIndex(s => s.id === currentPlaying.id);
      setCurrentIndex(index);
    }
  }, [currentPlaying, songs]);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood.value);
    setLoading(true);
    
    // Animate mood selection
    const moodCard = document.querySelector(`[data-mood="${mood.value}"]`);
    if (moodCard) {
      moodCard.classList.add('selected-pulse');
      setTimeout(() => moodCard.classList.remove('selected-pulse'), 1000);
    }
    
    try {
      const response = await songAPI.getByMood(mood.value);
      const songsData = response.data;
      
      // Add animation delay to each song
      const animatedSongs = songsData.map((song, index) => ({
        ...song,
        animationDelay: `${index * 0.05}s`
      }));
      
      setSongs(animatedSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShuffle = async () => {
    if (!selectedMood) return;
    
    setShuffleActive(!shuffleActive);
    if (!shuffleActive) {
      // Visual feedback
      const shuffleBtn = document.querySelector('.btn-shuffle');
      if (shuffleBtn) {
        shuffleBtn.classList.add('shuffling');
        setTimeout(() => shuffleBtn.classList.remove('shuffling'), 500);
      }
      
      const shuffledSongs = [...songs].sort(() => Math.random() - 0.5);
      setSongs(shuffledSongs);
      
      // If currently playing, update its position
      if (currentPlaying) {
        const newIndex = shuffledSongs.findIndex(s => s.id === currentPlaying.id);
        setCurrentIndex(newIndex);
      }
    }
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      setCurrentPlaying(songs[0]);
      setIsPlaying(true);
      setCurrentIndex(0);
    }
  };

  const handleNext = () => {
    if (songs.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentPlaying(songs[nextIndex]);
    setCurrentIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (songs.length === 0) return;
    
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    setCurrentPlaying(songs[prevIndex]);
    setCurrentIndex(prevIndex);
    setIsPlaying(true);
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
  };

  const handleFilterToggle = (filterId) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const getCurrentMood = () => moods.find(m => m.value === selectedMood) || moods[0];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playSong = (song, index) => {
    setCurrentPlaying(song);
    setIsPlaying(true);
    setCurrentIndex(index);
    
    // Visual feedback
    const songCard = document.querySelector(`[data-song-id="${song.id}"]`);
    if (songCard) {
      songCard.classList.add('song-playing-pulse');
      setTimeout(() => songCard.classList.remove('song-playing-pulse'), 500);
    }
  };

  return (
    <div className="recommendations-container">
      {/* Animated Background */}
      <div className="recommendations-bg">
        <div className="floating-emojis">
          {['🎵', '🎶', '🎧', '🎼', '🎹', '🎤'].map((emoji, i) => (
            <div 
              key={i} 
              className="floating-emoji"
              style={{
                animationDelay: `${i * 0.5}s`,
                left: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 1.5 + 1}rem`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
        <div className="dynamic-wave" style={{ background: getCurrentMood().gradient }}></div>
      </div>

      {/* Header */}
      <header className="recommendations-header">
        <button 
          className="btn-back"
          onClick={() => navigate('/dashboard')}
        >
          <span className="back-icon">←</span>
          <span className="back-text">Back to Dashboard</span>
        </button>
        
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">
              <span className="title-text">Mood-Based</span>
              <span className="title-highlight">Recommendations</span>
            </h1>
            <p className="header-subtitle">Discover music that matches your current vibe</p>
          </div>
          
          <div className="stats-badge">
            <span className="stats-icon">🎯</span>
            <div className="stats-info">
              <span className="stats-number">{songs.length}</span>
              <span className="stats-label">Tracks</span>
            </div>
          </div>
        </div>
      </header>

      {/* Mood Selection */}
      <section className="mood-selection-section">
        <div className="section-header">
          <h2 className="section-title">
            <span className="title-icon">🎭</span>
            How are you feeling today?
          </h2>
          <p className="section-subtitle">Select a mood to generate personalized recommendations</p>
        </div>
        
        <div className="mood-grid">
          {moods.map((mood) => (
            <div
              key={mood.value}
              data-mood={mood.value}
              className={`mood-card ${selectedMood === mood.value ? 'selected' : ''}`}
              onClick={() => handleMoodSelect(mood)}
              style={{ '--mood-color': mood.color }}
            >
              <div className="card-glow"></div>
              <div className="card-content">
                <div className="mood-emoji-wrapper">
                  <span className="mood-emoji">{mood.emoji}</span>
                  {selectedMood === mood.value && (
                    <div className="selection-indicator">
                      <div className="pulse-ring"></div>
                      <div className="pulse-ring delay-1"></div>
                      <div className="checkmark">✓</div>
                    </div>
                  )}
                </div>
                <h3 className="mood-label">{mood.label}</h3>
                <p className="mood-description">{mood.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="filters-container">
          <div className="filters-header">
            <h3 className="filters-title">
              <span className="title-icon">🎛️</span>
              Refine Recommendations
            </h3>
          </div>
          <div className="filters-grid">
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`filter-btn ${activeFilters.includes(filter.id) ? 'active' : ''}`}
                onClick={() => handleFilterToggle(filter.id)}
              >
                <span className="filter-icon">{filter.icon}</span>
                <span className="filter-label">{filter.label}</span>
                {activeFilters.includes(filter.id) && (
                  <span className="filter-badge">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recommendations Content */}
      {selectedMood && (
        <section className="recommendations-content">
          <div className="playlist-header">
            <div className="playlist-info">
              <div className="mood-display" style={{ background: getCurrentMood().gradient }}>
                <span className="mood-icon">{getCurrentMood().emoji}</span>
                <div className="mood-text">
                  <h2 className="playlist-title">{getCurrentMood().label} Playlist</h2>
                  <p className="playlist-subtitle">{songs.length} tracks • {getCurrentMood().description}</p>
                </div>
              </div>
            </div>
            
            <div className="playlist-controls">
              <button 
                className={`btn-shuffle ${shuffleActive ? 'active' : ''}`}
                onClick={handleShuffle}
              >
                <span className="shuffle-icon">🔀</span>
                <span className="shuffle-text">{shuffleActive ? 'Shuffled' : 'Shuffle'}</span>
              </button>
              
              <button 
                className="btn-play-all"
                onClick={handlePlayAll}
                disabled={songs.length === 0}
              >
                <span className="play-icon">▶️</span>
                <span className="play-text">Play All</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-songs">
              <div className="loading-wave">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="wave-bar"
                    style={{ 
                      animationDelay: `${i * 0.1}s`,
                      background: getCurrentMood().color 
                    }}
                  ></div>
                ))}
              </div>
              <p className="loading-text">Curating your perfect playlist...</p>
            </div>
          ) : songs.length === 0 ? (
            <div className="empty-recommendations">
              <div className="empty-illustration">
                <div className="music-note">🎵</div>
                <div className="music-note delay-1">🎶</div>
                <div className="music-note delay-2">🎧</div>
              </div>
              <h3 className="empty-title">No songs found for this mood</h3>
              <p className="empty-description">
                Try selecting a different mood or add songs to your library first
              </p>
            </div>
          ) : (
            <div className="songs-grid">
              {songs.map((song, index) => (
                <div
                  key={song.id}
                  data-song-id={song.id}
                  className={`song-card ${currentPlaying?.id === song.id ? 'playing' : ''}`}
                  style={{ animationDelay: song.animationDelay }}
                >
                  <div className="song-content">
                    <div className="song-number">
                      <span className="number">{index + 1}</span>
                      {currentPlaying?.id === song.id && (
                        <div className="now-playing-indicator">
                          <div className="equalizer">
                            <div className="bar"></div>
                            <div className="bar"></div>
                            <div className="bar"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="song-info">
                      <div className="song-title-wrapper">
                        <h4 className="song-title">{song.title}</h4>
                        {currentPlaying?.id === song.id && (
                          <span className="live-badge">LIVE</span>
                        )}
                      </div>
                      <p className="song-artist">{song.artist}</p>
                      <div className="song-meta">
                        <span className="meta-item">
                          <span className="meta-icon">🎵</span>
                          Mood: {song.mood || getCurrentMood().label}
                        </span>
                        <span className="meta-item">
                          <span className="meta-icon">⏱️</span>
                          3:45
                        </span>
                      </div>
                    </div>
                    
                    <div className="song-actions">
                      <button 
                        className={`play-song-btn ${currentPlaying?.id === song.id && isPlaying ? 'playing' : ''}`}
                        onClick={() => playSong(song, index)}
                      >
                        {currentPlaying?.id === song.id && isPlaying ? (
                          <span className="pause-icon">⏸️</span>
                        ) : (
                          <span className="play-icon">▶️</span>
                        )}
                      </button>
                      
                      <button className="add-to-playlist-btn" title="Add to playlist">
                        <span className="add-icon">+</span>
                      </button>
                      
                      <button className="like-btn" title="Like">
                        <span className="like-icon">❤️</span>
                      </button>
                    </div>
                  </div>
                  
                  <div 
                    className="song-progress"
                    style={{ '--progress-color': getCurrentMood().color }}
                  >
                    <div className="progress-fill"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Audio Player */}
      {currentPlaying && (
        <div className="audio-player-fixed">
          <div className="player-container">
            <div className="player-now-playing">
              <div className="playing-cover" style={{ background: getCurrentMood().gradient }}>
                <span className="cover-emoji">{getCurrentMood().emoji}</span>
              </div>
              <div className="playing-info">
                <h4 className="playing-title">{currentPlaying.title}</h4>
                <p className="playing-artist">{currentPlaying.artist}</p>
                <div className="playing-mood">
                  <span className="mood-tag" style={{ background: getCurrentMood().color }}>
                    {getCurrentMood().label}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="player-controls">
              <button className="control-btn prev-btn" onClick={handlePrev} title="Previous">
                ⏮️
              </button>
              
              <button 
                className="control-btn play-pause-btn"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              
              <button className="control-btn next-btn" onClick={handleNext} title="Next">
                ⏭️
              </button>
            </div>
            
            <div className="player-progress">
              <div className="progress-bar" onClick={handleSeek}>
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${progress}%`,
                    background: getCurrentMood().gradient 
                  }}
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
                  {audioRef.current ? formatTime(audioRef.current.duration) : '3:45'}
                </span>
              </div>
            </div>
            
            <div className="player-extras">
              <div className="volume-control">
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
              </div>
              
              <div className="queue-info">
                <span className="queue-text">
                  {currentIndex + 1} / {songs.length}
                </span>
              </div>
            </div>
          </div>
          
          <audio
            ref={audioRef}
            src={currentPlaying.audio_file}
            onTimeUpdate={handleProgress}
            onEnded={handleNext}
          />
        </div>
      )}
    </div>
  );
}

export default Recommendations;