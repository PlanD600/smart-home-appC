import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * A reusable, animated, and accessible modal component.
 * It handles its own visibility transition and closing logic.
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls whether the modal is open or closed.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {string} props.title - The title to display in the modal header.
 * @param {React.ReactNode} props.children - The content to be rendered inside the modal body.
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    // The timeout duration should match the CSS animation duration
    setTimeout(() => {
        onClose();
        setIsAnimatingOut(false);
    }, 300);
  }, [onClose]);

  // Effect to handle the 'Escape' key for closing the modal
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.classList.add('modal-open'); // Prevent background scrolling
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('modal-open'); // Restore scrolling on cleanup
    };
  }, [isOpen, handleClose]);

  if (!isOpen && !isAnimatingOut) {
    return null;
  }
  
  const animationClass = isAnimatingOut ? 'modal-fade-out' : 'modal-fade-in';

  return (
    // The modal-backdrop handles the semi-transparent background and click-outside-to-close
    <div
      ref={modalRef}
      className={`modal-backdrop ${animationClass}`}
      onClick={handleClose} // Click on the backdrop closes the modal
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`modal-content-container ${animationClass}`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <header className="modal-header">
          <h4 className="modal-title">{title}</h4>
          <button
            className="close-modal-button"
            onClick={handleClose}
            aria-label="Close modal"
          >
            &times;
          </button>
        </header>
        <main className="modal-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;
