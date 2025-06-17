import React, { useState } from 'react';
import { useHome } from '../../context/HomeContext';

const AddItemForm = ({ onAddItem, categories, placeholder }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState('כללית');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onAddItem({ text, category });
      setText(''); // Clear input after adding
    }
  };

  return (
    <form className="add-item-form" onSubmit={handleSubmit}>
      <select 
        className="add-item-category-select" 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
      >
        {/* Ensure "כללית" is always an option */}
        {!categories.includes('כללית') && <option value="כללית">כללית</option>}
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <input 
        type="text" 
        className="add-item-input" 
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="add-item-btn">
        <i className="fas fa-plus"></i>
      </button>
    </form>
  );
};

export default AddItemForm;