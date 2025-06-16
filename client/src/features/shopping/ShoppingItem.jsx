// client/src/features/shopping/ShoppingItem.jsx
import React, { useState, useContext } from 'react';
import HomeContext from '../../context/HomeContext.jsx';
import { Check, Trash, Plus, ChevronDown, ChevronRight } from 'lucide-react';

const ShoppingItem = ({ item, homeId }) => {
    const { updateShoppingItem, addSubItem, updateSubItem, deleteSubItem } = useContext(HomeContext);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(item.name);
    const [newSubItemName, setNewSubItemName] = useState('');
    const [showSubItems, setShowSubItems] = useState(false);

    const handleUpdate = () => {
        updateShoppingItem(homeId, item._id, { name, isCompleted: !item.isCompleted });
    };
    
    const handleNameChange = (e) => {
        if(e.key === 'Enter') {
            updateShoppingItem(homeId, item._id, { name });
            setIsEditing(false);
        }
    };

    const handleAddSubItem = (e) => {
        e.preventDefault();
        if (newSubItemName.trim()) {
            addSubItem(homeId, item._id, { name: newSubItemName });
            setNewSubItemName('');
        }
    };

    return (
        <div className="p-2 border-b">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button onClick={handleUpdate} className="mr-2">
                        <Check className={item.isCompleted ? "text-green-500" : "text-gray-300"} />
                    </button>
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            onKeyDown={handleNameChange}
                            onBlur={() => setIsEditing(false)}
                            autoFocus
                            className="text-lg"
                        />
                    ) : (
                        <span 
                            onDoubleClick={() => setIsEditing(true)}
                            className={`text-lg ${item.isCompleted ? 'line-through text-gray-500' : ''}`}
                        >
                            {item.name}
                        </span>
                    )}
                </div>
                <div>
                     <button onClick={() => setShowSubItems(!showSubItems)} className="mr-2">
                        {showSubItems ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <button onClick={() => updateShoppingItem(homeId, item._id, { isArchived: true })} className="mr-2">
                        <Trash className="text-red-500" size={20} />
                    </button>
                </div>
            </div>
            {showSubItems && (
                 <div className="ml-8 mt-2">
                     {item.subItems && item.subItems.map(sub => (
                         <div key={sub._id} className="flex items-center justify-between text-sm">
                             <div className="flex items-center">
                                 <button onClick={() => updateSubItem(homeId, item._id, sub._id, { isCompleted: !sub.isCompleted })} className="mr-2">
                                     <Check className={sub.isCompleted ? "text-green-500" : "text-gray-300"} size={16} />
                                 </button>
                                 <span className={sub.isCompleted ? 'line-through text-gray-500' : ''}>{sub.name}</span>
                             </div>
                             <button onClick={() => deleteSubItem(homeId, item._id, sub._id)}>
                                 <Trash className="text-red-400" size={16} />
                             </button>
                         </div>
                     ))}
                    <form onSubmit={handleAddSubItem} className="flex items-center mt-2">
                        <input 
                            type="text" 
                            value={newSubItemName} 
                            onChange={(e) => setNewSubItemName(e.target.value)} 
                            placeholder="Add sub-item"
                            className="text-sm p-1 border rounded w-full"
                        />
                         <button type="submit" className="ml-2"><Plus size={20}/></button>
                    </form>
                 </div>
            )}
        </div>
    );
};

export default ShoppingItem;
