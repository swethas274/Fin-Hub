
import React, { useState, useCallback } from 'react';
import { SearchBar } from './components/SearchBar';
import { Dashboard } from './components/Dashboard';
import { HistoryPanel } from './components/HistoryPanel';
import { ChatBot } from './components/ChatBot';
import { Clock } from './components/Clock';

const App: React.FC = () => {
  const [currentStock, setCurrentStock] = useState<string>('AAPL');
  const [searchHistory, setSearchHistory] = useState<string[]>(['AAPL', 'GOOGL', 'TSLA', 'MSFT']);

  const handleSearch = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol && upperSymbol !== currentStock) {
      setCurrentStock(upperSymbol);
      if (!searchHistory.includes(upperSymbol)) {
        setSearchHistory(prev => [upperSymbol, ...prev.slice(0, 9)]); // Keep history to 10 items
      }
    }
  }, [currentStock, searchHistory]);

  const selectFromHistory = useCallback((symbol: string) => {
    setCurrentStock(symbol);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 font-sans">
      <header className="bg-gray-900 border-b border-gray-700 p-4 flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-accent" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
          </svg>
          <h1 className="text-2xl font-bold text-white">Fin-Hub</h1>
        </div>
        <div className="w-full max-w-xs md:max-w-md">
          <SearchBar onSearch={handleSearch} />
        </div>
        <Clock />
      </header>

      <main className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <Dashboard stockSymbol={currentStock} key={currentStock} />
        </div>
        <aside className="lg:col-span-1">
          <HistoryPanel history={searchHistory} onSelect={selectFromHistory} />
        </aside>
      </main>
      
      <ChatBot />
    </div>
  );
};

export default App;
