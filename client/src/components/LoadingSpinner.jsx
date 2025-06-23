import React from 'react';

/**
 * A flexible and visually appealing loading spinner component.
 * @param {object} props - Component props.
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - The size of the spinner.
 * @param {string} [props.text] - Optional text to display below the spinner.
 * @param {string} [props.className] - Additional classes to apply to the container.
 * @param {boolean} [props.fullPage=false] - If true, centers the spinner on the entire page.
 */
const LoadingSpinner = ({ size = 'md', text, className = '', fullPage = false }) => {
  const containerClasses = `loading-spinner-container ${fullPage ? 'full-page' : ''} ${className}`;
  const spinnerClasses = `loading-spinner spinner-${size}`;

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses} role="status" aria-label="Loading"></div>
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
