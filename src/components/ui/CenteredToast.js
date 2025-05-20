import React, { useEffect } from 'react';

export default function CenteredToast({ open, message, type = 'success', onClose }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed top-8 left-1/2 z-50 transform -translate-x-1/2">
      <div
        className={`px-6 py-3 rounded shadow-lg text-white font-semibold text-center transition-all duration-300
          ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
      >
        {message}
      </div>
    </div>
  );
} 