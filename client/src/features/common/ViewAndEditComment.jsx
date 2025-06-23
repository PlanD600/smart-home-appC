import React, { useState } from 'react';
import CommentForm from './CommentForm';

/**
 * A component that displays a comment and allows switching to an edit mode.
 * @param {object} props - Component props.
 * @param {object} props.item - The item to display/edit the comment for.
 * @param {function} props.onSave - The function to call when the comment is saved.
 */
const ViewAndEditComment = ({ item, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        // If in edit mode, show the existing CommentForm
        return <CommentForm item={item} onSave={onSave} />;
    }

    // Otherwise, display the comment with an edit button
    return (
        <div className="view-comment-container">
            <h4 className="form-title">הערה עבור: <span className="item-name">"{item.text}"</span></h4>
            <blockquote className="comment-blockquote">
                {item.comment}
            </blockquote>
            <div className="modal-footer">
                <button onClick={() => setIsEditing(true)} className="primary-action">
                    <i className="fas fa-edit"></i> ערוך הערה
                </button>
            </div>
        </div>
    );
};

export default ViewAndEditComment;
