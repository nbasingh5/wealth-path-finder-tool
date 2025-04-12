
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { GeneralInputs } from "@/lib/types";
import CurrencyInput from "./CurrencyInput";
import SliderInput from "./SliderInput";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import PercentageInput from "./PercentageInput";

interface GeneralInputsFormProps {
  values: GeneralInputs;
  onChange: (values: GeneralInputs) => void;
}

const GeneralInputsForm = ({ values, onChange }: GeneralInputsFormProps) => {
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
          
          <CurrencyInput
            id="currentSavings"
            label="Current Savings"
            value={values.currentSavings}
            onChange={handleCurrentSavingsChange}
            description="Your total current savings"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralInputsForm;
