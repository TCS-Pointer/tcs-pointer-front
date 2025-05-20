import React from 'react';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${color ? `border-l-4 ${color}` : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        {icon && (
          <div className="p-3 bg-gray-100 rounded-full">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard; 