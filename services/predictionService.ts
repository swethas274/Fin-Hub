
import type { Prediction, StockDataPoint } from '../types';

/**
 * Mocks a prediction from a complex backend model (HMM + LSTM).
 * This is a placeholder for a real API call to a prediction service.
 * The logic here is simplified for frontend demonstration.
 */
export const getMockPrediction = (data: StockDataPoint[]): Prediction => {
  if (data.length < 2) {
    return {
      decision: 'HOLD',
      confidence: 0.5,
      reasoning: 'Insufficient data for a reliable prediction.'
    };
  }

  const latestPoint = data[data.length - 1];
  const previousPoint = data[data.length - 2];

  const priceChange = latestPoint.price - previousPoint.price;
  const priceAboveSma = latestPoint.price > latestPoint.sma;

  let decision: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
  let reasoning = '';

  if (priceAboveSma && priceChange > 0) {
    decision = 'BUY';
    reasoning = 'The stock is in an uptrend, trading above its 50-day moving average with positive price momentum.';
  } else if (!priceAboveSma && priceChange < 0) {
    decision = 'SELL';
    reasoning = 'The stock is in a downtrend, trading below its 50-day moving average with negative price momentum.';
  } else {
    decision = 'HOLD';
    reasoning = 'Market signals are mixed. The stock price and its moving average are not showing a clear trend.';
  }

  // Simulate confidence based on volatility
  const prices = data.slice(-10).map(p => p.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const stdDev = Math.sqrt(prices.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / prices.length);
  const volatility = (stdDev / avg);
  const confidence = Math.max(0.6, 1 - volatility * 5); // Base confidence of 60%

  return {
    decision,
    confidence: parseFloat(confidence.toFixed(2)),
    reasoning
  };
};
