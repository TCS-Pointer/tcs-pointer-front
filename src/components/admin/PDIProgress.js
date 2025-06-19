import React from 'react';

const PDIProgress = ({ progress, goals }) => {
  const calculateProgress = () => {
    if (!goals || goals.length === 0) return 0;
    const completedGoals = goals.filter(goal => goal.completed).length;
    return (completedGoals / goals.length) * 100;
  };

  const progressPercentage = progress || calculateProgress();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progresso do PDI</h3>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
          <div
            style={{ width: `${progressPercentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
          />
        </div>
      </div>

      {goals && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Metas</h4>
          <ul className="space-y-2">
            {goals.map((goal, index) => (
              <li key={index} className="flex items-center">
                <span className={`w-2 h-2 rounded-full mr-2 ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-600">{goal.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PDIProgress; 