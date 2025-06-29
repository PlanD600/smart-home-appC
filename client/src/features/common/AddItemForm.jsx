import React, { useState, useEffect, useRef } from 'react';

const AddItemForm = ({ onAddItem, categories = [], users = [], listType }) => {
    const [text, setText] = useState('');
    const [category, setCategory] = useState('כללית');
    const [assignedTo, setAssignedTo] = useState('משותף');
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        const newItem = {
            text,
            category: category || 'כללית',
            assignedTo: assignedTo || 'משותף', // [שינוי] תמיד נשלח את השיוך
            isUrgent: false,
            completed: false,
        };
        onAddItem(newItem);
        setText('');
        // Do not reset category and user for faster sequential adding
    };

    return (
        <form onSubmit={handleSubmit} className="add-item-form-redesigned">
            {/* [שדרוג] שורה ראשונה */}
            <div className="form-row">
                <input
                    ref={inputRef}
                    type="text"
                    className="form-control item-name-input"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="הוסף פריט חדש..."
                />
            </div>
            
            {/* [שדרוג] שורה שנייה */}
            <div className="form-row">
                <select
                    className="form-control"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="כללית">קטגוריה (כללית)</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                    <select
                        className="form-control"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                    >
                        <option value="משותף">שייך ל... (משותף)</option>
                        {users.map(user => <option key={user} value={user}>{user}</option>)}
                    </select>
                

                <button type="submit" className="add-btn">
                    <i className="fas fa-plus"></i> הוסף
                </button>
            </div>
        </form>
    );
};

export default AddItemForm;