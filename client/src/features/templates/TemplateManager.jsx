import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import { useListActions } from '@/context/ListActionsContext'; // Import list actions for applying templates
import TemplateForm from './forms/TemplateForm'; 

/**
 * A central component for viewing, applying, creating, editing, and deleting templates.
 */
const TemplateManager = () => {
    const { activeHome, updateHome, loading } = useAppContext();
    const { applyTemplate } = useListActions();
    const { showModal, hideModal, showConfirmModal } = useModal();
    const [filter, setFilter] = useState('all');

    const templates = useMemo(() => activeHome?.templates || [], [activeHome]);

    const filteredTemplates = useMemo(() => {
        if (filter === 'all') return templates;
        return templates.filter(t => t.type === filter);
    }, [templates, filter]);

    const openTemplateForm = (template = null, index = null) => {
        showModal(
            <TemplateForm
                templateToEdit={template}
                templateIndex={index}
                onSuccess={hideModal}
            />,
            { title: template ? 'עריכת תבנית' : 'יצירת תבנית חדשה' }
        );
    };

    /**
     * Handles applying a template to the corresponding list.
     */
    const handleApplyTemplate = (template) => {
        if (applyTemplate) {
            applyTemplate(template);
            hideModal(); // Close the manager after applying
        }
    };
    
    /**
     * Handles deleting a template from the home object.
     */
    const handleDeleteTemplate = (templateToDelete) => {
        showConfirmModal(
            `האם אתה בטוח שברצונך למחוק את התבנית "${templateToDelete.name}"?`,
            async () => {
                const updatedTemplates = activeHome.templates.filter(
                    t => t._id !== templateToDelete._id
                );
                // Use the updateHome function from AppContext to save the change
                await updateHome({ templates: updatedTemplates });
            }
        );
    };

    const getIconForType = (type) => {
        if (type === 'shopping') return 'fa-shopping-cart';
        if (type === 'tasks') return 'fa-tasks';
        return 'fa-file-alt';
    };

    return (
        <div className="template-manager">
            <header className="template-manager-header">
                <h3>ניהול תבניות</h3>
                <button onClick={() => openTemplateForm()} className="create-template-btn">
                    <i className="fas fa-plus"></i> צור תבנית חדשה
                </button>
            </header>

            <div className="template-filters">
                <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''} disabled={loading}>הכל</button>
                <button onClick={() => setFilter('shopping')} className={filter === 'shopping' ? 'active' : ''} disabled={loading}>קניות</button>
                <button onClick={() => setFilter('tasks')} className={filter === 'tasks' ? 'active' : ''} disabled={loading}>משימות</button>
            </div>

            <ul className="templates-list">
                {loading && templates.length === 0 ? (
                    <p>טוען תבניות...</p>
                ) : filteredTemplates.length === 0 ? (
                    <p className="no-templates-message">לא נמצאו תבניות. נסה ליצור אחת!</p>
                ) : (
                    filteredTemplates.map((template, index) => (
                        <li key={template._id || index} className="template-card">
                            <div className="template-card-header">
                                <i className={`fas ${getIconForType(template.type)} template-icon`}></i>
                                <span className="template-name">{template.name}</span>
                            </div>
                            <p className="template-item-count">{template.items.length} פריטים בתבנית</p>
                            <div className="template-card-actions">
                                <button onClick={() => openTemplateForm(template, index)} className="action-btn edit-btn" disabled={loading}>ערוך</button>
                                <button onClick={() => handleDeleteTemplate(template)} className="action-btn delete-btn" disabled={loading}>מחק</button>
                                <button onClick={() => handleApplyTemplate(template)} className="action-btn apply-btn" disabled={loading}>החל תבנית</button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default TemplateManager;
