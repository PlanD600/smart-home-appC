import React, { createContext, useState, useContext } from 'react';
import Modal from '../components/Modal'; // We will create this component next

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalContent, setModalContent] = useState(null);
  const [modalProps, setModalProps] = useState({});
  const [isOpen, setIsOpen] = useState(false);

  const showModal = (content, props = {}) => {
    setModalContent(content);
    setModalProps(props);
    setIsOpen(true);
  };

  const hideModal = () => {
    setIsOpen(false);
    // Delay clearing content to allow for closing animation
    setTimeout(() => {
        setModalContent(null);
        setModalProps({});
    }, 300);
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={hideModal}
          title={modalProps.title || ''}
        >
          {modalContent}
        </Modal>
      )}
    </ModalContext.Provider>
  );
};