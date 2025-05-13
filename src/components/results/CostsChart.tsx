
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ComparisonResults } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, calculateAbsoluteDifference } from "@/lib/calculations";

interface CostsChartProps {
  results: ComparisonResults | null;
}

const CostsChart = ({ results }: CostsChartProps) => {
  if (!results) return null;

  const { yearlyComparisons } = results;

  // Format data for chart
  const chartData = yearlyComparisons.map(comparison => ({
    year: comparison.year,
    buyingCosts: comparison.cumulativeBuyingCosts,
    rentingCosts: comparison.cumulativeRentingCosts
  }));

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-lg">
          <p className="font-medium">Year {label}</p>
          <p className="text-buy">
            Buying Costs: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-rent">
            Renting Costs: {formatCurrency(payload[1].value)}
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Difference: {formatCurrency(calculateAbsoluteDifference(payload[0].value, payload[1].value))}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Cumulative Costs Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Year', position: 'insideBottomRight', offset: -10 }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value).split(',')[0] + "K"}
                label={{ value: 'Total Costs', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="buyingCosts" name="Buying Costs" fill="#3B82F6" />
              <Bar dataKey="rentingCosts" name="Renting Costs" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostsChart;
