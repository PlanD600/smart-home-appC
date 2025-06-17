import React, { useState, useEffect } from 'react';
import { useHome } from '../context/HomeContext.jsx'; 
import { useModal } from '../context/ModalContext.jsx'; 
import ShoppingList from '../features/shopping/ShoppingList.jsx'; 
import TaskList from '../features/tasks/TaskList.jsx'; 
import FinanceManagement from '../features/finance/FinanceManagement.jsx'; 
import ArchiveView from '../components/ArchiveView.jsx'; 
import TemplateForm from '../features/templates/froms/TemplateForm.jsx'; 
import TemplateManager from '../features/templates/TemplateManager.jsx'; 
import LoginScreen from './LoginScreen.jsx'; // Fallback import

/**
 * @file MainAppScreen component
 * @description Renders the main application interface, including header, navigation tabs,
 * and different feature sections (Shopping List, Task List, Finance Management).
 */
const MainAppScreen = () => {
  const { currentHome, logout, updateCurrentHome } = useHome();
  const { showModal, hideModal, showAlert, showConfirm } = useModal();

  // State to manage the currently active tab
  const [activeTab, setActiveTab] = useState('shopping-list');

  // Effect to set the initial active tab from local storage or default
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Effect to save the active tab to local storage when it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const handleLogout = () => {
    showConfirm("האם אתה בטוח שברצונך להתנתק?", "התנתקות", () => {
      logout();
    });
  };

  const handleViewArchive = () => {
    showModal('צפייה בארכיון', <ArchiveView onClose={hideModal} />);
  };

  const handleAddUser = () => {
    const handleSave = async (newUserName) => {
        if (!newUserName || !newUserName.trim()) {
            return showAlert("שם המשתמש אינו יכול להיות ריק.", "שגיאה");
        }
        if (currentHome.users.includes(newUserName.trim())) {
            return showAlert("משתמש בשם זה כבר קיים.", "שגיאה");
        }
        try {
            await updateCurrentHome({ users: [...currentHome.users, newUserName.trim()] });
            hideModal();
            showAlert("המשתמש נוסף בהצלחה!", "הצלחה");
        } catch (error) {
            showAlert("שגיאה בהוספת המשתמש.", "שגיאה");
        }
    };

    showModal('הוספת משתמש חדש', (
        <div>
            <label htmlFor="new-user-input" className="block mb-2">שם המשתמש:</label>
            <input id="new-user-input" type="text" className="w-full p-2 border rounded" />
        </div>
    ), [
        { text: 'שמור', onClick: () => handleSave(document.getElementById('new-user-input').value) },
        { text: 'בטל', onClick: hideModal }
    ]);
  };

  const handleManageUsers = () => {
    const handleDelete = (userToDelete) => {
        showConfirm(`האם למחוק את המשתמש "${userToDelete}"? כל הפריטים המשויכים יועברו ל'משותף'.`, "אישור מחיקה", async () => {
            const updatedUsers = currentHome.users.filter(user => user !== userToDelete);
            
            // Reassign items
            const reassign = (item) => item.assignedTo === userToDelete ? { ...item, assignedTo: 'משותף' } : item;
            const updatedShoppingItems = currentHome.shoppingItems.map(reassign);
            const updatedTaskItems = currentHome.tasks.map(reassign);

            await updateCurrentHome({ 
              users: updatedUsers,
              shoppingItems: updatedShoppingItems,
              tasks: updatedTaskItems
            });
            hideModal();
            handleManageUsers(); // Re-open the modal to show the updated list
        });
    };

    showModal('ניהול משתמשים', (
        <div className="space-y-2">
            {currentHome.users.map(user => (
                <div key={user} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span>{user}</span>
                    <button onClick={() => handleDelete(user)} className="text-red-500 hover:text-red-700">מחק</button>
                </div>
            ))}
        </div>
    ), [{ text: 'סגור', onClick: hideModal }]);
  };

  const handleCreateTemplate = () => {
    showModal('יצירת תבנית חדשה', <TemplateForm onClose={hideModal} />);
  };

  const handleManageTemplates = () => {
    showModal('ניהול תבניות', <TemplateManager onClose={hideModal} />);
  };
  
  const handleLanguageSwitch = (lang) => {
    showAlert(`Language switching to "${lang}" is not yet implemented.`, "Information");
  };

  if (!currentHome) {
    return <div className="flex justify-center items-center h-screen">טוען נתונים...</div>;
  }

  const currentLang = 'he'; // Placeholder for language state

  return (
    <div id="main-app-screen" className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center flex-wrap gap-y-2">
        <div className="flex-grow min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate" title={currentHome.name}>
            בית: {currentHome.name}
          </h1>
          <p className="text-sm text-gray-500">קוד גישה: {currentHome.accessCode}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div id="language-switcher" className="language-switcher flex border rounded-md">
            <button data-lang="he" className={`px-2 py-1 text-sm ${currentLang === 'he' ? 'bg-blue-500 text-white' : ''}`} onClick={() => handleLanguageSwitch('he')}>עב</button>
            <button data-lang="en" className={`px-2 py-1 text-sm ${currentLang === 'en' ? 'bg-blue-500 text-white' : ''}`} onClick={() => handleLanguageSwitch('en')}>EN</button>
          </div>
          <button className="bg-gray-200 p-2 rounded hover:bg-gray-300" title="הוסף משתמש" onClick={handleAddUser}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>
          </button>
          <button className="bg-gray-200 p-2 rounded hover:bg-gray-300" title="נהל משתמשים" onClick={handleManageUsers}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
          </button>
          <button className="bg-gray-200 p-2 rounded hover:bg-gray-300" title="נהל תבניות" onClick={handleManageTemplates}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>
          </button>
          <button className="bg-gray-200 p-2 rounded hover:bg-gray-300" title="ארכיון" onClick={handleViewArchive}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
          </button>
          <button className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600" onClick={handleLogout}>
            התנתק
          </button>
        </div>
      </header>

      <nav className="flex justify-center bg-white border-b">
        <button
          className={`px-4 py-3 text-sm font-medium ${activeTab === 'shopping-list' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => handleTabChange('shopping-list')}
        >
          רשימת קניות
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium ${activeTab === 'task-list' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => handleTabChange('task-list')}
        >
          רשימת מטלות
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium ${activeTab === 'finance-management' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => handleTabChange('finance-management')}
        >
          ניהול כספים
        </button>
      </nav>

      <main className="p-4">
        {activeTab === 'shopping-list' && <ShoppingList />}
        {activeTab === 'task-list' && <TaskList />}
        {activeTab === 'finance-management' && <FinanceManagement />}
      </main>
    </div>
  );
};

export default MainAppScreen;
