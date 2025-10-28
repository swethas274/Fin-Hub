
import React from 'react';
import type { Prediction, SentimentAnalysis } from '../types';

interface RecommendationProps {
  prediction: Prediction | null;
  sentiment: SentimentAnalysis | null;
}

const getSignalColor = (signal: string) => {
    switch(signal) {
        case 'STRONG BUY':
        case 'BUY':
            return 'bg-green-500 text-white';
        case 'HOLD':
            return 'bg-yellow-500 text-black';
        case 'SELL':
        case 'STRONG SELL':
            return 'bg-red-500 text-white';
        default:
            return 'bg-gray-600 text-white';
    }
}

export const Recommendation: React.FC<RecommendationProps> = ({ prediction, sentiment }) => {
    const finalSignal = (): string => {
        if (!prediction || sentiment === null) return 'ANALYZING...';

        const sentimentScore = sentiment.recent_score;

        if (prediction.decision === 'BUY' && sentimentScore > 3) return 'STRONG BUY';
        if (prediction.decision === 'BUY' && sentimentScore > 0) return 'BUY';
        if (prediction.decision === 'SELL' && sentimentScore < -3) return 'STRONG SELL';
        if (prediction.decision === 'SELL' && sentimentScore < 0) return 'SELL';
        
        return 'HOLD';
    };

    const signal = finalSignal();

    if (!prediction) {
        return <div className="text-center p-4">Awaiting prediction data...</div>;
    }
    
    return (
        <div>
            <h3 className="text-xl font-semibold mb-4 text-white">Investment Signal</h3>
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className={`px-8 py-3 rounded-full text-2xl font-bold ${getSignalColor(signal)}`}>
                    {signal}
                </div>
                <div className="w-full text-center">
                    <p className="text-sm text-gray-400">Prediction Accuracy</p>
                    <p className="text-lg font-semibold text-blue-accent">{(prediction.confidence * 100).toFixed(1)}%</p>
                </div>
                <p className="text-sm text-center text-gray-300 italic px-4">
                    {prediction.reasoning}
                </p>
            </div>
        </div>
    );
};
