
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BuyingInputs } from "@/lib/types";
import CurrencyInput from "./CurrencyInput";
import SliderInput from "./SliderInput";
import PercentageInput from "./PercentageInput";
import { formatCurrency } from "@/lib/calculations";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { FormDescription, FormItem } from "../ui/form";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface BuyingInputsFormProps {
  values: BuyingInputs;
  onChange: (values: BuyingInputs) => void;
}

const BuyingInputsForm = ({ values, onChange }: BuyingInputsFormProps) => {
  const handleHousePriceChange = (housePrice: number) => {
    onChange({ ...values, housePrice });
  };

  const handleDownPaymentPercentChange = (downPaymentPercent: number) => {
    onChange({ ...values, downPaymentPercent });
  };

  const handleInterestRateChange = (interestRate: number) => {
    onChange({ ...values, interestRate });
  };

  const handleLoanTermChange = (loanTerm: number) => {
    onChange({ ...values, loanTerm });
  };

  const handleLoanTypeChange = (loanType: "fixed" | "adjustable") => {
    onChange({ ...values, loanType });
  };

  const handlePropertyTaxRateChange = (propertyTaxRate: number) => {
    onChange({ ...values, propertyTaxRate });
  };

  const handleHomeInsuranceRateChange = (homeInsuranceRate: number) => {
    onChange({ ...values, homeInsuranceRate });
  };

  const handleMaintenanceCostsChange = (maintenanceCosts: number) => {
    onChange({ ...values, maintenanceCosts });
  };

  const handleUsePercentageForMaintenanceChange = (usePercentageForMaintenance: boolean) => {
    onChange({ ...values, usePercentageForMaintenance });
  };

  const handleAppreciationScenarioChange = (appreciationScenario: "low" | "medium" | "high" | "custom") => {
    onChange({ ...values, appreciationScenario });
  };

  const handleCustomAppreciationRateChange = (customAppreciationRate: number) => {
    onChange({ ...values, customAppreciationRate });
  };

  // Calculate down payment amount
  const downPaymentAmount = values.housePrice * (values.downPaymentPercent / 100);

  return (
    <Card>
      <CardHeader className="bg-buy/10">
        <CardTitle className="text-buy-dark">Buying Scenario</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <CurrencyInput
            id="housePrice"
            label="House Price"
            value={values.housePrice}
            onChange={handleHousePriceChange}
            description="The estimated purchase price of the house"
          />
          
          <SliderInput
            id="downPaymentPercent"
            label="Down Payment"
            min={0}
            max={100}
            step={1}
            value={values.downPaymentPercent}
            onChange={handleDownPaymentPercentChange}
            valueDisplay={`${values.downPaymentPercent}% (${formatCurrency(downPaymentAmount)})`}
            description="The down payment as a percentage of the house price"
          />
          
          <Separator />
          
          <PercentageInput
            id="interestRate"
            label="Mortgage Interest Rate"
            value={values.interestRate}
            onChange={handleInterestRateChange}
            description="The annual mortgage interest rate"
            min={0}
            max={20}
          />
          
          <Select 
            value={values.loanTerm.toString()} 
            onValueChange={(value) => handleLoanTermChange(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select loan term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 years</SelectItem>
              <SelectItem value="20">20 years</SelectItem>
              <SelectItem value="30">30 years</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={values.loanType} 
            onValueChange={(value) => handleLoanTypeChange(value as "fixed" | "adjustable")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select loan type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed-Rate Mortgage</SelectItem>
              <SelectItem value="adjustable">Adjustable-Rate Mortgage</SelectItem>
            </SelectContent>
          </Select>
          
          <Separator />
          
          <PercentageInput
            id="propertyTaxRate"
            label="Property Tax Rate"
            value={values.propertyTaxRate}
            onChange={handlePropertyTaxRateChange}
            description="The annual property tax rate as a percentage of the home value"
            min={0}
            max={10}
          />
          
          <PercentageInput
            id="homeInsuranceRate"
            label="Home Insurance Rate"
            value={values.homeInsuranceRate}
            onChange={handleHomeInsuranceRateChange}
            description="The annual home insurance cost as a percentage of the home value"
            min={0}
            max={5}
          />
          
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              id="usePercentageForMaintenance"
              checked={values.usePercentageForMaintenance}
              onCheckedChange={handleUsePercentageForMaintenanceChange}
            />
            <Label htmlFor="usePercentageForMaintenance">
              Use percentage of home value for maintenance costs
            </Label>
          </div>
          
          {values.usePercentageForMaintenance ? (
            <PercentageInput
              id="maintenanceCosts"
              label="Maintenance Costs"
              value={values.maintenanceCosts}
              onChange={handleMaintenanceCostsChange}
              description="Annual maintenance costs as a percentage of home value (typically 1%)"
              min={0}
              max={10}
            />
          ) : (
            <CurrencyInput
              id="maintenanceCosts"
              label="Annual Maintenance Costs"
              value={values.maintenanceCosts}
              onChange={handleMaintenanceCostsChange}
              description="The estimated annual home maintenance costs"
            />
          )}
          
          <Separator />
          
          <div className="space-y-4">
            <Label>Home Appreciation Rate</Label>
            <RadioGroup 
              value={values.appreciationScenario} 
              onValueChange={(value) => 
                handleAppreciationScenarioChange(value as "low" | "medium" | "high" | "custom")}
            >
              <FormItem className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low (2%)</Label>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium (4%)</Label>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High (6%)</Label>
              </FormItem>
              <FormItem className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Custom</Label>
              </FormItem>
            </RadioGroup>
            <FormDescription>
              Select a home appreciation rate scenario or input a custom percentage
            </FormDescription>
          </div>
          
          {values.appreciationScenario === "custom" && (
            <PercentageInput
              id="customAppreciationRate"
              label="Custom Appreciation Rate"
              value={values.customAppreciationRate}
              onChange={handleCustomAppreciationRateChange}
              description="The expected annual home appreciation rate"
              min={0}
              max={20}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyingInputsForm;
