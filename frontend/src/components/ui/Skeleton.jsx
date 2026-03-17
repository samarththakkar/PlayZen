import React from 'react';
import './Skeleton.css';

/**
 * Skeleton loader component — PlayZen glass morphism theme
 *
 * Types:
 *   text | title | input | button | avatar | thumb |
 *   avatar-small | avatar-lg | banner | pill | meta | dim
 *
 * Compound components:
 *   <VideoCardSkeleton />   — full glass card with thumb + info
 *   <ProfileSkeleton />     — banner + avatar + name lines
 *   <CommentSkeleton />     — avatar + text lines
 *   <CategorySkeleton />    — row of pill skeletons
 */

/* ── BASE SKELETON ── */
const Skeleton = ({ type = 'text', className = '', style = {}, width, height }) => {
  const inlineStyle = {
    ...(width  ? { width  } : {}),
    ...(height ? { height } : {}),
    ...style,
  };
  return (
    <div
      className={`skeleton skeleton-${type} ${className}`.trim()}
      style={inlineStyle}
      aria-hidden="true"
    />
  );
};

/* ── VIDEO CARD SKELETON ── */
export const VideoCardSkeleton = () => (
  <div className="video-skeleton" aria-hidden="true">
    {/* Thumbnail */}
    <Skeleton type="thumb" />

    {/* Info row */}
    <div className="skeleton-info">
      <Skeleton type="avatar-small" />
      <div className="skeleton-text-container">
        <Skeleton type="title" />
        <Skeleton type="text" />
        <Skeleton type="text" className="skeleton-meta skeleton-w-1\/3" />
      </div>
    </div>
  </div>
);

/* ── VIDEO GRID SKELETON ── */
export const VideoGridSkeleton = ({ count = 6 }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '18px',
    }}
    aria-hidden="true"
  >
    {Array.from({ length: count }).map((_, i) => (
      <VideoCardSkeleton key={i} />
    ))}
  </div>
);

/* ── PROFILE SKELETON ── */
export const ProfileSkeleton = () => (
  <div aria-hidden="true">
    <Skeleton type="banner" />
    <div className="skeleton-profile-row">
      <Skeleton type="avatar-lg" />
      <div style={{ flex: 1, paddingBottom: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton type="title" style={{ width: '40%', marginBottom: 0 }} />
        <Skeleton type="text"  style={{ width: '28%', marginBottom: 0 }} />
      </div>
    </div>
  </div>
);

/* ── COMMENT SKELETON ── */
export const CommentSkeleton = ({ count = 4 }) => (
  <div aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="skeleton-comment">
        <Skeleton type="avatar-small" />
        <div className="skeleton-comment-body">
          <Skeleton type="title" style={{ width: '30%', marginBottom: 0 }} />
          <Skeleton type="text" />
          <Skeleton type="text" style={{ width: '70%', marginBottom: 0 }} />
        </div>
      </div>
    ))}
  </div>
);

/* ── CATEGORY PILLS SKELETON ── */
export const CategorySkeleton = ({ count = 8 }) => (
  <div
    style={{ display: 'flex', gap: '8px', overflow: 'hidden' }}
    aria-hidden="true"
  >
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton
        key={i}
        type="pill"
        style={{ width: `${60 + (i % 3) * 20}px` }}
      />
    ))}
  </div>
);

export default Skeleton;