import React, { useState, useEffect } from 'react';
import { folderAPI, authAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import './style/Dashboard.css';

function Dashboard() {
  const [folders, setFolders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newFolder, setNewFolder] = useState({
    name: '',
    mood: 'happy',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [hoveredFolder, setHoveredFolder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUser();
    loadFolders();
  }, []);

  const loadUser = () => {
    // In a real app, get user from auth context or localStorage
    const userData = {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      initials: 'AJ'
    };
    setUser(userData);
  };

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await folderAPI.getAll();
      setFolders(response.data);
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    try {
      await folderAPI.create(newFolder);
      setShowModal(false);
      setNewFolder({ name: '', mood: 'happy', description: '' });
      loadFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleDeleteFolder = async (id) => {
    if (window.confirm('Are you sure you want to delete this folder?')) {
      try {
        const folderCard = document.querySelector(`[data-folder-id="${id}"]`);
        if (folderCard) {
          folderCard.style.opacity = '0';
          folderCard.style.transform = 'scale(0.9)';
        }
        
        setTimeout(async () => {
          await folderAPI.delete(id);
          loadFolders();
        }, 300);
      } catch (error) {
        console.error('Error deleting folder:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
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

  const getMoodDescription = (mood) => {
    const descriptions = {
      happy: 'Upbeat and cheerful tunes',
      sad: 'Melancholic and emotional melodies',
      energetic: 'High-energy tracks for movement',
      relaxed: 'Calm and peaceful sounds',
      romantic: 'Love songs and heartfelt ballads',
      angry: 'Intense and powerful rhythms',
      focused: 'Concentration-enhancing beats',
      nostalgic: 'Throwback classics',
      workout: 'Pump-up exercise anthems',
      chill: 'Laid-back vibes',
      party: 'Dance floor essentials',
      sleep: 'Soothing bedtime sounds',
    };
    return descriptions[mood] || 'Your personal music collection';
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.mood.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openFolder = (id) => {
    const folderCard = document.querySelector(`[data-folder-id="${id}"]`);
    if (folderCard) {
      folderCard.style.transform = 'scale(0.95)';
      folderCard.style.opacity = '0.5';
      setTimeout(() => {
        navigate(`/folder/${id}`);
      }, 300);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Animated Background */}
      <div className="dashboard-bg">
        <div className="floating-shapes">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="floating-shape"
              style={{
                animationDelay: `${i * 0.5}s`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              {['🎵', '🎶', '🎧', '🎤', '🎷', '🎸', '🥁', '🎹', '🎺', '🎻'][i % 10]}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-wrapper">
              <div className="logo-pulse">🎵</div>
            </div>
            <div className="dashboard-title">
              <div className="title-main">
                <span className="title-gradient">Mood</span>
                <span className="title-gradient">Music</span>
              </div>
              <div className="title-sub">Dashboard</div>
            </div>
          </div>
          
          <div className="header-controls">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search folders by name, mood, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="user-actions">
              <button 
                className="btn btn-recommend"
                onClick={() => navigate('/recommendations')}
              >
                <span className="btn-icon">✨</span>
                <span className="btn-text">Recommendations</span>
              </button>
              <button 
                className="btn btn-new-folder"
                onClick={() => setShowModal(true)}
              >
                <span className="btn-icon">+</span>
                <span className="btn-text">New Folder</span>
              </button>
              
              {user && (
                <div className={`user-profile profile-dropdown ${showDropdown ? 'active' : ''}`}>
                  <div 
                    className="profile-info"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                   
                  </div>
                  
                  <div className="dropdown-menu">
                    <a href="/profile" className="dropdown-item">
                      <span className="dropdown-icon">👤</span>
                      <span>Profile Settings</span>
                    </a>
                    <a href="/subscription" className="dropdown-item">
                      <span className="dropdown-icon">⭐</span>
                      <span>Upgrade Plan</span>
                    </a>
                    <a href="/help" className="dropdown-item">
                      <span className="dropdown-icon">❓</span>
                      <span>Help & Support</span>
                    </a>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-icon">🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {loading ? (
          <div className="loading-container">
            <div className="loader">
              <div className="loader-bar"></div>
              <div className="loader-bar"></div>
              <div className="loader-bar"></div>
              <div className="loader-bar"></div>
              <div className="loader-bar"></div>
            </div>
            <p className="loading-text">Loading your music moods...</p>
          </div>
        ) : (
          <>
            <div className="stats-header">
              <div className="stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-info">
                  <span className="stat-number">{folders.length}</span>
                  <span className="stat-label">Total Folders</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎶</div>
                <div className="stat-info">
                  <span className="stat-number">
                    {folders.reduce((acc, folder) => acc + (folder.song_count || 0), 0)}
                  </span>
                  <span className="stat-label">Total Songs</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">😊</div>
                <div className="stat-info">
                  <span className="stat-number">
                    {[...new Set(folders.map(f => f.mood))].length}
                  </span>
                  <span className="stat-label">Unique Moods</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏱️</div>
                <div className="stat-info">
                  <span className="stat-number">
                    {folders.length > 0 
                      ? Math.floor(folders.reduce((acc, folder) => acc + (folder.song_count || 0), 0) / 60) 
                      : 0}
                  </span>
                  <span className="stat-label">Hours of Music</span>
                </div>
              </div>
            </div>

            <div className="section-header">
              <h2 className="section-title">Your Mood Folders</h2>
              <p className="section-subtitle">Organize your music by how it makes you feel</p>
            </div>

            {filteredFolders.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎵</div>
                <h3 className="empty-title">No folders found</h3>
                <p className="empty-description">
                  {searchTerm 
                    ? `No folders match "${searchTerm}"` 
                    : 'Create your first mood folder to organize your music by emotion'}
                </p>
                <button 
                  className="btn btn-new-folder empty-btn"
                  onClick={() => setShowModal(true)}
                >
                  <span className="btn-icon">+</span>
                  <span>Create Your First Folder</span>
                </button>
              </div>
            ) : (
              <div className="folders-grid">
                {filteredFolders.map((folder) => (
                  <div
                    key={folder.id}
                    data-folder-id={folder.id}
                    className="folder-card"
                    onMouseEnter={() => setHoveredFolder(folder.id)}
                    onMouseLeave={() => setHoveredFolder(null)}
                    style={{
                      '--mood-color': getMoodColor(folder.mood),
                      '--mood-color-light': getMoodColor(folder.mood) + '40'
                    }}
                  >
                    <div className="card-glow"></div>
                    
                    <div className="card-header">
                      <div 
                        className="mood-badge"
                        style={{ 
                          backgroundColor: getMoodColor(folder.mood) + '40',
                          borderColor: getMoodColor(folder.mood) + '60'
                        }}
                      >
                        <span className="mood-emoji">{getMoodEmoji(folder.mood)}</span>
                        <span className="mood-text">{folder.mood.charAt(0).toUpperCase() + folder.mood.slice(1)}</span>
                      </div>
                      <div className="card-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Implement edit functionality
                            navigate(`/folder/${folder.id}/edit`);
                          }}
                          title="Edit folder"
                        >
                          
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          title="Delete folder"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="card-body">
                      <h3 className="folder-name">{folder.name}</h3>
                      <p className="folder-description">
                        {folder.description || getMoodDescription(folder.mood)}
                      </p>
                      
                      <div className="folder-stats">
                        <div className="stat">
                          <span className="stat-icon">🎵</span>
                          <span className="stat-value">{folder.song_count || 0}</span>
                          <span className="stat-label">songs</span>
                        </div>
                        <div className="stat">
                          <span className="stat-icon">🕒</span>
                          <span className="stat-value">
                            {new Date(folder.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <button 
                        className="btn-open"
                        onClick={() => openFolder(folder.id)}
                      >
                        <span>Open Folder</span>
                        <span className="arrow">→</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {folders.length > 0 && (
              <div className="quick-actions">
                <button 
                  className="btn btn-new-folder"
                  onClick={() => setShowModal(true)}
                >
                  <span className="btn-icon">+</span>
                  <span>Add Another Folder</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Folder Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div 
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title">Create New Mood Folder</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateFolder}>
                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📁</span>
                    Folder Name
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={newFolder.name}
                    onChange={(e) =>
                      setNewFolder({ ...newFolder, name: e.target.value })
                    }
                    placeholder="e.g., Morning Energy Boost"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">😊</span>
                    Select Mood
                  </label>
                  <div className="mood-grid">
                    {['happy', 'sad', 'energetic', 'relaxed', 'romantic', 'angry'].map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        className={`mood-option ${newFolder.mood === mood ? 'selected' : ''}`}
                        onClick={() => setNewFolder({ ...newFolder, mood })}
                        style={{ 
                          backgroundColor: getMoodColor(mood) + '20',
                          borderColor: newFolder.mood === mood ? getMoodColor(mood) : 'transparent'
                        }}
                      >
                        <span className="mood-emoji">{getMoodEmoji(mood)}</span>
                        <span className="mood-name">{mood}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <span className="label-icon">📝</span>
                    Description (Optional)
                  </label>
                  <textarea
                    className="form-textarea"
                    value={newFolder.description}
                    onChange={(e) =>
                      setNewFolder({ ...newFolder, description: e.target.value })
                    }
                    placeholder="Describe the type of music that belongs in this folder..."
                    rows="3"
                  />
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
                    className="btn-create"
                  >
                    <span className="btn-icon">+</span>
                    Create Mood Folder
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

export default Dashboard;