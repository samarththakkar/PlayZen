import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Upload as UploadIcon, Image as ImageIcon, Video, Loader2, AlertCircle, X, Crop } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Upload.css';

// Helper function to initialize center crop
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
}

const Upload = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); 
  
  if (!user) {
      navigate('/login');
  }

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    isShort: 'false'
  });
  
  // Video States
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');
  
  // Thumbnail Cropping States
  const [thumbnailFile, setThumbnailFile] = useState(null); // The final Blob sent to server
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(''); 
  const [imgSrc, setImgSrc] = useState(''); // The raw Base64 image loaded into the cropper
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  
  const imgRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ----- VIDEO HANDLING ----- */
  const handleVideoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
      // Reset error if valid
      setError('');
    }
  };

  const removeVideo = () => {
      setVideoFile(null);
      setVideoPreviewUrl('');
  };

  /* ----- THUMBNAIL HANDLING ----- */
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
      reader.readAsDataURL(e.target.files[0])
      setIsCropping(true);
    }
  }

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget
    // Start with a 16:9 aspect ratio crop covering 90% of the image
    setCrop(centerAspectCrop(width, height, 16 / 9))
  }

  // Generate cropped preview
  const handleCropComplete = () => {
    if (!completedCrop || !imgRef.current) return;
    
    const image = imgRef.current;
    
    const scaledWidth = image.naturalWidth / image.width;
    const scaledHeight = image.naturalHeight / image.height;
    
    const cropX = completedCrop.x * scaledWidth;
    const cropY = completedCrop.y * scaledWidth;
    
    // Safety check for empty crops
    if (completedCrop.width === 0 || completedCrop.height === 0) {
       setIsCropping(false);
       setImgSrc('');
       return;
    }

    const cropWidth = completedCrop.width * scaledWidth;
    const cropHeight = completedCrop.height * scaledHeight;

    const canvas = document.createElement('canvas');
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    // Convert canvas to blob for form submission
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      // Give the blob a name so multer recognises it as an image file
      const croppedFile = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
      setThumbnailFile(croppedFile);
      setThumbnailPreviewUrl(URL.createObjectURL(blob));
      setIsCropping(false);
      setImgSrc('');
    }, 'image/jpeg', 0.95);
  };

  const cancelCrop = () => {
      setIsCropping(false);
      setImgSrc('');
  };

  const removeThumbnail = () => {
      setThumbnailFile(null);
      setThumbnailPreviewUrl('');
  }

  /* ----- SUBMISSION ----- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.description) {
      setError('Title and description are required.');
      return;
    }
    if (!videoFile) {
      setError('Please upload a video file.');
      return;
    }
    if (!thumbnailFile) {
      setError('Please upload and crop a thumbnail image.');
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('category', formData.category);
      uploadData.append('isShort', formData.isShort); 
      uploadData.append('videoFile', videoFile);
      uploadData.append('thumbnail', thumbnailFile);

      await axios.post('/api/v1/videos/upload-video', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      navigate('/channel');
    } catch (err) {
      console.error("Upload error", err);
      setError(err.response?.data?.message || 'Failed to upload video. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="upload-page">
    <div className="upload-page-container">

      {/* Progress Overlay */}
      {loading && (
        <div className="upload-progress-overlay">
           <div className="upload-progress-modal">
               <Loader2 size={48} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
               <h3 className="progress-title">Uploading Video...</h3>
               
               <div className="progress-bar-container">
                   <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
               </div>
               
               <div className="progress-stats">
                   <span className="progress-percent">{uploadProgress}%</span>
                   <span className="progress-status">
                       {uploadProgress < 100 ? 'Uploading to server...' : 'Processing video... Please wait'}
                   </span>
               </div>
           </div>
        </div>
      )}
      
      {/* Cropper Modal Overlay */}
      {isCropping && imgSrc && (
        <div className="crop-modal-overlay">
           <div className="crop-modal-content">
              <div className="crop-modal-header">
                  <h3><Crop size={20} /> Crop Thumbnail</h3>
                  <button type="button" onClick={cancelCrop} className="header-icon-btn"><X size={20}/></button>
              </div>
              <div className="crop-modal-body">
                  <ReactCrop 
                      crop={crop} 
                      onChange={(_, percentCrop) => setCrop(percentCrop)} 
                      onComplete={(c) => setCompletedCrop(c)}
                      aspect={16 / 9}
                  >
                        <img 
                            ref={imgRef} 
                            alt="Crop preview" 
                            src={imgSrc} 
                            onLoad={onImageLoad}
                            style={{ maxHeight: '60vh', objectFit: 'contain' }}
                        />
                  </ReactCrop>
              </div>
              <div className="crop-modal-footer">
                  <button type="button" onClick={cancelCrop} className="crop-btn secondary">Cancel</button>
                  <button type="button" onClick={handleCropComplete} className="crop-btn primary">Crop & Save</button>
              </div>
           </div>
        </div>
      )}

      <div className="upload-header">
        <h1 className="upload-title">Upload Video</h1>
        <p className="upload-subtitle">Share your content with the world</p>
      </div>

      {error && (
          <div className="upload-error-banner" style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
              <AlertCircle size={20} />
              {error}
          </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        
        {/* Title Input */}
        <div className="upload-input-group">
          <label className="upload-label" htmlFor="title">Video Title</label>
          <input 
            type="text" 
            id="title" 
            name="title" 
            className="upload-input" 
            placeholder="Give your video a catchy title..." 
            value={formData.title}
            onChange={handleInputChange}
            maxLength={100}
            required
          />
        </div>

        {/* Description Input */}
        <div className="upload-input-group">
          <label className="upload-label" htmlFor="description">Description</label>
          <textarea 
            id="description" 
            name="description" 
            className="upload-textarea" 
            placeholder="Tell viewers about your video..." 
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Video Type and Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="upload-input-group">
                <label className="upload-label" htmlFor="isShort">Video Type</label>
                <select 
                    id="isShort" 
                    name="isShort" 
                    className="upload-select"
                    value={formData.isShort}
                    onChange={handleInputChange}
                >
                    <option value="false">Regular Video</option>
                    <option value="true">Shorts</option>
                </select>
            </div>

            <div className="upload-input-group">
                <label className="upload-label" htmlFor="category">Category</label>
                <select 
                    id="category" 
                    name="category" 
                    className="upload-select"
                    value={formData.category}
                    onChange={handleInputChange}
                >
                    <option value="Other">Other</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Music">Music</option>
                    <option value="Education">Education</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Vlog">Vlog</option>
                    <option value="Tech">Tech</option>
                </select>
            </div>
        </div>

        {/* Dynamic Video Element Dropzone / Preview */}
        <div className="upload-input-group">
          <label className="upload-label">Video File</label>
          
          {videoPreviewUrl ? (
              <div className="media-preview-container">
                  <video 
                      src={videoPreviewUrl} 
                      className="media-preview-element" 
                      controls
                      autoPlay
                      muted
                      loop
                  />
                  <button type="button" className="media-preview-remove fade-in" onClick={removeVideo}>
                      <X size={24} color="var(--text-primary)" />
                  </button>
              </div>
          ) : (
             <div className="file-upload-wrapper">
                 <input 
                    type="file" 
                    accept="video/mp4,video/x-m4v,video/*" 
                    className="file-upload-input"
                    onChange={handleVideoChange}
                 />
                 <div className="file-upload-content">
                     <Video className="file-upload-icon" size={40} />
                     <p className="file-upload-text">Click or drag video to upload</p>
                     <p className="file-upload-hint">MP4, WebM or M4V (Max 2GB)</p>
                 </div>
              </div>
          )}
        </div>

        {/* Dynamic Thumbnail Image Dropzone / Preview */}
        <div className="upload-input-group">
          <label className="upload-label">Thumbnail Image</label>
          
          {thumbnailPreviewUrl ? (
              <div className="media-preview-container">
                  <img src={thumbnailPreviewUrl} alt="Thumbnail preview" className="media-preview-element" />
                  <button type="button" className="media-preview-remove fade-in" onClick={removeThumbnail}>
                      <X size={24} color="var(--text-primary)" />
                  </button>
              </div>
          ) : (
              <div className="file-upload-wrapper" style={{ padding: '1.5rem' }}>
                 <input 
                    type="file" 
                    accept="image/jpeg,image/png,image/jpg,image/webp" 
                    className="file-upload-input"
                    onChange={onSelectFile}
                 />
                 <div className="file-upload-content">
                     <ImageIcon className="file-upload-icon" size={32} />
                     <p className="file-upload-text">Upload Custom Thumbnail</p>
                     <p className="file-upload-hint">JPG, PNG or WEBP (Max 5MB)</p>
                 </div>
              </div>
          )}
        </div>

        {/* Submit */}
        <div className="upload-submit-container">
          <button type="submit" className="upload-submit-btn" disabled={loading}>
            {loading ? (
               <>
                 <Loader2 size={20} className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
                 Publishing...
               </>
            ) : (
               <>
                 <UploadIcon size={20} />
                 Publish Video
               </>
            )}
          </button>
        </div>

      </form>
    </div>
    </div>
  );
};

export default Upload;
