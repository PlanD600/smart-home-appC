// client/src/features/common/AssignUserForm.jsx
import React, { useState } from 'react';
import { useModal } from '../../context/ModalContext';
import { useHome } from '../../context/HomeContext';

function AssignUserForm({ item, onSave }) {
    const { currentHome } = useHome();
    const { closeModal } = useModal();
    const [assignedTo, setAssignedTo] = useState(item.assignedTo || 'משותף');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(item._id, { assignedTo });
        closeModal();
    };

    return (
        <form onSubmit={handleSubmit}>
            <h4>שייך את "{item.name}"</h4>
            <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}>
                <option value="משותף">משותף</option>
                {currentHome?.users.map(user => (
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