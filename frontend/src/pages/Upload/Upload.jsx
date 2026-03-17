import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  Upload as UploadIcon, Image as ImageIcon, Video,
  Loader2, AlertCircle, X, Crop, Info,
  ArrowRight, ArrowLeft, Check, Eye, Settings, FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Upload.css';

function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth, mediaHeight,
  );
}

const STEPS = [
  { id: 1, label: 'Details',  icon: FileText  },
  { id: 2, label: 'Media',    icon: Video     },
  { id: 3, label: 'Settings', icon: Settings  },
  { id: 4, label: 'Review',   icon: Eye       },
];

const Upload = () => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  if (!user) { navigate('/login'); }

  /* ── form data ── */
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Other',
    isShort: 'false', visibility: 'public',
  });

  /* ── video ── */
  const [videoFile,       setVideoFile]       = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('');

  /* ── thumbnail / crop ── */
  const [thumbnailFile,       setThumbnailFile]       = useState(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState('');
  const [imgSrc,    setImgSrc]    = useState('');
  const [crop,      setCrop]      = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropping,    setIsCropping]    = useState(false);
  const imgRef = useRef(null);

  /* ── ui state ── */
  const [currentStep,    setCurrentStep]    = useState(1);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  /* ── helpers ── */
  const handleInputChange = (e) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const goToStep = (step) => { setError(''); setCurrentStep(step); };

  const validateStep = (step) => {
    if (step === 1) {
      if (!formData.title.trim())       { setError('Please enter a video title.');       return false; }
      if (!formData.description.trim()) { setError('Please enter a description.');       return false; }
    }
    if (step === 2) {
      if (!videoFile)     { setError('Please upload a video file.');            return false; }
      if (!thumbnailFile) { setError('Please upload and crop a thumbnail.');    return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) goToStep(currentStep + 1);
  };

  const handleBack = () => { setError(''); goToStep(currentStep - 1); };

  /* ── video ── */
  const handleVideoChange = (e) => {
    if (e.target.files?.[0]) {
      setVideoFile(e.target.files[0]);
      setVideoPreviewUrl(URL.createObjectURL(e.target.files[0]));
      setError('');
    }
  };
  const removeVideo = () => { setVideoFile(null); setVideoPreviewUrl(''); };

  /* ── thumbnail ── */
  const onSelectFile = (e) => {
    if (e.target.files?.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
      reader.readAsDataURL(e.target.files[0]);
      setIsCropping(true);
    }
  };
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  };
  const handleCropComplete = () => {
    if (!completedCrop || !imgRef.current) return;
    const image = imgRef.current;
    const sw = image.naturalWidth  / image.width;
    const sh = image.naturalHeight / image.height;
    if (completedCrop.width === 0 || completedCrop.height === 0) { setIsCropping(false); setImgSrc(''); return; }
    const canvas = document.createElement('canvas');
    canvas.width  = completedCrop.width  * sw;
    canvas.height = completedCrop.height * sh;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(image, completedCrop.x * sw, completedCrop.y * sw, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      setThumbnailFile(new File([blob], 'thumbnail.jpg', { type: 'image/jpeg' }));
      setThumbnailPreviewUrl(URL.createObjectURL(blob));
      setIsCropping(false);
      setImgSrc('');
    }, 'image/jpeg', 0.95);
  };
  const cancelCrop     = () => { setIsCropping(false); setImgSrc(''); };
  const removeThumbnail = () => { setThumbnailFile(null); setThumbnailPreviewUrl(''); };

  /* ── submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateStep(1) || !validateStep(2)) return;
    setLoading(true);
    setUploadProgress(0);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => data.append(k, v));
      data.append('videoFile',  videoFile);
      data.append('thumbnail',  thumbnailFile);
      await axios.post('/api/v1/videos/upload-video', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) =>
          setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      navigate('/channel');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload. Please try again.');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  /* ── review labels ── */
  const typeLabel = formData.isShort === 'true' ? 'Short' : 'Regular Video';
  const visLabel  = { public: 'Public', unlisted: 'Unlisted', private: 'Private' }[formData.visibility];

  return (
    <div className="upload-page">
      <div className="upload-page-container">

        {/* ── PROGRESS OVERLAY ── */}
        {loading && (
          <div className="upload-progress-overlay">
            <div className="upload-progress-modal">
              <Loader2 size={44} className="upload-spinner" />
              <h3 className="progress-title">Uploading Video…</h3>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
              <div className="progress-stats">
                <span className="progress-percent">{uploadProgress}%</span>
                <span className="progress-status">
                  {uploadProgress < 100 ? 'Uploading to server…' : 'Processing… Please wait'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── CROP MODAL ── */}
        {isCropping && imgSrc && (
          <div className="crop-modal-overlay">
            <div className="crop-modal-content">
              <div className="crop-modal-header">
                <h3><Crop size={18} /> Crop Thumbnail</h3>
                <button type="button" onClick={cancelCrop} className="crop-close-btn"><X size={18} /></button>
              </div>
              <div className="crop-modal-body">
                <ReactCrop crop={crop} onChange={(_, p) => setCrop(p)} onComplete={(c) => setCompletedCrop(c)} aspect={16 / 9}>
                  <img ref={imgRef} alt="Crop" src={imgSrc} onLoad={onImageLoad} style={{ maxHeight: '60vh', objectFit: 'contain' }} />
                </ReactCrop>
              </div>
              <div className="crop-modal-footer">
                <button type="button" onClick={cancelCrop}       className="crop-btn secondary">Cancel</button>
                <button type="button" onClick={handleCropComplete} className="crop-btn primary">Crop & Save</button>
              </div>
            </div>
          </div>
        )}

        {/* ── PAGE HEADER ── */}
        <div className="upload-header">
          <div className="upload-header-icon"><UploadIcon size={26} /></div>
          <h1 className="upload-title">Upload Video</h1>
          <p className="upload-subtitle">Share your content with the world</p>
        </div>

        {/* ── STEP INDICATOR ── */}
        <div className="upload-steps-nav">
          {STEPS.map((step, idx) => {
            const isDone   = currentStep > step.id;
            const isActive = currentStep === step.id;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`upload-step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                  onClick={() => isDone && goToStep(step.id)}
                  style={{ cursor: isDone ? 'pointer' : 'default' }}
                >
                  <div className="upload-step-circle">
                    {isDone ? <Check size={14} strokeWidth={2.5} /> : step.id}
                  </div>
                  <div className="upload-step-label">{step.label}</div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`upload-step-line ${isDone ? 'done' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="upload-error-banner">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 1 — DETAILS
        ══════════════════════════════════════════ */}
        {currentStep === 1 && (
          <div className="upload-step-panel">
            <div className="upload-step-heading">
              <div className="upload-step-title">Video Details</div>
              <div className="upload-step-sub">Give your video a title and description</div>
            </div>

            <div className="upload-input-group">
              <label className="upload-label" htmlFor="title">Video Title</label>
              <input
                type="text" id="title" name="title"
                className="upload-input"
                placeholder="Give your video a catchy title…"
                value={formData.title}
                onChange={handleInputChange}
                maxLength={100} required
              />
              <div className="upload-field-footer">
                <span className="upload-char-count">{formData.title.length} / 100</span>
              </div>
            </div>

            <div className="upload-input-group">
              <label className="upload-label" htmlFor="description">Description</label>
              <textarea
                id="description" name="description"
                className="upload-textarea"
                placeholder="Tell viewers about your video…"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="upload-btn-row end">
              <button type="button" className="upload-btn-next" onClick={handleNext}>
                Next — Media <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 2 — MEDIA
        ══════════════════════════════════════════ */}
        {currentStep === 2 && (
          <div className="upload-step-panel">
            <div className="upload-step-heading">
              <div className="upload-step-title">Upload Media</div>
              <div className="upload-step-sub">Add your video file and thumbnail image</div>
            </div>

            {/* Video dropzone / preview */}
            <div className="upload-input-group">
              <label className="upload-label">Video File</label>
              {videoPreviewUrl ? (
                <div className="media-preview-container">
                  <video src={videoPreviewUrl} className="media-preview-element" controls autoPlay muted loop />
                  <button type="button" className="media-preview-remove" onClick={removeVideo}><X size={16} /></button>
                </div>
              ) : (
                <div className="file-upload-wrapper">
                  <input type="file" accept="video/mp4,video/x-m4v,video/*" className="file-upload-input" onChange={handleVideoChange} />
                  <div className="file-upload-content">
                    <div className="file-upload-icon"><Video size={22} /></div>
                    <p className="file-upload-text">Click or drag your video here</p>
                    <p className="file-upload-hint">MP4, WebM or M4V · Max 2GB</p>
                    <span className="file-upload-or">— or —</span>
                    <span className="file-upload-browse">Browse File</span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail + preview side by side */}
            <div className="upload-media-row">
              <div className="upload-input-group">
                <label className="upload-label">Thumbnail Image</label>
                {thumbnailPreviewUrl ? (
                  <div className="media-preview-container thumb-preview">
                    <img src={thumbnailPreviewUrl} alt="Thumbnail" className="media-preview-element" />
                    <button type="button" className="media-preview-remove" onClick={removeThumbnail}><X size={16} /></button>
                  </div>
                ) : (
                  <div className="file-upload-wrapper thumb-drop">
                    <input type="file" accept="image/jpeg,image/png,image/jpg,image/webp" className="file-upload-input" onChange={onSelectFile} />
                    <div className="file-upload-content">
                      <div className="file-upload-icon"><ImageIcon size={20} /></div>
                      <p className="file-upload-text">Upload Thumbnail</p>
                      <p className="file-upload-hint">JPG, PNG · Max 5MB</p>
                    </div>
                  </div>
                )}
              </div>

              {/* <div className="upload-input-group">
                <div className="thumb-preview-placeholder">
                  {thumbnailPreviewUrl
                    ? <img src={thumbnailPreviewUrl} alt="Preview" style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'10px' }} />
                    : <span className="thumb-preview-empty">Thumbnail preview</span>
                  }
                </div>
              </div> */}
            </div>

            <div className="upload-tips-bar">
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Use a <strong>1920×1080 thumbnail</strong> for best quality. It will be cropped to 16:9.</span>
            </div>

            <div className="upload-btn-row between">
              <button type="button" className="upload-btn-back" onClick={handleBack}>
                <ArrowLeft size={14} strokeWidth={2} /> Back
              </button>
              <button type="button" className="upload-btn-next" onClick={handleNext}>
                Next — Settings <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — SETTINGS
        ══════════════════════════════════════════ */}
        {currentStep === 3 && (
          <div className="upload-step-panel">
            <div className="upload-step-heading">
              <div className="upload-step-title">Video Settings</div>
              <div className="upload-step-sub">Configure your video type, category and visibility</div>
            </div>

            <div className="upload-grid-2">
              <div className="upload-input-group">
                <label className="upload-label" htmlFor="isShort">Video Type</label>
                <select id="isShort" name="isShort" className="upload-select" value={formData.isShort} onChange={handleInputChange}>
                  <option value="false">Regular Video</option>
                  <option value="true">Short</option>
                </select>
              </div>
              <div className="upload-input-group">
                <label className="upload-label" htmlFor="category">Category</label>
                <select id="category" name="category" className="upload-select" value={formData.category} onChange={handleInputChange}>
                  <option value="Other">Other</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Music">Music</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Vlog">Vlog</option>
                  <option value="Tech">Tech</option>
                  <option value="Travel">Travel</option>
                </select>
              </div>
            </div>

            <div className="upload-divider" />

            <div className="upload-input-group">
              <label className="upload-label" htmlFor="visibility">Visibility</label>
              <select id="visibility" name="visibility" className="upload-select" value={formData.visibility} onChange={handleInputChange}>
                <option value="public">Public — Anyone can watch</option>
                <option value="unlisted">Unlisted — Only with the link</option>
                <option value="private">Private — Only you</option>
              </select>
            </div>

            <div className="upload-btn-row between">
              <button type="button" className="upload-btn-back" onClick={handleBack}>
                <ArrowLeft size={14} strokeWidth={2} /> Back
              </button>
              <button type="button" className="upload-btn-next" onClick={handleNext}>
                Next — Review <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 4 — REVIEW
        ══════════════════════════════════════════ */}
        {currentStep === 4 && (
          <div className="upload-step-panel">
            <div className="upload-step-heading">
              <div className="upload-step-title">Review & Publish</div>
              <div className="upload-step-sub">Check everything before publishing your video</div>
            </div>

            <div className="upload-review-grid">
              <div className="upload-review-card">
                <div className="upload-review-key">Title</div>
                <div className="upload-review-val">{formData.title || '—'}</div>
              </div>
              <div className="upload-review-card">
                <div className="upload-review-key">Category</div>
                <div className="upload-review-val">{formData.category}</div>
              </div>
              <div className="upload-review-card">
                <div className="upload-review-key">Video Type</div>
                <div className="upload-review-val">{typeLabel}</div>
              </div>
              <div className="upload-review-card">
                <div className="upload-review-key">Visibility</div>
                <div className="upload-review-val">{visLabel}</div>
              </div>
            </div>

            <div className="upload-review-card full">
              <div className="upload-review-key">Description</div>
              <div className="upload-review-desc">{formData.description || '—'}</div>
            </div>

            <div className="upload-review-media">
              <div className="upload-review-card media-card">
                <div className="upload-review-key">Video File</div>
                <div className="upload-review-val media-name">
                  {videoFile ? (
                    <><Video size={13} /> {videoFile.name}</>
                  ) : <span style={{color:'rgba(255,255,255,0.3)'}}>No file</span>}
                </div>
              </div>
              <div className="upload-review-card media-card">
                <div className="upload-review-key">Thumbnail</div>
                {thumbnailPreviewUrl
                  ? <img src={thumbnailPreviewUrl} alt="thumb" className="upload-review-thumb" />
                  : <span className="upload-review-val" style={{color:'rgba(255,255,255,0.3)'}}>No thumbnail</span>
                }
              </div>
            </div>

            <div className="upload-tips-bar">
              <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Videos are processed after publishing and may take a few minutes to appear publicly.</span>
            </div>

            <div className="upload-btn-row between">
              <button type="button" className="upload-btn-back" onClick={handleBack}>
                <ArrowLeft size={14} strokeWidth={2} /> Back
              </button>
              <button type="button" className="upload-btn-publish" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><Loader2 size={16} className="upload-spinner" /> Publishing…</>
                  : <><UploadIcon size={16} /> Publish Video</>
                }
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Upload;