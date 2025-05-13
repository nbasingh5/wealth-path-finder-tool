
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ComparisonResults } from "@/lib/types";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, calculateAbsoluteDifference } from "@/lib/calculations";

interface ComparisonChartProps {
  results: ComparisonResults | null;
}

const ComparisonChart = ({ results }: ComparisonChartProps) => {
  if (!results) return null;

  const { yearlyComparisons } = results;

  // Format data for chart
  const chartData = yearlyComparisons.map(comparison => ({
    year: comparison.year,
    buying: comparison.buyingWealth,
    renting: comparison.rentingWealth
  }));

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-lg">
          <p className="font-medium">Year {label}</p>
          <p className="text-buy">
            Buying: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-rent">
            Renting: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Difference: {formatCurrency(calculateAbsoluteDifference(payload[0].value, payload[1].value))}
            {payload[0].value > payload[1].value ? ' (Buying ahead)' : ' (Renting ahead)'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wealth Comparison Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBuying" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorRenting" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="year" 
                label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value).split(',')[0] + "K"}
                label={{ value: 'Wealth', angle: -90, position: 'insideLeft' }}
              />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="buying" 
                name="Buying Wealth" 
                stroke="#3B82F6" 
                fillOpacity={1} 
                fill="url(#colorBuying)" 
              />
              <Area 
                type="monotone" 
                dataKey="renting" 
                name="Renting Wealth" 
                stroke="#10B981" 
                fillOpacity={1} 
                fill="url(#colorRenting)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonChart;
