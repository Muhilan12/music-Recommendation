import React, { useState, useEffect } from 'react';
import { authAPI } from '../api';
import { useNavigate } from 'react-router-dom';
import './style/LoginRegister.css'; 

function LoginRegister() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsAnimating(true);

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        response = await authAPI.register(formData);
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Add success animation before navigation
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
      setIsAnimating(false);
      
      // Shake animation on error
      const form = document.querySelector('.auth-form');
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
    }
  };

  const toggleAuthMode = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setIsAnimating(false);
    }, 300);
  };

  if (showWelcome) {
    return (
      <div className="welcome-screen">
        <div className="welcome-content">
          <div className="music-icon">🎵</div>
          <h1 className="welcome-title">
            <span className="welcome-text">Welcome to</span>
            <span className="music-world">Music World</span>
          </h1>
          <div className="equalizer">
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {/* Animated Background Elements */}
      <div className="floating-music-note">♪</div>
      <div className="floating-music-note note-2">♫</div>
      <div className="floating-music-note note-3">♬</div>
      
      <div className={`auth-card ${isAnimating ? 'fade-in' : ''}`}>
        <div className="music-header">
          <div className="pulsing-icon">🎵</div>
          <h1 className="app-title">Mood Music</h1>
          <div className="subtitle">Feel the rhythm of your emotions</div>
        </div>

        <div className={`form-wrapper ${isLogin ? 'login-mode' : 'register-mode'}`}>
          <div className="form-header">
            <h2 className="form-title">
              <span className={`mode-text ${isLogin ? 'active' : ''}`}>Login</span>
              <span className="divider"> / </span>
              <span className={`mode-text ${!isLogin ? 'active' : ''}`}>Register</span>
            </h2>
            <div className="mode-indicator">
              <div className={`slider ${isLogin ? 'left' : 'right'}`}></div>
            </div>
          </div>

          {error && (
            <div className="error-message slide-in">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group floating-label">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="form-input"
              />
              <label className={`${formData.username ? 'active' : ''}`}>
                <span className="input-icon"></span>
                Username
              </label>
              <div className="underline"></div>
            </div>

            {!isLogin && (
              <div className="form-group floating-label slide-down">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <label className={`${formData.email ? 'active' : ''}`}>
                  <span className="input-icon"></span>
                  Email
                </label>
                <div className="underline"></div>
              </div>
            )}

            <div className="form-group floating-label">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
              <label className={`${formData.password ? 'active' : ''}`}>
                <span className="input-icon"></span>
                Password
              </label>
              <div className="underline"></div>
            </div>

            <button 
              type="submit" 
              className={`btn-submit ${isAnimating ? 'loading' : ''}`}
              disabled={isAnimating}
            >
              <span className="btn-text">
                {isLogin ? 'Login' : 'Create Account'}
              </span>
              <span className="btn-icon">
                {isLogin ? '🎧' : '🎶'}
              </span>
              {isAnimating && <div className="spinner"></div>}
            </button>
          </form>

          <div className="auth-footer">
            <p className="toggle-text">
              {isLogin ? "New to Mood Music?" : "Already have an account?"}
            </p>
            <button 
              onClick={toggleAuthMode} 
              className="toggle-btn"
            >
              {isLogin ? 'Join Now 🎵' : 'Sign In 🎧'}
              <span className="toggle-underline"></span>
            </button>
            
            
          </div>
        </div>
      </div>
      
      {/* Background visualizer */}
      <div className="visualizer">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="bar" 
            style={{ animationDelay: `${i * 0.05}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default LoginRegister;