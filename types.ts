
export interface StockDataPoint {
  date: string;
  price: number;
  sma: number;
}

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface Prediction {
  decision: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // e.g., 0.85 for 85%
  reasoning: string;
}

export interface SentimentAnalysis {
  recent_score: number;
  weekly_score: number;
  trend_description: string;
  influential_headlines: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}
