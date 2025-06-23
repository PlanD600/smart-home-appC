import React, { useState } from 'react';
import { useModal } from '@/context/ModalContext';
import { useAppContext } from '@/context/AppContext';

/**
 * A form component presented in a modal for adding or editing a comment on an item.
 * @param {object} props - Component props.
 * @param {object} props.item - The item (task, shopping item, etc.) to which a comment is being added.
 * @param {function} props.onSave - The callback function to save the change, receives (itemId, { comment: newComment }).
 */
function CommentForm({ item, onSave }) {
    const { hideModal } = useModal();
    const { loading } = useAppContext();
    const [comment, setComment] = useState(item.comment || '');

    /**
     * Handles form submission, trims the comment, and calls the onSave callback.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(item._id, { comment: comment.trim() });
        }
        hideModal();
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            <h4 className="form-title">
                הוסף/ערוך הערה עבור: <span className="item-name">"{item.text}"</span>
            </h4>
            
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="5"
                className="comment-textarea"
                placeholder="כתוב כאן את ההערה שלך..."
                aria-label="Comment text"
                autoFocus
            />
            
            <div className="modal-footer">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? 'שומר...' : 'שמור הערה'}
                </button>
                <button type="button" className="secondary-action" onClick={hideModal}>
                    בטל
                </button>
            </div>
        </form>
    );
}

export default CommentForm;
