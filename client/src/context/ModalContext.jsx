import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';
import Modal from '@/components/Modal'; // Using aliased path

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

/**
 * A simple, reusable component for confirmation dialogs.
 * This is an internal component used by the showConfirmModal helper.
 */
const ConfirmationDialog = ({ message, onConfirm, onCancel }) => (
    <div className="p-4 text-center">
        <p className="text-lg mb-6">{message}</p>
        <div className="flex justify-center gap-4">
            <button onClick={onCancel} className="btn btn-secondary">
                ביטול
            </button>
            <button onClick={onConfirm} className="btn btn-danger">
                אישור
            </button>
        </div>
    </div>
);


export const ModalProvider = ({ children }) => {
    // Combine modal state into a single object for cleaner updates
    const [modalState, setModalState] = useState({
        isOpen: false,
        content: null,
        props: {},
    });

    /**
     * Hides the currently active modal.
     */
    const hideModal = useCallback(() => {
        setModalState(prevState => ({ ...prevState, isOpen: false }));
        // Delay clearing content to allow for a closing animation (e.g., fade out)
        setTimeout(() => {
            setModalState({ isOpen: false, content: null, props: {} });
        }, 300); // This duration should match the CSS animation time
    }, []);

    /**
     * Shows a modal with the given content and properties.
     * @param {React.ReactNode} content - The JSX content to display inside the modal.
     * @param {object} [props] - Optional properties, like the modal title.
     */
    const showModal = useCallback((content, props = {}) => {
        setModalState({
            isOpen: true,
            content,
            props,
        });
    }, []);

    /**
     * A helper function to quickly show a confirmation dialog.
     * This simplifies creating confirmation prompts throughout the app.
     * @param {string} message - The confirmation message to display.
     * @param {Function} onConfirm - The function to call when the user clicks "Confirm".
     * @param {string} [title='אישור פעולה'] - The title for the confirmation modal.
     */
    const showConfirmModal = useCallback((message, onConfirm, title = 'אישור פעולה') => {
        const handleConfirm = () => {
            onConfirm();
            hideModal();
        };

        showModal(
            <ConfirmationDialog
                message={message}
                onConfirm={handleConfirm}
                onCancel={hideModal}
            />,
            { title }
        );
    }, [showModal, hideModal]);

    // Memoize the context value to prevent unnecessary re-renders
    const contextValue = useMemo(() => ({
        showModal,
        hideModal,
        showConfirmModal, // Expose the new helper function
    }), [showModal, hideModal, showConfirmModal]);

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            {/* The Modal component is only rendered here, once, and its content is managed by the context */}
            <Modal
                isOpen={modalState.isOpen}
                onClose={hideModal}
                title={modalState.props.title || ''}
            >
                {modalState.content}
            </Modal>
        </ModalContext.Provider>
    );
};
