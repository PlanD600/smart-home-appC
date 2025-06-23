import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';

// This is now just a fallback for when no categories are defined in the home object.
const FALLBACK_CATEGORIES = [
    'כללית', 'מצרכים', 'חשבונות', 'בידור', 'שונות',
];

/**
 * A reusable form for adding new items to shopping or task lists.
 * It includes fields for text, category, and user assignment.
 * @param {object} props - Component props.
 * @param {'shopping' | 'tasks'} props.listType - The type of list the item will be added to.
 * @param {function} props.onAddItem - The callback function to add the item, receives (listType, itemData).
 */
const AddItemForm = ({ listType, onAddItem }) => {
    const { activeHome, currentUser, loading } = useAppContext();

    const availableCategories = useMemo(() => {
        return activeHome?.listCategories?.length > 0
            ? activeHome.listCategories
            : FALLBACK_CATEGORIES;
    }, [activeHome?.listCategories]);

    // Form state
    const [text, setText] = useState('');
    const [category, setCategory] = useState(availableCategories[0]);
    const [assignedTo, setAssignedTo] = useState('');

    const users = useMemo(() => activeHome?.users || [], [activeHome?.users]);

    // Update the default category if the available categories change.
    useEffect(() => {
        if (!availableCategories.includes(category)) {
            setCategory(availableCategories[0]);
        }
    }, [availableCategories, category]);

    useEffect(() => {
        if (users.length > 0) {
            const userExists = users.some(u => u.name === currentUser);
            setAssignedTo(userExists ? currentUser : users[0].name);
        }
    }, [users, currentUser]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim() || loading) return;

        const newItemData = {
            text: text.trim(),
            category,
            assignedTo,
        };

        onAddItem(listType, newItemData);

        setText('');
        setCategory(availableCategories[0]); // Reset to the first available category
    };

    return (
        <form onSubmit={handleSubmit} className="add-item-form-container">
            <div className="input-group">
                <i className="fas fa-pencil-alt input-icon"></i>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={listType === 'shopping' ? 'הוסף מוצר...' : 'הוסף משימה...'}
                    className="main-input"
                    aria-label="New item text"
                    required
                />
            </div>

            <div className="options-group">
                <div className="select-group">
                    <label htmlFor="category-select">קטגוריה</label>
                    <select
                        id="category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="control-select"
                    >
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="select-group">
                    <label htmlFor="user-select">שייך ל</label>
                     <select
                        id="user-select"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="control-select"
                        disabled={users.length === 0}
                    >
                        {users.length > 0 ? (
                            users.map((user) => (
                                <option key={user.name} value={user.name}>
                                    {user.name}
                                </option>
                            ))
                        ) : (
                            <option>אין משתמשים</option>
                        )}
                    </select>
                </div>

                <button
                    type="submit"
                    className="submit-button"
                    disabled={loading || !text.trim()}
                    aria-label="Add item"
                >
                    <i className="fas fa-plus"></i>
                </button>
            </div>
        </form>
    );
};

export default AddItemForm;
