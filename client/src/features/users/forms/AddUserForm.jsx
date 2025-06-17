import React, { useState } from 'react';
import { useHome } from '../../../context/HomeContext';

const AddUserForm = () => {
  const { addUser } = useHome();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    addUser(name.trim());
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