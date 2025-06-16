// client/src/features/tasks/TaskItem.jsx
import React, { useContext } from 'react';
import HomeContext from '../../context/HomeContext.jsx';
import { Check, Trash } from 'lucide-react';

const TaskItem = ({ task, homeId }) => {
    const { updateTask } = useContext(HomeContext);

    const handleToggle = () => {
        updateTask(homeId, task._id, { isCompleted: !task.isCompleted });
    };

    const handleArchive = () => {
        updateTask(homeId, task._id, { isArchived: true });
    };

    return (
        <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center">
                <button onClick={handleToggle} className="mr-2">
                    <Check className={task.isCompleted ? "text-green-500" : "text-gray-300"} />
                </button>
                <span className={task.isCompleted ? 'line-through text-gray-500' : ''}>
                    {task.name}
                </span>
            </div>
            <button onClick={handleArchive}>
                <Trash className="text-red-500" />
            </button>
        </div>
    );
};

export default TaskItem;
