import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext'; // ✅ Fixed import

const AddUserForm = () => {
  const { addHomeUser } = useAppContext();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHomeUser(name.trim()); // שינוי: מ-addUser ל-addHomeUser
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
      <input 
        type="text" 
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="שם בן/בת הבית"
        style={{ flexGrow: 1, margin: 0 }}
      />
      <button type="submit" className="primary-action" style={{ padding: '10px 15px' }}>הוסף</button>
    </form>
  );
};

export default AddUserForm;