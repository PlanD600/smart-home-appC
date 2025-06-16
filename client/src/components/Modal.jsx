import React from 'react';

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-modal-btn" onClick={onClose}>&times;</span>
        <h4>{title}</h4>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;