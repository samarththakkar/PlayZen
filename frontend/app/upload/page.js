'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { videoService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import toast from 'react-hot-toast';
import { 
  Upload, Video, Image as ImageIcon, FileText, Tag, Play, Clock, 
  Eye, MessageSquare, Calendar, Globe, Lock, Users, Hash,
  CheckCircle, AlertCircle, Info, X, Save, Wand2, Crop,
  RotateCcw, Settings, HelpCircle
} from 'lucide-react';
import './upload.css';

export default function UploadPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const autoSaveRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    tags: [],
    visibility: 'public',
    ageRestriction: false,
    commentsEnabled: true,
    scheduledDate: '',
    language: 'en',
    license: 'standard'
  });
  
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [generatedThumbnails, setGeneratedThumbnails] = useState([]);
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(-1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [dragOver, setDragOver] = useState({ video: false, thumbnail: false });
  const [currentStep, setCurrentStep] = useState(1);
  const [isDraft, setIsDraft] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [estimatedTime, setEstimatedTime] = useState(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    
    autoSaveRef.current = setTimeout(() => {
      if (formData.title || formData.description) {
        localStorage.setItem('video-upload-draft', JSON.stringify(formData));
        setIsDraft(true);
      }
    }, 30000);

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('video-upload-draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setFormData(prev => ({ ...prev, ...parsedDraft }));
        setIsDraft(true);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  const validateFile = (file, type) => {
    const errors = {};
    
    if (type === 'video') {
      const validTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      
      if (!validTypes.includes(file.type)) {
        errors.video = 'Please upload a valid video file (MP4, MOV, AVI, WebM)';
      }
      if (file.size > maxSize) {
        errors.video = 'Video file must be less than 2GB';
      }
    } else if (type === 'thumbnail') {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        errors.thumbnail = 'Please upload a valid image file (JPEG, PNG, WebP)';
      }
      if (file.size > maxSize) {
        errors.thumbnail = 'Thumbnail must be less than 10MB';
      }
    }
    
    return errors;
  };

  const generateThumbnails = useCallback((video) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const thumbnails = [];
    
    const generateAtTime = (time) => {
      return new Promise((resolve) => {
        video.currentTime = time;
        video.onseeked = () => {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          canvas.toBlob(resolve, 'image/jpeg', 0.8);
        };
      });
    };

    const duration = video.duration;
    const times = [duration * 0.1, duration * 0.3, duration * 0.5, duration * 0.7, duration * 0.9];
    
    Promise.all(times.map(generateAtTime)).then((blobs) => {
      const thumbnailUrls = blobs.map(blob => URL.createObjectURL(blob));
      setGeneratedThumbnails(thumbnailUrls);
    });
  }, []);

  const handleVideoChange = (file) => {
    const errors = validateFile(file, 'video');
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error(errors.video);
      return;
    }
    
    setValidationErrors({});
    setVideoFile(file);
    setCurrentStep(2);
    
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    
    // Generate thumbnails
    const video = document.createElement('video');
    video.src = url;
    video.onloadedmetadata = () => {
      generateThumbnails(video);
    };
    
    // Estimate upload time
    const uploadSpeed = 1024 * 1024; // 1MB/s average
    const estimatedSeconds = file.size / uploadSpeed;
    setEstimatedTime(Math.ceil(estimatedSeconds / 60));
  };

  const handleThumbnailChange = (file) => {
    const errors = validateFile(file, 'thumbnail');
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error(errors.thumbnail);
      return;
    }
    
    setValidationErrors({});
    setThumbnail(file);
    setSelectedThumbnailIndex(-1);
  };

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [type]: true });
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [type]: false });
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver({ ...dragOver, [type]: false });
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (type === 'video') {
        handleVideoChange(files[0]);
      } else {
        handleThumbnailChange(files[0]);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagAdd = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim()) && formData.tags.length < 10) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const selectGeneratedThumbnail = (index) => {
    setSelectedThumbnailIndex(index);
    setThumbnail(null);
  };

  const saveDraft = () => {
    localStorage.setItem('video-upload-draft', JSON.stringify(formData));
    setIsDraft(true);
    toast.success('Draft saved successfully!');
  };

  const clearDraft = () => {
    localStorage.removeItem('video-upload-draft');
    setIsDraft(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }
    
    if (!thumbnail && selectedThumbnailIndex === -1) {
      toast.error('Please select or upload a thumbnail');
      return;
    }

    setIsUploading(true);
    setProcessingStatus('Preparing upload...');
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('tags', JSON.stringify(formData.tags));
      data.append('visibility', formData.visibility);
      data.append('ageRestriction', formData.ageRestriction);
      data.append('commentsEnabled', formData.commentsEnabled);
      data.append('language', formData.language);
      data.append('license', formData.license);
      data.append('videoFile', videoFile);
      
      if (thumbnail) {
        data.append('thumbnail', thumbnail);
      } else if (selectedThumbnailIndex >= 0) {
        // Convert selected generated thumbnail to blob
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = generatedThumbnails[selectedThumbnailIndex];
        await new Promise(resolve => {
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(blob => {
              data.append('thumbnail', blob, 'generated-thumbnail.jpg');
              resolve();
            }, 'image/jpeg', 0.8);
          };
        });
      }

      setProcessingStatus('Uploading video...');
      
      // Simulate progress for demo
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const response = await videoService.uploadVideo(data);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setProcessingStatus('Processing complete!');
      
      clearDraft();
      toast.success('Video uploaded successfully!');
      
      setTimeout(() => {
        router.push(`/watch/${response.data._id}`);
      }, 1000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
      setProcessingStatus('Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (isLoading || (!isAuthenticated && typeof window !== 'undefined')) {
    return (
      <MainLayout>
        <div className="loading-container">
          <div className="loading-spinner-large"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="upload-container">
        {/* Header */}
        <div className="upload-header">
          <h1 className="upload-title">Upload Your Video</h1>
          <p className="upload-subtitle">Share your content with the world</p>
          
          {/* Progress Steps */}
          <div className="progress-steps">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <span>Upload Video</span>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <span>Choose Thumbnail</span>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <span>Add Details</span>
            </div>
          </div>
        </div>

        {/* Draft Notification */}
        {isDraft && (
          <div className="draft-notification">
            <Info className="w-4 h-4" />
            <span>You have unsaved changes</span>
            <button onClick={clearDraft} className="clear-draft">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Left Column - Media Upload */}
          <div className="upload-section">
            {/* Video Upload */}
            <div className="form-group">
              <label className="form-label">
                <Video className="w-5 h-5" />
                Video File <span className="required-asterisk">*</span>
                <div className="tooltip">
                  <HelpCircle className="w-4 h-4" />
                  <div className="tooltip-content">
                    Supported formats: MP4, MOV, AVI, WebM<br/>
                    Max size: 2GB<br/>
                    Recommended: 1080p, H.264 codec
                  </div>
                </div>
              </label>
              
              <div 
                className={`file-upload-area ${videoFile ? 'has-file' : ''} ${dragOver.video ? 'drag-over' : ''} ${validationErrors.video ? 'error' : ''}`}
                onDragOver={(e) => handleDragOver(e, 'video')}
                onDragLeave={(e) => handleDragLeave(e, 'video')}
                onDrop={(e) => handleDrop(e, 'video')}
              >
                {!videoFile ? (
                  <>
                    <Upload className="upload-icon" />
                    <input
                      type="file"
                      accept="video/mp4,video/mov,video/avi,video/webm"
                      onChange={(e) => e.target.files?.[0] && handleVideoChange(e.target.files[0])}
                      className="hidden-input"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="upload-button">
                      <Upload className="w-5 h-5" />
                      Choose Video File
                    </label>
                    <p className="upload-hint">
                      Drag and drop or click to select<br/>
                      <small>MP4, MOV, AVI, WebM • Max 2GB</small>
                    </p>
                  </>
                ) : (
                  <div className="video-preview-container">
                    <video 
                      ref={videoRef}
                      src={videoPreview} 
                      controls 
                      className="video-preview"
                    />
                    <div className="file-info">
                      <Play className="w-4 h-4" />
                      <span>{videoFile.name}</span>
                      <span className="file-size">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                        setGeneratedThumbnails([]);
                        setCurrentStep(1);
                      }}
                      className="remove-file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {validationErrors.video && (
                <div className="error-message">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.video}
                </div>
              )}
            </div>

            {/* Thumbnail Selection */}
            {videoFile && (
              <div className="form-group">
                <label className="form-label">
                  <ImageIcon className="w-5 h-5" />
                  Thumbnail <span className="required-asterisk">*</span>
                </label>
                
                {/* Generated Thumbnails */}
                {generatedThumbnails.length > 0 && (
                  <div className="thumbnail-options">
                    <h4>Auto-generated thumbnails</h4>
                    <div className="thumbnail-grid">
                      {generatedThumbnails.map((thumb, index) => (
                        <div 
                          key={index}
                          className={`thumbnail-option ${selectedThumbnailIndex === index ? 'selected' : ''}`}
                          onClick={() => selectGeneratedThumbnail(index)}
                        >
                          <img src={thumb} alt={`Thumbnail ${index + 1}`} />
                          {selectedThumbnailIndex === index && (
                            <CheckCircle className="selected-icon" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Custom Thumbnail Upload */}
                <div className="custom-thumbnail">
                  <h4>Or upload custom thumbnail</h4>
                  <div 
                    className={`file-upload-area small ${thumbnail ? 'has-file' : ''} ${dragOver.thumbnail ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, 'thumbnail')}
                    onDragLeave={(e) => handleDragLeave(e, 'thumbnail')}
                    onDrop={(e) => handleDrop(e, 'thumbnail')}
                  >
                    {!thumbnail ? (
                      <>
                        <ImageIcon className="upload-icon small" />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => e.target.files?.[0] && handleThumbnailChange(e.target.files[0])}
                          className="hidden-input"
                          id="thumbnail-upload"
                        />
                        <label htmlFor="thumbnail-upload" className="upload-button small">
                          <ImageIcon className="w-4 h-4" />
                          Upload Custom
                        </label>
                        <p className="upload-hint small">
                          1280x720 recommended • JPEG, PNG, WebP
                        </p>
                      </>
                    ) : (
                      <div className="thumbnail-preview">
                        <img src={URL.createObjectURL(thumbnail)} alt="Custom thumbnail" />
                        <button 
                          type="button" 
                          onClick={() => setThumbnail(null)}
                          className="remove-file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="upload-section">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">
                <FileText className="w-5 h-5" />
                Title <span className="required-asterisk">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => {
                  handleChange(e);
                  setCurrentStep(3);
                }}
                placeholder="Enter an engaging title for your video"
                required
                className="form-input"
                maxLength={100}
              />
              <div className="input-footer">
                <small className={`char-count ${formData.title.length > 90 ? 'warning' : ''}`}>
                  {formData.title.length}/100 characters
                </small>
                {formData.title.length > 90 && (
                  <small className="seo-tip">
                    <Wand2 className="w-3 h-3" />
                    Consider a shorter title for better visibility
                  </small>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                <FileText className="w-5 h-5" />
                Description <span className="required-asterisk">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell viewers about your video. What will they learn? What makes it interesting?"
                required
                className="form-textarea"
                maxLength={5000}
                rows={4}
              />
              <div className="input-footer">
                <small className={`char-count ${formData.description.length > 4500 ? 'warning' : ''}`}>
                  {formData.description.length}/5000 characters
                </small>
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">
                <Hash className="w-5 h-5" />
                Tags
              </label>
              <div className="tags-container">
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagAdd}
                  placeholder={formData.tags.length < 10 ? "Add tags (press Enter)" : "Maximum 10 tags"}
                  className="tag-input"
                  disabled={formData.tags.length >= 10}
                />
              </div>
              <small className="input-hint">
                Add up to 10 tags to help people find your video
              </small>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">
                <Tag className="w-5 h-5" />
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Music">🎵 Music</option>
                <option value="Gaming">🎮 Gaming</option>
                <option value="Education">📚 Education</option>
                <option value="Entertainment">🎭 Entertainment</option>
                <option value="Sports">⚽ Sports</option>
                <option value="News">📰 News & Politics</option>
                <option value="Technology">💻 Technology</option>
                <option value="Travel">✈️ Travel & Events</option>
                <option value="Lifestyle">🌟 Lifestyle</option>
                <option value="Other">📂 Other</option>
              </select>
            </div>

            {/* Visibility Settings */}
            <div className="form-group">
              <label className="form-label">
                <Eye className="w-5 h-5" />
                Visibility
              </label>
              <div className="visibility-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={formData.visibility === 'public'}
                    onChange={handleChange}
                  />
                  <Globe className="w-4 h-4" />
                  <div>
                    <strong>Public</strong>
                    <small>Anyone can search for and view</small>
                  </div>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="unlisted"
                    checked={formData.visibility === 'unlisted'}
                    onChange={handleChange}
                  />
                  <Users className="w-4 h-4" />
                  <div>
                    <strong>Unlisted</strong>
                    <small>Anyone with the link can view</small>
                  </div>
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={formData.visibility === 'private'}
                    onChange={handleChange}
                  />
                  <Lock className="w-4 h-4" />
                  <div>
                    <strong>Private</strong>
                    <small>Only you can view</small>
                  </div>
                </label>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="advanced-toggle"
            >
              <Settings className="w-4 h-4" />
              Advanced Settings
              <span className={`chevron ${showAdvanced ? 'open' : ''}`}>▼</span>
            </button>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="advanced-settings">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="commentsEnabled"
                      checked={formData.commentsEnabled}
                      onChange={handleChange}
                    />
                    <MessageSquare className="w-4 h-4" />
                    Allow comments
                  </label>
                </div>
                
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="ageRestriction"
                      checked={formData.ageRestriction}
                      onChange={handleChange}
                    />
                    <AlertCircle className="w-4 h-4" />
                    Age restriction (18+)
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Calendar className="w-5 h-5" />
                    Schedule Publication
                  </label>
                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    className="form-input"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="form-group">
                <label className="form-label">Upload Progress</label>
                <div className="upload-progress">
                  <div 
                    className="upload-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="progress-info">
                  <small>{processingStatus}</small>
                  <small>{uploadProgress.toFixed(0)}% complete</small>
                </div>
                {estimatedTime && uploadProgress < 100 && (
                  <small className="time-estimate">
                    <Clock className="w-3 h-3" />
                    Estimated time remaining: {Math.max(1, Math.ceil(estimatedTime * (100 - uploadProgress) / 100))} minutes
                  </small>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={saveDraft}
              className="btn-secondary"
              disabled={isUploading}
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !videoFile || (!thumbnail && selectedThumbnailIndex === -1) || !formData.title || !formData.description}
              className="btn-primary"
            >
              {isUploading && <div className="loading-spinner" />}
              {isUploading ? 'Publishing...' : formData.scheduledDate ? 'Schedule Video' : 'Publish Video'}
            </button>
          </div>
        </form>
        
        {/* Hidden canvas for thumbnail generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </MainLayout>
  );
}