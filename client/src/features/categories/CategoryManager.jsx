import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * A component for adding, editing, and deleting custom list categories.
 */
const CategoryManager = () => {
    const { activeHome, updateHome, loading, setError, error } = useAppContext();
    const { hideModal, showConfirmModal } = useModal();
    
    // State to hold the list of categories being edited
    const [categories, setCategories] = useState([]);
    // State for the new category input field
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        // Initialize the component's state with the categories from the active home
        if (activeHome?.listCategories) {
            setCategories(activeHome.listCategories);
        }
        // Clear any global errors when the component mounts
        setError(null);
    }, [activeHome, setError]);

    /**
     * Handles adding a new category to the temporary list.
     */
    const handleAddCategory = () => {
        const trimmedCategory = newCategory.trim();
        if (trimmedCategory && !categories.includes(trimmedCategory)) {
            setCategories([...categories, trimmedCategory]);
            setNewCategory(''); // Clear the input field
        }
    };

    /**
     * Handles removing a category from the temporary list.
     */
    const handleRemoveCategory = (categoryToRemove) => {
        // Prevent removal of the 'כללית' category
        if (categoryToRemove === 'כללית') {
            setError('לא ניתן למחוק את קטגוריית "כללית".');
            return;
        }
        showConfirmModal(
            `האם אתה בטוח שברצונך למחוק את הקטגוריה "${categoryToRemove}"?`,
            () => {
                setCategories(categories.filter(cat => cat !== categoryToRemove));
            }
        );
    };

    /**
     * Handles the final submission of the updated categories list.
     */
    const handleSave = async () => {
        setError(null);
        try {
            // Use the updateHome function from AppContext to save the changes
            await updateHome({ listCategories: categories });
            hideModal();
        } catch (err) {
            // The error is already set in AppContext, but we can log it here if needed
            console.error("Failed to save categories:", err);
        }
    };

    return (
        <div className="category-manager">
            <h3 className="form-title">ניהול קטגוריות לרשימות</h3>
            <p className="form-subtitle">הוסף או מחק קטגוריות לשימוש ברשימות הקניות והמטלות.</p>

            <div className="add-category-section">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="שם קטגוריה חדשה..."
                    className="category-input"
                />
                <button type="button" onClick={handleAddCategory} className="add-btn" disabled={!newCategory.trim()}>
                    <i className="fas fa-plus"></i>
                </button>
            </div>

            <div className="categories-list-wrapper">
                {categories.length === 0 ? (
                    <p className="no-categories-msg">אין קטגוריות להצגה.</p>
                ) : (
                    <ul className="categories-list">
                        {categories.map((cat, index) => (
                            <li key={index} className="category-item">
                                <span>{cat}</span>
                                <button
                                    className="remove-btn"
                                    onClick={() => handleRemoveCategory(cat)}
                                    disabled={cat === 'כללית'}
                                    title={cat === 'כללית' ? 'לא ניתן למחוק קטגוריה ראשית' : 'מחק קטגוריה'}
                                >
                                    <i className="fas fa-times"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {error && <p className="error-message">{error}</p>}

            <div className="modal-footer">
                <button onClick={handleSave} className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : 'שמור שינויים'}
                </button>
                <button type="button" className="secondary-action" onClick={hideModal}>בטל</button>
            </div>
        </div>
    );
};

export default CategoryManager;

