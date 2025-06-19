// client/src/components/HomeCard.jsx

import React from 'react';

/**
 * קומפוננטת כרטיס בית המציגה פרטי בית בסיסיים
 * ומאפשרת בחירה או לחיצה.
 * @param {object} props.home - אובייקט הבית להצגה (כולל _id, name, iconClass, colorClass).
 * @param {function} [props.onClick] - פונקציה שתופעל בלחיצה על הכרטיס.
 * @param {boolean} [props.isSelected] - האם הכרטיס מסומן כנבחר (לצורך UI).
 */
const HomeCard = ({ home, onClick, isSelected }) => {
  // נשתמש בערכי ברירת מחדל אם iconClass או colorClass חסרים
  const iconClass = home.iconClass || 'fas fa-home';
  const colorClass = home.colorClass || 'card-color-1'; // זהו class CSS המגדיר צבע
  
  return (
    <div
      // שימוש ב-colorClass וב-isSelected לצורך סגנון
      // לדוגמה, אתה יכול להגדיר את הקלאסים האלה ב-CSS/Tailwind שלך:
      // .home-card { ... }
      // .card-color-1 { background-color: var(--mint-green); }
      // .selected { border: 2px solid blue; }
      className={`home-card p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 
                  ${colorClass} ${isSelected ? 'border-2 border-blue-500' : ''}`}
      onClick={() => onClick && onClick(home)} // העבר את אובייקט הבית בלחיצה
    >
      <div className="home-card-icon text-4xl text-white mb-2 text-center">
        <i className={iconClass}></i> {/* רנדור האייקון כאן */}
      </div>
      <h3 className="home-card-name text-lg font-semibold text-gray-800 text-center">
        {home.name}
      </h3>
    </div>
  );
};

export default HomeCard;
