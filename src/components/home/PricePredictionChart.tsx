
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const generateMockData = () => {
  const data = [];
  const crops = ['Wheat', 'Rice', 'Tomato', 'Potato'];
  
  // Generate mock data for the next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    const dataPoint: any = {
      day: i + 1,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
    
    // Generate prices for each crop
    crops.forEach(crop => {
      // Base price plus a random seasonal trend component
      const basePrice = {
        'Wheat': 40,
        'Rice': 35, 
        'Tomato': 25,
        'Potato': 20
      }[crop] || 30;
      
      // Add some randomness and a slight upward or downward trend
      const trend = (i / 30) * (Math.random() > 0.5 ? 5 : -3);
      const seasonal = Math.sin((i / 30) * Math.PI * 2) * 2; // Seasonal fluctuation
      const random = (Math.random() - 0.5) * 2; // Random noise
      
      dataPoint[crop] = Math.max(basePrice + trend + seasonal + random, basePrice * 0.7).toFixed(2);
    });
    
    data.push(dataPoint);
  }
  
  return data;
};

const PricePredictionChart = () => {
  const data = generateMockData();
  const colors = {
    'Wheat': '#F59E0B',
    'Rice': '#10B981',
    'Tomato': '#EF4444',
    'Potato': '#8B5CF6'
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 10 }} 
          tickFormatter={(value, index) => index % 5 === 0 ? value : ''}
        />
        <YAxis 
          label={{ value: 'Price (₹)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
          tick={{ fontSize: 10 }}
        />
        <Tooltip 
          formatter={(value, name) => [`₹${value}`, name]} 
          labelFormatter={(label) => `Day: ${label}`}
        />
        <Legend wrapperStyle={{ fontSize: '10px' }} />
        <Line 
          type="monotone" 
          dataKey="Wheat" 
          stroke={colors.Wheat} 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="Rice" 
          stroke={colors.Rice} 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="Tomato" 
          stroke={colors.Tomato} 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line 
          type="monotone" 
          dataKey="Potato" 
          stroke={colors.Potato} 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default PricePredictionChart;
