import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useAppContext } from '@/context/AppContext'; // ✅ Fixed import

function AssignUserForm({ item, onSave }) {
    const { activeHome } = useAppContext(); // ✅ Fixed: Use useAppContext
    const { hideModal } = useModal();
    const [assignedTo, setAssignedTo] = useState(item.assignedTo || 'משותף');

    const usersForSelection = [
        { _id: 'shared', name: 'משותף' },
        ...(activeHome?.users || [])
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
