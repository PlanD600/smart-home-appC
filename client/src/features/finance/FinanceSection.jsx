// client/src/features/finance/FinanceSection.jsx

import React from 'react';

const FinanceSection = ({ title, children }) => (
  <div className="mb-6">
    {title && <h4 className="text-lg font-semibold mb-3 text-gray-700">{title}</h4>}
    {children}
    <hr className="mt-6 border-t border-gray-200" />
  </div>
);

export default FinanceSection;