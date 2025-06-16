import React from 'react';

// אין יותר צורך לייבא לוגו!

function LoadingSpinner() {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        {/* החלפנו את התמונה באייקון */}
        <div className="loading-icon-container">
          <i className="fas fa-home"></i>
        </div>
        <div className="spinner"></div>
        <p>טוען...</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;