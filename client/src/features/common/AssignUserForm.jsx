// client/src/features/common/AssignUserForm.jsx

import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useHome } from '../../../../HomeContexttest';

function AssignUserForm({ item, onSave }) {
    const { activeHome } = useHome();
    const { hideModal } = useModal();
    const [assignedTo, setAssignedTo] = useState(item.assignedTo || 'משותף');

    // רשימת משתמשים פוטנציאליים לבחירה
    // תמיד נכלול את האפשרות "משותף"
    const usersForSelection = [
        { _id: 'shared', name: 'משותף' }, // אובייקט ייחודי עבור "משותף"
        ...(activeHome?.users || []) // הוספת המשתמשים מהבית, מוודא שהם קיימים
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item._id, { assignedTo });
        hideModal();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4>שייך את "{item.text}"</h4>
            <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            >
                {usersForSelection.map(user => (
                    // === התיקון הקריטי כאן:
                    // 1. key: שימוש ב-user._id. אם user._id לא קיים (כמו ב"משותף"), נשתמש ב-user.name (ונוודא שהוא ייחודי).
                    // 2. value: שימוש ב-user.name - זה הערך שנשלח חזרה לשרת.
                    // 3. תוכן האופציה: שימוש ב-user.name כטקסט המוצג למשתמש.
                    // Mongoose מוסיף _id אוטומטית לתתי-מסמכים במערכים, כך ש-user._id אמור להיות זמין.
                    <option key={user._id || user.name} value={user.name}>
                        {user.name}
                    </option>
                ))}
            </select>
            <div className="modal-footer" style={{ marginTop: '1rem' }}>
                <button type="submit" className="primary-action">שייך</button>
            </div>
        </form>
    );
}

export default AssignUserForm;
