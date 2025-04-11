
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { RentingInputs } from "@/lib/types";
import CurrencyInput from "./CurrencyInput";
import PercentageInput from "./PercentageInput";

interface RentingInputsFormProps {
  values: RentingInputs;
  onChange: (values: RentingInputs) => void;
}

const RentingInputsForm = ({ values, onChange }: RentingInputsFormProps) => {
  const handleMonthlyRentChange = (monthlyRent: number) => {
    onChange({ ...values, monthlyRent });
  };

  const handleAnnualRentIncreaseChange = (annualRentIncrease: number) => {
    onChange({ ...values, annualRentIncrease });
  };

  return (
    <Card>
      <CardHeader className="bg-rent/10">
        <CardTitle className="text-rent-dark">Renting Scenario</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <CurrencyInput
            id="monthlyRent"
            label="Monthly Rent"
            value={values.monthlyRent}
            onChange={handleMonthlyRentChange}
            description="The current monthly rent payment"
          />
          
          <PercentageInput
            id="annualRentIncrease"
            label="Annual Rent Increase"
            value={values.annualRentIncrease}
            onChange={handleAnnualRentIncreaseChange}
            description="The expected annual percentage increase in rent"
            min={0}
            max={20}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default RentingInputsForm;
