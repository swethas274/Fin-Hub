import React from 'react';
import type { NewsArticle } from '../types';

interface NewsPanelProps {
  news: NewsArticle[];
}

export const NewsPanel: React.FC<NewsPanelProps> = ({ news }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4 text-white">Top News</h3>
      {news.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {news.map((article, index) => (
            <a 
              href={article.url} 
              key={index} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block bg-gray-800 p-4 rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              <h4 className="font-bold text-blue-accent">{article.title}</h4>
              <p className="text-xs text-gray-400 mt-1">
                {article.source.name}
                {article.author && <span className="italic"> - {article.author}</span>}
                {' - '} 
                {new Date(article.publishedAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-300 mt-2">{article.description}</p>
            </a>
          ))}
        </div>
      ) : (
        <p>No recent news found for this stock.</p>
      )}
    </div>
  );
};