import React from 'react';
import { useHome } from 'src/context/HomeContext.jsx'; // נתיב יבוא תקין
import { useModal } from 'src/context/ModalContext.jsx'; // נתיב יבוא תקין
import TemplateForm from 'src/features/templates/froms/TemplateForm.jsx'; // נתיב יבוא תקין
/**
 * @file TemplateManager component
 * @description Displays and manages a list of templates (shopping, task, finance).
 * Allows editing and deleting templates.
 * @param {object} props - Component props
 * @param {function} props.onClose - Function to close the modal (if used inside a modal)
 */
const TemplateManager = ({ onClose }) => {
  const { currentHome, updateCurrentHome, loading } = useHome();
  const { showModal, hideModal, showAlert, showConfirm } = useModal();

  // If home data is loading, show a loading message or spinner
  if (loading) {
    return <div className="modal-loader"><div className="spinner"></div></div>;
  }

  // Ensure currentHome and templates exist
  if (!currentHome || !currentHome.templates) {
    return <p style={{ textAlign: 'center', padding: '15px', color: '#777' }}>לא קיימות תבניות להצגה.</p>;
  }

  /**
   * Handles editing an existing template.
   * Opens the TemplateForm modal with the selected template's data.
   * @param {object} template - The template object to edit.
   * @param {number} index - The index of the template in the templates array.
   */
  const handleEditTemplate = (template, index) => {
    showModal(
      'עריכת תבנית',
      <TemplateForm onClose={hideModal} templateToEdit={template} templateIndex={index} />
    );
  };

  /**
   * Handles deleting a template.
   * Shows a confirmation dialog before deletion.
   * @param {string} templateName - The name of the template to delete (for confirmation message).
   * @param {number} index - The index of the template to delete from the array.
   */
  const handleDeleteTemplate = (templateName, index) => {
    showConfirm(
      `האם למחוק את התבנית "${templateName}"?`,
      "אישור מחיקה",
      async () => {
        if (!currentHome) return;
        const updatedTemplates = [...currentHome.templates];
        updatedTemplates.splice(index, 1); // Remove the template at the given index

        try {
          await updateCurrentHome({ templates: updatedTemplates });
          showAlert(`התבנית "${templateName}" נמחקה בהצלחה.`, "הצלחה");
          // If this component is in a modal, it will re-render automatically due to currentHome update
        } catch (error) {
          console.error("Failed to delete template:", error);
          showAlert("שגיאה במחיקת התבנית. נסה שוב.", "שגיאה");
        }
      }
    );
  };

  const typeMap = { shopping: 'קניות', task: 'מטלות', finance: 'כספים' };

  return (
    <div>
      {currentHome.templates.length === 0 ? (
        <p style={{ textAlign: 'center', padding: '15px', color: '#777' }}>עדיין לא יצרת תבניות.</p>
      ) : (
        <ul className="manage-list">
          {currentHome.templates.map((template, index) => (
            <li key={index} data-index={index}>
              <span className="template-info">
                <i className="fas fa-file-alt" aria-hidden="true"></i>
                <strong>{template.name}</strong>
                <small>({typeMap[template.type] || template.type})</small>
              </span>
              <div className="item-actions">
                <button
                  className="action-btn edit-template-btn"
                  aria-label={`ערוך תבנית ${template.name}`}
                  onClick={() => handleEditTemplate(template, index)}
                >
                  ערוך
                </button>
                <button
                  className="action-btn delete-template-btn"
                  aria-label={`מחק תבנית ${template.name}`}
                  onClick={() => handleDeleteTemplate(template.name, index)}
                >
                  מחק
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {onClose && (
        <div className="modal-footer">
          <button className="secondary-action" onClick={onClose}>
            סגור
          </button>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;
