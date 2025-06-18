// client/src/features/common/AssignUserForm.jsx

import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext'; //
import { useHome } from '../../context/HomeContext'; //

function AssignUserForm({ item, onSave }) {
    const { activeHome } = useHome(); // שינוי: מ-currentHome ל-activeHome
    const { hideModal } = useModal(); // שינוי: מ-closeModal ל-hideModal
    const [assignedTo, setAssignedTo] = useState(item.assignedTo || 'משותף');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item._id, { assignedTo });
        hideModal(); // שינוי: מ-closeModal ל-hideModal
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4>שייך את "{item.text}"</h4> {/* שיניתי מ-item.name ל-item.text */}
            <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
            >
                <option value="משותף">משותף</option>
                {activeHome?.users.map(user => ( // שינוי: מ-currentHome ל-activeHome
                    <option key={user} value={user}>{user}</option>
                ))}
            </select>
            <div className="modal-footer" style={{marginTop: '1rem'}}>
                <button type="submit" className="primary-action">שייך</button>
            </div>
        </form>
    );
}

export default AssignUserForm;