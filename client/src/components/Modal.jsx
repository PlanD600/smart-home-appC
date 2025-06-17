// client/src/components/Modal.jsx
import React from 'react';
import { useModal } from '../context/ModalContext';

function Modal() {
    const { isModalOpen, modalContent, closeModal } = useModal();

    if (!isModalOpen) {
        return null;
    }

    // לחיצה על הרקע האפור תסגור את המודאל
    return (
        <div className="modal" onClick={closeModal}>
            {/* לחיצה על תוכן המודאל עצמו לא תסגור אותו */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close-modal-btn" onClick={closeModal}>&times;</span>
                {modalContent}
            </div>
        </div>
    );
}

export default Modal;