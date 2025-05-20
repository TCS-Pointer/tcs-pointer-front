import React from 'react';

const FeedbackItem = ({ feedback }) => {
  const { title, description, date, type } = feedback;

  const getTypeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
          {type}
        </span>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {new Date(date).toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
};

export default FeedbackItem; 