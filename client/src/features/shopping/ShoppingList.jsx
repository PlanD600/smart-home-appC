import React from 'react';
import { useHome } from '../../context/HomeContext';
import AddItemForm from '../common/AddItemForm';
import ShoppingItem from './ShoppingItem';
import LoadingSpinner from '../../components/LoadingSpinner';

const ShoppingList = () => {
  const { activeHome, saveItem, loading, modifyItem, removeItem } = useHome(); // הוספתי modifyItem, removeItem

  if (!activeHome) {
    return <p>טוען נתונים...</p>;
  }

  // **תיקון: שינוי מ-shoppingItems ל-shoppingList. הסרנו shoppingCategories**
  const shoppingList = activeHome.shoppingList || []; 

  const handleAddItem = (itemData) => {
    saveItem('shopping', itemData);
  };

  // ממיין את המערך לפני ההצגה. פריטים עם isUrgent=true יופיעו ראשונים.
  const sortedItems = [...shoppingList].sort((a, b) => Number(b.isUrgent) - Number(a.isUrgent));
  
  return (
    <section id="shopping-list" className="list-section active">
      <div className="list-title-container">
        <h3><span>רשימת קניות</span></h3>
        <div className="list-title-actions">
          <button className="header-style-button gemini-btn">✨ <span>הפוך מתכון לרשימה</span></button>
        </div>
      </div>
      
      {/* **תיקון: הסרת אזור הסינון לפי קטגוריות, מכיוון ש-shoppingCategories הוסר מהמודל** */}
      {/* <div className="list-filters">
        <label>קטגוריה:</label>
        <select className="category-filter">
          <option value="all">הכל</option>
          {shoppingCategories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div> */}
      
      <div className="add-area">
        <AddItemForm 
          onAddItem={handleAddItem}
          // **תיקון: הסרת categories prop שהיה מבוסס על shoppingCategories**
          // ניתן להחזיר רשימת קטגוריות סטטית אם נחוץ, או לתת ל-AddItemForm לנהל את הקטגוריות שלו
          placeholder="הוסף פריט חדש לקניות..."
        />
      </div>
      
      {loading && <LoadingSpinner />} 

      <div className="item-list">
        <ul className="item-list-ul">
          {sortedItems && sortedItems.length > 0 ? (
            sortedItems.map(item => (
              <ShoppingItem 
                key={item._id} 
                item={item} 
                listType="shopping" // חשוב להעביר את listType
                onUpdate={modifyItem} // העברת פונקציות העדכון והמחיקה
                onDelete={removeItem} 
              />
            ))
          ) : (
            <li style={{ textAlign: 'center', padding: '15px', color: '#777' }}>
              הרשימה ריקה, אפשר להתחיל להוסיף פריטים!
            </li>
          )}
        </ul>
      </div>
      
      <div className="list-footer">
        <button className="clear-list-btn">
          <i className="fas fa-trash-alt"></i> <span>נקה הכל</span>
        </button>
      </div>
    </section>
  );
};

export default ShoppingList;