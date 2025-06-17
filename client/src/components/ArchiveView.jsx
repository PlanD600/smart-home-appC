import React from 'react';
import { useHome } from 'src/context/HomeContext.jsx'; // נתיב יבוא תקין
import { useModal } from 'src/context/ModalContext.jsx'; // נתיב יבוא תקין

/**
 * @file ArchiveView component
 * @description Displays archived shopping and task items and provides functionality
 * to restore them to active lists or delete them permanently.
 * @param {object} props - Component props
 * @param {function} props.onClose - Function to close the modal (if used inside a modal)
 */
const ArchiveView = ({ onClose }) => {
  const { currentHome, updateCurrentHome, loading } = useHome();
  const { showAlert, showConfirm } = useModal();

  // If home data is loading, show a loading message or spinner
  if (loading) {
    return <div className="modal-loader"><div className="spinner"></div></div>;
  }

  // Ensure currentHome exists and has archive arrays
  if (!currentHome || (!currentHome.archivedShopping?.length && !currentHome.archivedTasks?.length)) {
    return <p style={{ textAlign: 'center', padding: '15px', color: '#777' }}>הארכיון ריק.</p>;
  }

  /**
   * Handles restoring an item from the archive to its respective active list.
   * @param {string} type - 'shopping' or 'task'
   * @param {string} itemId - The ID of the item to restore
   */
  const handleRestoreFromArchive = async (type, itemId) => {
    if (!currentHome) return;

    const sourceArchiveArray = type === 'shopping' ? [...currentHome.archivedShopping] : [...currentHome.archivedTasks];
    const targetActiveArrayName = type === 'shopping' ? 'shoppingItems' : 'taskItems';

    const itemIndex = sourceArchiveArray.findIndex(i => i.id === itemId);

    if (itemIndex > -1) {
      const [itemToRestore] = sourceArchiveArray.splice(itemIndex, 1); // Remove from archive
      const updatedActiveArray = [...currentHome[targetActiveArrayName], itemToRestore]; // Add to active

      const updates = {
        [type === 'shopping' ? 'archivedShopping' : 'archivedTasks']: sourceArchiveArray,
        [targetActiveArrayName]: updatedActiveArray,
      };

      try {
        await updateCurrentHome(updates);
        showAlert("הפריט שוחזר בהצלחה!", "הצלחה");
      } catch (error) {
        console.error("Failed to restore item from archive:", error);
        showAlert("שגיאה בשחזור פריט מהארכיון. נסה שוב.", "שגיאה");
      }
    }
  };

  /**
   * Handles permanently deleting an item from the archive.
   * @param {string} type - 'shopping' or 'task'
   * @param {string} itemId - The ID of the item to delete
   * @param {string} itemText - The text of the item for confirmation.
   */
  const handleDeleteFromArchive = async (type, itemId, itemText) => {
    showConfirm(
      `האם למחוק את הפריט "${itemText}" לצמיתות מהארכיון?`,
      "אישור מחיקה סופית",
      async () => {
        if (!currentHome) return;

        const updatedArchiveArray = (type === 'shopping' ? [...currentHome.archivedShopping] : [...currentHome.archivedTasks])
                                   .filter(item => item.id !== itemId);

        const updates = {
          [type === 'shopping' ? 'archivedShopping' : 'archivedTasks']: updatedArchiveArray,
        };

        try {
          await updateCurrentHome(updates);
          showAlert("הפריט נמחק לצמיתות.", "הצלחה");
        } catch (error) {
          console.error("Failed to delete item from archive:", error);
          showAlert("שגיאה במחיקת פריט מהארכיון. נסה שוב.", "שגיאה");
        }
      }
    );
  };

  /**
   * Helper function to render a list of archived items.
   * @param {string} title - Title for the section (e.g., 'קניות בארכיון')
   * @param {Array} items - Array of archived items
   * @param {string} type - 'shopping' or 'task'
   */
  const renderArchivedList = (title, items, type) => {
    if (!items || items.length === 0) return null;

    return (
      <>
        <h5>{title}</h5>
        <ul className="manage-list">
          {items.map(item => (
            <li key={item.id} data-id={item.id} data-type={type}>
              <span>{item.text}</span>
              <div className="item-actions">
                <button
                  className="action-btn restore-archive-btn"
                  title="שחזר"
                  aria-label={`שחזר את ${item.text}`}
                  onClick={() => handleRestoreFromArchive(type, item.id)}
                >
                  <i className="fas fa-undo" aria-hidden="true"></i>
                </button>
                <button
                  className="action-btn delete-archive-btn"
                  title="מחק לצמיתות"
                  aria-label={`מחק לצמיתות את ${item.text}`}
                  onClick={() => handleDeleteFromArchive(type, item.id, item.text)}
                >
                  <i className="far fa-trash-alt" aria-hidden="true"></i>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <div>
      {renderArchivedList('קניות בארכיון', currentHome.archivedShopping, 'shopping')}
      {renderArchivedList('מטלות בארכיון', currentHome.archivedTasks, 'task')}

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

export default ArchiveView;
