
import React, { ChangeEvent, ReactNode } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { StandaloneFormDescription } from "./StandaloneFormDescription";

interface CurrencyInputProps {
  id: string;
  label: ReactNode;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  placeholder?: string;
  className?: string;
}

const CurrencyInput = ({
  id,
  label,
  value,
  onChange,
  description,
  placeholder = "0",
  className = "",
}: CurrencyInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Remove non-numeric characters except decimal point
    const numericValue = rawValue.replace(/[^0-9.]/g, "");
    
    // Parse as float, default to 0 if NaN
    const parsedValue = parseFloat(numericValue);
    onChange(isNaN(parsedValue) ? 0 : parsedValue);
  };

  const formattedValue = value 
    ? value.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : "";

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          $
        </span>
        <Input
          id={id}
          type="text"
          value={formattedValue}
          onChange={handleChange}
          className="pl-8"
          placeholder={placeholder}
        />
      </div>
      {description && (
        <StandaloneFormDescription>{description}</StandaloneFormDescription>
      )}
    </div>
  );
};

export default CurrencyInput;
