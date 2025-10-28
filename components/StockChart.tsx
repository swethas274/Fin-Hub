
import React from 'react';
import type { StockDataPoint } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StockChartProps {
  data: StockDataPoint[];
}

export const StockChart: React.FC<StockChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center p-10">No chart data available.</div>;
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis dataKey="date" stroke="#8b949e" tick={{ fontSize: 12 }} />
          <YAxis stroke="#8b949e" tick={{ fontSize: 12 }} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#161b22', 
              borderColor: '#30363d'
            }} 
            labelStyle={{ color: '#c9d1d9' }}
          />
          <Legend wrapperStyle={{color: '#c9d1d9'}}/>
          <Line type="monotone" dataKey="price" stroke="#58a6ff" strokeWidth={2} dot={false} name="Close Price" />
          <Line type="monotone" dataKey="sma" stroke="#3fb950" strokeWidth={2} dot={false} name="50-Day SMA" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
