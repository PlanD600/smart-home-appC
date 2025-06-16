// client/src/features/tasks/TaskList.jsx
import React, { useState, useContext } from 'react';
import HomeContext from '../../context/HomeContext.jsx';
import TaskItem from './TaskItem';

const TaskList = ({ home }) => {
    const { addTask } = useContext(HomeContext);
    const [newTaskName, setNewTaskName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newTaskName.trim()) {
            addTask(home._id, { name: newTaskName });
            setNewTaskName('');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Tasks</h2>
            <form onSubmit={handleSubmit} className="flex mb-4">
                <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="Add a new task..."
                    className="flex-grow p-2 border rounded-l-lg"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded-r-lg">Add</button>
            </form>
            <div>
                {home.tasks.filter(task => !task.isArchived).map(task => (
                    <TaskItem key={task._id} task={task} homeId={home._id} />
                ))}
            </div>
        </div>
    );
};

export default TaskList;
