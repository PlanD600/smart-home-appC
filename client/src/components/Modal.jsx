import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Effect to handle Escape key press for closing the modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Prevent rendering if not open
  if (!isOpen) {
    return null;
  }

  // The id="generic-modal" and other classes are taken from your original style.css
  return (
    <div id="generic-modal" className="modal" style={{ display: 'block' }} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span id="generic-modal-close-btn" className="close-modal-btn" onClick={onClose}>
          &times;
        </span>
        <h4 id="generic-modal-title">{title}</h4>
        <div id="generic-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;