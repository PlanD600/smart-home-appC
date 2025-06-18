import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';
import { useModal } from '../../context/ModalContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const UserManager = () => {
    const { activeHome, addHomeUser, removeHomeUser, loading, error } = useHome();
    const { showModal, hideModal } = useModal();
    const [newUserName, setNewUserName] = useState('');

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUserName.trim()) return;
        const success = await addHomeUser(newUserName.trim());
        if (success) {
            setNewUserName('');
        }
    };

    const confirmRemoveUser = (userName) => {
        showModal(
            <div>
                <p>האם אתה בטוח שברצונך להסיר את {userName} מהבית?</p>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={hideModal} className="btn btn-secondary">ביטול</button>
                    <button onClick={() => handleRemoveUser(userName)} className="btn btn-danger">הסר</button>
                </div>
            </div>,
            { title: 'אישור מחיקה' }
        );
    };

    const handleRemoveUser = async (userName) => {
        await removeHomeUser(userName);
        hideModal(); // Close the confirmation modal after action
    };

    if (loading && !activeHome?.users) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">בני הבית הנוכחיים</h3>
            {activeHome?.users && activeHome.users.length > 0 ? (
                <ul className="space-y-3 mb-6">
                    {activeHome.users.map((user) => (
                        <li key={user} className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm transition-shadow hover:shadow-md">
                            <span className="text-gray-700 font-medium">{user}</span>
                            <button 
                                onClick={() => confirmRemoveUser(user)} 
                                className="text-red-500 hover:text-red-700 transition-colors"
                                aria-label={`Remove ${user}`}
                            >
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 text-center mb-6">עדיין אין בני בית.</p>
            )}

            <hr className="my-6" />

            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">הוספת בן בית חדש</h3>
            <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="שם בן הבית"
                    className="input input-bordered flex-grow"
                    required
                />
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'הוסף'}
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
    );
};

export default UserManager;