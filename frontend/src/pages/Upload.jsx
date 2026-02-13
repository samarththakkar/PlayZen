
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { videoService } from '@/lib/api-services';
import MainLayout from '@/components/MainLayout';
import toast from 'react-hot-toast';
import { 
  Upload as UploadIcon, Video, Image as ImageIcon, FileText, Tag, Play, X
} from 'lucide-react';
import './Upload.css';

export default function Upload() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other'
  });
  
  const [uploadType, setUploadType] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleVideoChange = (file) => {
    const maxSize = uploadType === 'short' ? 50 * 1024 * 1024 : 100 * 1024 * 1024;
    const sizeLabel = uploadType === 'short' ? '50MB' : '100MB';
    
    if (file.size > maxSize) {
      toast.error(`${uploadType === 'short' ? 'Short' : 'Video'} must be less than ${sizeLabel}`);
      return;
    }
    setVideoFile(file);
  };

  const handleThumbnailChange = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Thumbnail must be less than 10MB');
      return;
    }
    setThumbnail(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!videoFile || !thumbnail) {
      toast.error('Please select video and thumbnail');
      return;
    }

    setIsUploading(true);
    
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('isShort', uploadType === 'short');
      data.append('videoFile', videoFile);
      data.append('thumbnail', thumbnail);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const response = await videoService.uploadVideo(data);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      toast.success(`${uploadType === 'short' ? 'Short' : 'Video'} uploaded successfully!`);
      
      setTimeout(() => {
        navigate(`/watch/${response.data._id}`);
      }, 1000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (isLoading || (!isAuthenticated)) {
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
        {!uploadType ? (
          <>
            <div className="upload-header">
              <h1 className="upload-title">Upload Content</h1>
              <p className="upload-subtitle">Choose what you want to upload</p>
            </div>
            
            <div className="upload-type-selection">
              <button 
                className="upload-type-card"
                onClick={() => setUploadType('video')}
              >
                <Video className="upload-type-icon" />
                <h3>Upload Video</h3>
                <p>Share long-form content</p>
              </button>
              
              <button 
                className="upload-type-card"
                onClick={() => setUploadType('short')}
              >
                <Play className="upload-type-icon" />
                <h3>Upload Short</h3>
                <p>Share vertical short videos</p>
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="upload-header">
              <h1 className="upload-title">Upload {uploadType === 'short' ? 'Short' : 'Video'}</h1>
              <p className="upload-subtitle">Share your content with the world</p>
              <button className="back-button" onClick={() => setUploadType(null)}>
                ← Change Type
              </button>
            </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {/* Video Upload */}
          <div className="form-group">
            <label className="form-label">
              <Video className="w-5 h-5" />
              Video File <span className="required-asterisk">*</span>
            </label>
            <div className={`file-upload-area ${videoFile ? 'has-file' : ''}`}>
              {!videoFile ? (
                <>
                  <UploadIcon className="upload-icon" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => e.target.files?.[0] && handleVideoChange(e.target.files[0])}
                    className="hidden-input"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="upload-button">
                    Choose {uploadType === 'short' ? 'Short' : 'Video'}
                  </label>
                  <p className="upload-hint">MP4, MOV, AVI • Max {uploadType === 'short' ? '50MB' : '100MB'}</p>
                </>
              ) : (
                <div className="file-info">
                  <Play className="w-4 h-4" />
                  <span>{videoFile.name}</span>
                  <span className="file-size">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                  <button type="button" onClick={() => setVideoFile(null)} className="remove-file">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="form-group">
            <label className="form-label">
              <ImageIcon className="w-5 h-5" />
              Thumbnail <span className="required-asterisk">*</span>
            </label>
            <div className={`file-upload-area ${thumbnail ? 'has-file' : ''}`}>
              {!thumbnail ? (
                <>
                  <ImageIcon className="upload-icon" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleThumbnailChange(e.target.files[0])}
                    className="hidden-input"
                    id="thumbnail-upload"
                  />
                  <label htmlFor="thumbnail-upload" className="upload-button">
                    Choose Thumbnail
                  </label>
                  <p className="upload-hint">JPEG, PNG • Max 10MB</p>
                </>
              ) : (
                <div className="thumbnail-preview">
                  <img src={URL.createObjectURL(thumbnail)} alt="Thumbnail" className="thumbnail-image" />
                  <button type="button" onClick={() => setThumbnail(null)} className="remove-file">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

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
              onChange={handleChange}
              placeholder="Enter video title"
              required
              className="form-input"
              maxLength={100}
            />
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
              placeholder="Tell viewers about your video"
              required
              className="form-textarea"
              rows={4}
            />
          </div>

          {/* Category */}
          <div className="form-group full-width">
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
              <option value="Music">Music</option>
              <option value="Gaming">Gaming</option>
              <option value="Education">Education</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="News">News</option>
              <option value="Technology">Technology</option>
              <option value="Travel">Travel</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="form-group full-width">
              <div className="upload-progress">
                <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="progress-info">
                <small>Uploading...</small>
                <small>{uploadProgress}%</small>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-actions">
            <button type="button" onClick={() => setUploadType(null)} className="btn-secondary" disabled={isUploading}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !videoFile || !thumbnail || !formData.title || !formData.description}
              className="btn-primary"
            >
              {isUploading ? 'Uploading...' : `Upload ${uploadType === 'short' ? 'Short' : 'Video'}`}
            </button>
          </div>
        </form>
          </>
        )}
      </div>
    </MainLayout>
  );
}
