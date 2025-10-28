
import React, { useState, useEffect } from 'react';
import type { StockDataPoint, NewsArticle, Prediction, SentimentAnalysis } from '../types';
import { fetchStockData, fetchSMA } from '../services/alphaVantageService';
import { analyzeNewsSentiment, fetchNewsWithGemini } from '../services/geminiService';
import { getMockPrediction } from '../services/predictionService';
import { StockChart } from './StockChart';
import { NewsPanel } from './NewsPanel';
import { Recommendation } from './Recommendation';

interface DashboardProps {
  stockSymbol: string;
}

type LoadingState = {
    stock: boolean;
    news: boolean;
    sentiment: boolean;
    prediction: boolean;
};

export const Dashboard: React.FC<DashboardProps> = ({ stockSymbol }) => {
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ stock: true, news: true, sentiment: true, prediction: true });

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      setLoading({ stock: true, news: true, sentiment: true, prediction: true });

      try {
        // Fetch Stock Data
        const [dailyData, smaData] = await Promise.all([
          fetchStockData(stockSymbol),
          fetchSMA(stockSymbol)
        ]);

        const formattedData = Object.keys(dailyData).map(date => ({
          date,
          price: parseFloat(dailyData[date]['4. close']),
          sma: smaData[date] ? parseFloat(smaData[date]['SMA']) : 0,
        })).reverse();
        
        setStockData(formattedData);
        setLoading(prev => ({ ...prev, stock: false }));

        // Fetch Prediction
        const pred = getMockPrediction(formattedData);
        setPrediction(pred);
        setLoading(prev => ({ ...prev, prediction: false }));

        // Fetch News and then Analyze
        setLoading(prev => ({ ...prev, news: true, sentiment: true }));
        const newsArticles = await fetchNewsWithGemini(stockSymbol);
        setNews(newsArticles);
        setLoading(prev => ({ ...prev, news: false }));

        if (newsArticles.length > 0) {
          const sentimentResult = await analyzeNewsSentiment(stockSymbol, stockSymbol, newsArticles);
          setSentiment(sentimentResult);
        } else {
          setSentiment(null);
        }
        setLoading(prev => ({ ...prev, sentiment: false }));

      } catch (err: any) {
        console.error("Error fetching data for dashboard:", err);
        setError(`Failed to fetch data for ${stockSymbol}. The API might have rate limits. Please try another stock or wait a moment.`);
        setLoading({ stock: false, news: false, sentiment: false, prediction: false });
      }
    };

    fetchData();
  }, [stockSymbol]);

  if (error) {
    return <div className="bg-gray-800 p-6 rounded-lg text-red-400">{error}</div>;
  }
  
  const isAnythingLoading = Object.values(loading).some(Boolean);

  return (
    <div className="space-y-8">
       <h2 className="text-3xl font-bold text-white">Dashboard for ${stockSymbol}</h2>
      
      <div className="bg-gray-900 border border-gray-700 p-4 md:p-6 rounded-lg shadow-lg">
         {loading.stock ? <LoadingSpinner message="Loading Chart Data..."/> : <StockChart data={stockData} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-lg">
           {(loading.prediction || loading.sentiment) ? <LoadingSpinner message="Analyzing..."/> : <Recommendation prediction={prediction} sentiment={sentiment} />}
        </div>
        <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-white">Sentiment Analysis</h3>
          {loading.sentiment ? <LoadingSpinner message="Running Gemini Analysis..."/> : sentiment ? (
            <div className="space-y-3 text-sm">
                <p><span className="font-bold text-gray-400">24hr Score:</span> <span className={sentiment.recent_score > 0 ? 'text-green-accent' : 'text-red-accent'}>{sentiment.recent_score.toFixed(1)}</span></p>
                <p><span className="font-bold text-gray-400">10-day Score:</span> <span className={sentiment.weekly_score > 0 ? 'text-green-accent' : 'text-red-accent'}>{sentiment.weekly_score.toFixed(1)}</span></p>
                <p><span className="font-bold text-gray-400">Trend:</span> <span className="text-blue-accent">{sentiment.trend_description}</span></p>
                <p className="font-bold text-gray-400 pt-2">Key Headlines:</p>
                <ul className="list-disc list-inside text-gray-300">
                    {sentiment.influential_headlines.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
            </div>
          ) : <p>No sentiment data available.</p>}
        </div>
      </div>
      
      <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg shadow-lg">
        {loading.news ? <LoadingSpinner message="Fetching Latest News..."/> : <NewsPanel news={news} />}
      </div>
    </div>
  );
};

const LoadingSpinner: React.FC<{message: string}> = ({message}) => (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg">{message}</p>
    </div>
);