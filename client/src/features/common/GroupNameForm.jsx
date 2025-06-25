import React, { useState } from 'react';
import { useListActions } from '@/context/ListActionsContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const GroupNameForm = ({ listType, draggedItemId, targetItemId }) => {
    const { groupItems, loading } = useListActions();
    const { hideModal } = useModal();
    const [name, setName] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        await groupItems(listType, draggedItemId, targetItemId, name.trim());
        hideModal();
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <h3 className="text-lg font-semibold mb-4">תן שם לתיקייה החדשה</h3>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="שם התיקייה..."
                className="w-full p-2 border rounded"
                autoFocus
                required
            />
            <div className="modal-footer mt-4">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'צור תיקייה'}
                </button>
                <button type="button" className="secondary-action" onClick={hideModal}>
                    ביטול
                </button>
            </div>
        </form>
    );
};

export default GroupNameForm;