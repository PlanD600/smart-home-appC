import React from 'react';

const LoadingSpinner = ({ fullPage = false }) => {
  if (fullPage) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // This is for the modal loader
  return (
    <div className="modal-loader" style={{ display: 'block' }}>
      <div className="spinner"></div>
    </div>
  );
};

export default LoadingSpinner;