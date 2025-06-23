import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import LoadingSpinner from '@/components/LoadingSpinner';

const TemplateForm = ({ onSuccess, templateToEdit, templateIndex }) => {
    // We need the currentUser to set the 'createdBy' field on items
    const { activeHome, currentUser, updateHome, loading, setError, error } = useAppContext();
    const { hideModal } = useModal();

    const [name, setName] = useState('');
    const [type, setType] = useState('shopping');
    const [items, setItems] = useState([{ text: '' }]);
    const [localError, setLocalError] = useState('');

    const isEditMode = templateToEdit && templateIndex != null;

    useEffect(() => {
        if (templateToEdit) {
            setName(templateToEdit.name || '');
            setType(templateToEdit.type || 'shopping');
            // Ensure we map to a new array to avoid state mutation issues
            setItems(templateToEdit.items.map(item => ({ text: item.text || '' })));
        }
        setError(null);
    }, [templateToEdit, setError]);

    const handleItemChange = (index, value) => {
        const newItems = [...items];
        newItems[index].text = value;
        setItems(newItems);
    };

    const handleAddItem = () => {
        setItems([...items, { text: '' }]);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!name.trim()) {
            setLocalError("יש להזין שם לתבנית.");
            return;
        }

        const filteredItems = items.filter(item => item.text.trim() !== '');
        if (filteredItems.length === 0) {
            setLocalError("יש להוסיף לפחות פריט אחד לתבנית.");
            return;
        }

        const newTemplate = {
            // If editing, use the existing _id. If creating, let Mongoose generate it on the backend.
            _id: isEditMode ? templateToEdit._id : undefined,
            name: name.trim(),
            type: type,
            // [FIX] Add the 'createdBy' field to each item in the template, regardless of type.
            items: filteredItems.map(item => ({
                text: item.text.trim(),
                createdBy: currentUser, // This is the crucial fix
            })),
        };

        const updatedTemplates = [...(activeHome.templates || [])];
        if (isEditMode) {
            updatedTemplates[templateIndex] = newTemplate;
        } else {
            // For new templates, remove the undefined _id property before sending
            delete newTemplate._id;
            updatedTemplates.push(newTemplate);
        }

        // The updateHome function will send the entire updated templates array to the backend.
        const success = await updateHome({ templates: updatedTemplates });
        if (success) {
            onSuccess();
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="template-form">
            <h4 className="form-title">{isEditMode ? 'עריכת תבנית' : 'יצירת תבנית חדשה'}</h4>

            <div className="form-group">
                <label htmlFor="template-name">שם התבנית</label>
                <input
                    type="text"
                    id="template-name"
                    placeholder="לדוגמה: קניות שבועיות"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            
            <div className="form-group">
                <label>סוג התבנית</label>
                <div className="type-selector">
                    <button type="button" onClick={() => setType('shopping')} className={type === 'shopping' ? 'active' : ''}><i className="fas fa-shopping-cart"></i> קניות</button>
                    <button type="button" onClick={() => setType('tasks')} className={type === 'tasks' ? 'active' : ''}><i className="fas fa-tasks"></i> מטלות</button>
                </div>
            </div>

            <div className="form-group">
                <label>פריטים</label>
                <div className="items-container">
                    {items.map((item, index) => (
                        <div className="item-row" key={index}>
                            <input
                                type="text"
                                placeholder={`שם פריט ${index + 1}`}
                                value={item.text}
                                onChange={(e) => handleItemChange(index, e.target.value)}
                            />
                            {items.length > 1 && (
                                <button type="button" className="remove-item-btn" onClick={() => handleRemoveItem(index)} aria-label="Remove item">
                                    <i className="fas fa-times"></i>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button type="button" className="add-item-btn" onClick={handleAddItem}>
                    <i className="fas fa-plus"></i> הוסף פריט
                </button>
            </div>
            
            {(localError || error) && <p className="error-message">{localError || error}</p>}

            <div className="modal-footer">
                <button type="submit" className="primary-action" disabled={loading}>
                    {loading ? <LoadingSpinner size="sm" /> : (isEditMode ? 'שמור שינויים' : 'צור תבנית')}
                </button>
                <button type="button" className="secondary-action" onClick={hideModal}>בטל</button>
            </div>
        </form>
    );
};

export default TemplateForm;
