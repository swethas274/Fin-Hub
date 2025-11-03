import dotenv from 'dotenv';
dotenv.config();  // Load .env variables

export const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';

const BASE_URL = 'https://www.alphavantage.co/query';

async function apiFetch(params: Record<string, string>) {
  const url = new URL(BASE_URL);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  url.searchParams.append('apikey', ALPHA_VANTAGE_API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  if (data['Error Message'] || data['Note']) {
    throw new Error(data['Error Message'] || data['Note'] || 'Alpha Vantage API error');
  }
  return data;
}

export const fetchStockData = async (symbol: string): Promise<Record<string, any>> => {
  const data = await apiFetch({
    function: 'TIME_SERIES_DAILY',
    symbol,
    outputsize: 'compact' // last 100 days
  });
  if (!data['Time Series (Daily)']) throw new Error('Invalid stock symbol or no daily data.');
  return data['Time Series (Daily)'];
};

export const fetchSMA = async (symbol: string): Promise<Record<string, any>> => {
  const data = await apiFetch({
    function: 'SMA',
    symbol,
    interval: 'daily',
    time_period: '50',
    series_type: 'close'
  });
  if (!data['Technical Analysis: SMA']) throw new Error('Could not fetch SMA data.');
  return data['Technical Analysis: SMA'];
};
