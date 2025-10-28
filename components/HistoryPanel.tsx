
import React from 'react';

interface HistoryPanelProps {
  history: string[];
  onSelect: (symbol: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-white">Search History</h3>
      {history.length > 0 ? (
        <ul className="space-y-2">
          {history.map((symbol) => (
            <li key={symbol}>
              <button
                onClick={() => onSelect(symbol)}
                className="w-full text-left px-3 py-2 bg-gray-800 rounded-md hover:bg-blue-accent hover:text-white transition-colors duration-200"
              >
                {symbol}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400 text-sm">Your search history will appear here.</p>
      )}
    </div>
  );
};
