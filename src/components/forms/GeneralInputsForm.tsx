
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FormData, GeneralInputs } from "@/lib/types";
import { AlertCircle } from "lucide-react";
import CurrencyInput from "./CurrencyInput";
import SliderInput from "./SliderInput";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import PercentageInput from "./PercentageInput";

interface GeneralInputsFormProps {
  values: GeneralInputs;
  onChange: (values: GeneralInputs) => void;
  formData?: FormData; // Optional full form data for validation
  validationError?: string | null; // Optional validation error
}

const GeneralInputsForm = ({ 
  values, 
  onChange, 
  formData, 
  validationError 
}: GeneralInputsFormProps) => {
  // Check if there's a validation error related to current savings
  const hasSavingsError = validationError?.toLowerCase().includes('current savings');
  const handleTimeHorizonChange = (timeHorizon: number) => {
    onChange({ ...values, timeHorizon });
  };

  const handleAnnualIncomeChange = (annualIncome: number) => {
    onChange({ ...values, annualIncome });
  };

  const handleIncomeIncreaseToggle = () => {
    onChange({ 
      ...values, 
      incomeIncrease: !values.incomeIncrease,
    });
  };

  const handleAnnualIncomeGrowthChange = (annualIncomeGrowthRate: number) => {
    onChange({ ...values, annualIncomeGrowthRate });
  };

  const handleCurrentSavingsChange = (currentSavings: number) => {
    onChange({ ...values, currentSavings });
  };

  return (
    <Card>
      <CardHeader className="bg-muted">
        <CardTitle>General Information</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <SliderInput
            id="timeHorizon"
            label="Time Horizon (Years)"
            min={1}
            max={30}
            step={1}
            value={values.timeHorizon}
            onChange={handleTimeHorizonChange}
            description="The number of years for the comparison"
          />
          
          <Separator />
          
          <CurrencyInput
            id="annualIncome"
            label="Annual Income"
            value={values.annualIncome}
            onChange={handleAnnualIncomeChange}
            description="Your gross annual income"
          />
          
          <div className="flex items-center space-x-2">
            <Switch
              id="incomeIncrease"
              checked={values.incomeIncrease}
              onCheckedChange={handleIncomeIncreaseToggle}
            />
            <Label htmlFor="incomeIncrease">Include annual income increase</Label>
          </div>
          
          {values.incomeIncrease && (
            <PercentageInput
              id="annualIncomeGrowthRate"
              label="Annual Income Growth"
              value={values.annualIncomeGrowthRate}
              onChange={handleAnnualIncomeGrowthChange}
              description="The expected annual percentage increase in your income"
              min={0}
              max={20}
            />
          )}
          
          <Separator />
          
          <div className="space-y-2">
            <CurrencyInput
              id="currentSavings"
              label={
                <div className="flex items-center gap-2">
                  <span>Current Savings</span>
                  {hasSavingsError && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              }
              value={values.currentSavings}
              onChange={handleCurrentSavingsChange}
              description="Your total current savings"
              className={hasSavingsError ? "border-red-300 focus-visible:ring-red-500" : ""}
            />
            
            {hasSavingsError && (
              <p className="text-sm text-red-500 mt-1">
                {validationError}
              </p>
            )}
            
            {formData && (
              <div className="text-sm text-muted-foreground mt-1">
                <span>Required down payment: </span>
                <span className="font-medium">
                  ${(formData.buying.housePrice * (formData.buying.downPaymentPercent / 100)).toLocaleString()}
                </span>
                <span> ({formData.buying.downPaymentPercent}% of ${formData.buying.housePrice.toLocaleString()})</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralInputsForm;
