
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { InvestmentInputs } from "@/lib/types";
import PercentageInput from "./PercentageInput";

interface InvestmentInputsFormProps {
  values: InvestmentInputs;
  onChange: (values: InvestmentInputs) => void;
}

const InvestmentInputsForm = ({ values, onChange }: InvestmentInputsFormProps) => {
  const handleAnnualReturnChange = (annualReturn: number) => {
    onChange({ ...values, annualReturn });
  };

  const handleCapitalGainsTaxRateChange = (capitalGainsTaxRate: number) => {
    onChange({ ...values, capitalGainsTaxRate });
  };

  return (
    <Card>
      <CardHeader className="bg-muted">
        <CardTitle>Investment Settings</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <PercentageInput
            id="annualReturn"
            label="S&P 500 Annual Return"
            value={values.annualReturn}
            onChange={handleAnnualReturnChange}
            description="The expected annual return on S&P 500 investments"
            min={0}
            max={30}
          />
          
          <PercentageInput
            id="capitalGainsTaxRate"
            label="Capital Gains Tax Rate"
            value={values.capitalGainsTaxRate}
            onChange={handleCapitalGainsTaxRateChange}
            description="The tax rate on investment gains"
            min={0}
            max={50}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentInputsForm;
