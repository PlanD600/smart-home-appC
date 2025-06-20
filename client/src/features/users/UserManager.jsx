// client/src/features/users/UserManager.jsx

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const UserManager = () => {
    const { activeHome, addHomeUser, removeHomeUser, loading, error } = useAppContext();
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

    const confirmRemoveUser = (user) => {
        if (activeHome.users.length <= 1) {
            alert("לא ניתן להסיר את בן הבית היחיד.");
            return;
        }

        showModal(
            <div>
                <p>האם אתה בטוח שברצונך להסיר את {user.name} מהבית?</p>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={hideModal} className="btn btn-secondary">ביטול</button>
                    <button onClick={() => handleRemoveUser(user.name)} className="btn btn-danger">הסר</button>
                </div>
            </div>,
            { title: 'אישור מחיקה' }
        );
    };

    const handleRemoveUser = async (userName) => {
        await removeHomeUser(userName);
        hideModal();
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
                        <li key={user._id} className="flex items-center justify-between p-3 bg-white rounded-md shadow-sm transition-shadow hover:shadow-md">
                            <span className="text-gray-700 font-medium">{user.name}</span>
                            {user.isAdmin && <span className="admin-tag text-blue-600 text-xs font-semibold mr-2">(מנהל)</span>}
                            {activeHome.users.length > 1 && (
                                <button
                                    onClick={() => confirmRemoveUser(user)}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                    aria-label={`הסר את ${user.name}`}
                                >
                                    <i className="fas fa-trash-alt"></i>
                                </button>
                            )}
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
                    className="input input-bordered flex-grow p-2 border rounded-md"
                    required
                />
                <button type="submit" className="btn btn-primary bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'הוסף'}
                </button>
            </form>
            {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
        </div>
    );
};

export default UserManager;