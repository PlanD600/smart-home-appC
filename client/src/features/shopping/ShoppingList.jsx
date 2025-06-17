import React from 'react';
import { useHome } from '../../context/HomeContext';
import AddItemForm from '../common/AddItemForm';
import ShoppingItem from './ShoppingItem';
import LoadingSpinner from '../../components/LoadingSpinner';

const ShoppingList = () => {
  const { activeHome, addItemToList, isLoading } = useHome();

  if (!activeHome) {
    return <p>טוען נתונים...</p>;
  }

  const { shoppingItems, shoppingCategories } = activeHome;

  const handleAddItem = (itemData) => {
    addItemToList('shopping', itemData);
  };
  
  return (
    <section id="shopping-list" className="list-section active">
      <div className="list-title-container">
        <h3><span>רשימת קניות</span></h3>
        <div className="list-title-actions">
          {/* Gemini and other buttons can be wired up later */}
          <button className="header-style-button gemini-btn">✨ <span>הפוך מתכון לרשימה</span></button>
        </div>
      </div>
      
      {/* We can add filters here later */}
      <div className="list-filters">
        <label>קטגוריה:</label>
        <select className="category-filter">
          <option value="all">הכל</option>
          {shoppingCategories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      
      <div className="add-area">
        <AddItemForm 
          onAddItem={handleAddItem}
          categories={shoppingCategories || ['כללית']}
          placeholder="הוסף פריט חדש לקניות..."
        />
      </div>
      
      {isLoading && <LoadingSpinner />}

      <div className="item-list">
        <ul className="item-list-ul">
          {shoppingItems && shoppingItems.length > 0 ? (
            shoppingItems.map(item => (
              <ShoppingItem key={item._id} item={item} />
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