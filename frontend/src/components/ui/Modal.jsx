import React from 'react';

const Modal = ({ isOpen, onClose, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative bg-surface1 text-textPrimary border border-border rounded-xl shadow-2xl p-6 w-full max-w-md m-4 ${className}`}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-textMuted hover:text-textPrimary transition-colors"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
