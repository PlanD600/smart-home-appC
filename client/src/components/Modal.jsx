// pland600/smart-home-appc/smart-home-appC-f331e9bcc98af768f120e09df9e92536aea46253/client/src/components/Modal.jsx
import React from 'react';
import { useModal } from '../context/ModalContext';

function Modal() {
    const { isModalOpen, modalContent, closeModal } = useModal();

    if (!isModalOpen) {
        return null;
    }

    return (
        <div className="modal" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close-modal-btn" onClick={closeModal}>&times;</span>
                {modalContent}
            </div>
        </div>
    );
}

export default Modal;