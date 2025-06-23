import React, { useState, useMemo, useEffect } from 'react';
import { useModal } from '@/context/ModalContext';
import { useAppContext } from '@/context/AppContext';

function AssignUserForm({ item, onSave }) {
    const { activeHome } = useAppContext();
    const { hideModal } = useModal();
    
    const [assignedTo, setAssignedTo] = useState(item.assignedTo || '');

    const usersForSelection = useMemo(() => {
        const baseList = [{ _id: 'shared', name: 'משותף' }];
        const homeUsers = activeHome?.users || [];
        return [...baseList, ...homeUsers];
    }, [activeHome?.users]);

    useEffect(() => {
        const isAssignedUserInList = usersForSelection.some(u => u.name === assignedTo);
        if (!assignedTo || !isAssignedUserInList) {
            setAssignedTo(usersForSelection[0]?.name || '');
        }
    }, [assignedTo, usersForSelection]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(item._id, { assignedTo });
        }
        hideModal();
    };

    return (
        <form onSubmit={handleSubmit} className="assign-user-form">
            <h4 className="form-title">
                שייך את הפריט: <span className="item-name">"{item.text}"</span>
            </h4>

            <div className="select-wrapper">
                 <i className="fas fa-users select-icon"></i>
                <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="user-select"
                    aria-label="Select user to assign"
                >
                    {usersForSelection.map(user => (
                        <option key={user._id || user.name} value={user.name}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="modal-footer">
                <button type="submit" className="primary-action">שמור שיוך</button>
                <button type="button" className="secondary-action" onClick={hideModal}>בטל</button>
            </div>
        </form>
    );
}

export default AssignUserForm;
