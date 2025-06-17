// client/src/features/common/CommentForm.jsx

import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';

// item - הפריט שעבורו נכתבת ההערה
// onSave - הפונקציה שתופעל כדי לשמור את השינויים
function CommentForm({ item, onSave }) {
    const [comment, setComment] = useState(item.comment || '');
    const { closeModal } = useModal();

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item._id, { comment });
        closeModal();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4>הערה עבור "{item.name}"</h4>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="5"
                style={{ width: '100%', boxSizing: 'border-box' }}
                placeholder="כתוב כאן את ההערה..."
            />
            <div className="modal-footer" style={{marginTop: '1rem'}}>
                <button type="submit" className="primary-action">שמור הערה</button>
            </div>
        </form>
    );
}

export default CommentForm;