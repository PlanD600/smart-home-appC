import React, { useContext } from 'react';
import { HomeContext } from '../context/HomeContext.jsx';

function ArchiveView() {
    const { activeHome, restoreItemFromArchive, deleteItemPermanently } = useContext(HomeContext);
    const { archivedShopping, archivedTasks } = activeHome;

    const renderArchivedList = (items, itemType) => {
        if (!items || items.length === 0) return null;
        return (
            <ul>
                {items.map(item => (
                    <li key={item._id}>
                        <div className="item-text">{item.text}</div>
                        <div className="item-actions">
                            <button onClick={() => restoreItemFromArchive(itemType, item._id)} title="שחזר">
                                <i className="fas fa-undo"></i>
                            </button>
                            <button onClick={() => deleteItemPermanently(itemType, item._id)} title="מחק לצמיתות">
                                <i className="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            <h5>קניות בארכיון</h5>
            {renderArchivedList(archivedShopping, 'shoppingItems') || <p>אין פריטי קניות בארכיון.</p>}
            <hr />
            <h5>מטלות בארכיון</h5>
            {renderArchivedList(archivedTasks, 'taskItems') || <p>אין מטלות בארכיון.</p>}
        </div>
    );
}

export default ArchiveView;