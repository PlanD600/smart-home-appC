// client/src/features/tasks/TaskItem.jsx
import React from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import CommentForm from '../common/CommentForm';
import AssignUserForm from '../common/AssignUserForm';

function TaskItem({ item }) {
    const { updateTask, deleteTask } = useHome();

    return (
        <li className={`${item.isCompleted ? 'completed' : ''}`}>
            <input type="checkbox" checked={item.isCompleted} onChange={() => updateTask(item._id, { isCompleted: !item.isCompleted })} />
            <div className="item-text">{item.name}</div>
            <div className="item-actions">
                <button className="action-btn delete-btn" onClick={() => deleteTask(item._id)}>
                    <i className="far fa-trash-alt"></i>
                </button>
            </div>
        </li>
    );
}

export default TaskItem;