import React from 'react';

/**
 * A display card for a single "Home".
 * Renders the home's name and icon with a specific color scheme.
 * It is clickable and accessible via keyboard.
 *
 * @param {object} props - The component props.
 * @param {object} props.home - The home object to display.
 * @param {string} props.home.name - The name of the home.
 * @param {string} [props.home.iconClass='fas fa-home'] - The Font Awesome class for the icon.
 * @param {string} [props.home.colorClass='card-color-1'] - The CSS class for the card's color scheme.
 * @param {function} props.onClick - The function to execute when the card is clicked or activated via keyboard.
 */
const HomeCard = ({ home, onClick }) => {
  // Destructure properties from the home object with default fallbacks
  const {
    name,
    iconClass = 'fas fa-home',
    colorClass = 'card-color-1'
  } = home;

  /**
   * Handles keyboard events for accessibility.
   * Triggers the onClick handler when 'Enter' or 'Space' is pressed.
   * @param {React.KeyboardEvent} event - The keyboard event.
   */
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent default space bar scroll
      if (onClick) {
        onClick(home);
      }
    }
  };

  // Combine base classes with the dynamic color class from props
  const cardClassName = `home-card ${colorClass}`;

  return (
    <div
      className={cardClassName}
      onClick={() => onClick(home)}
      onKeyDown={handleKeyDown}
      role="button" // Semantically this is a button
      tabIndex={0}   // Make it focusable
      aria-label={`Select home: ${name}`}
    >
      <div className="home-card-icon">
        <i className={iconClass} aria-hidden="true"></i>
      </div>
      <h3 className="home-card-name">
        {name}
      </h3>
    </div>
  );
};

export default HomeCard;
