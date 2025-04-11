
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ComparisonResults } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { CheckCircle } from "lucide-react";

interface ResultsSummaryProps {
  results: ComparisonResults | null;
}

const ResultsSummary = ({ results }: ResultsSummaryProps) => {
  if (!results) {
    return null;
  }

  const {
    summary: { finalBuyingWealth, finalRentingWealth, difference, betterOption },
  } = results;

  return (
    <Card className={`border-2 ${betterOption === 'buying' ? 'border-buy' : betterOption === 'renting' ? 'border-rent' : 'border-gray-300'}`}>
      <CardHeader>
        <CardTitle className="text-xl">Summary Results</CardTitle>
        <CardDescription>
          After the specified time period, here's how the two options compare:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-md ${betterOption === 'buying' ? 'bg-buy/10' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-medium mb-2 text-buy-dark">Buying</h3>
            <p className="text-2xl font-bold">{formatCurrency(finalBuyingWealth)}</p>
            <p className="text-sm text-muted-foreground">Final Wealth</p>
          </div>
          
          <div className={`p-4 rounded-md ${betterOption === 'renting' ? 'bg-rent/10' : 'bg-gray-100'}`}>
            <h3 className="text-lg font-medium mb-2 text-rent-dark">Renting</h3>
            <p className="text-2xl font-bold">{formatCurrency(finalRentingWealth)}</p>
            <p className="text-sm text-muted-foreground">Final Wealth</p>
          </div>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-md">
          <div className="flex items-start">
            <CheckCircle className={`h-6 w-6 mr-2 flex-shrink-0 ${betterOption === 'buying' ? 'text-buy' : betterOption === 'renting' ? 'text-rent' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium">
                {betterOption === "buying"
                  ? "Buying is financially better by:"
                  : betterOption === "renting"
                  ? "Renting is financially better by:"
                  : "Both options are approximately equal"}
              </p>
              {betterOption !== "equal" && (
                <p className="text-2xl font-bold mt-1 mb-2">
                  {formatCurrency(difference)}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {betterOption === "buying"
                  ? "In this scenario, buying a home creates more wealth over time."
                  : betterOption === "renting"
                  ? "In this scenario, renting and investing the difference creates more wealth over time."
                  : "Both buying and renting lead to similar wealth outcomes in this scenario."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsSummary;
