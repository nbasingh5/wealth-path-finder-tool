
import React, { ChangeEvent } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { StandaloneFormDescription } from "./StandaloneFormDescription";

interface PercentageInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const PercentageInput = ({
  id,
  label,
  value,
  onChange,
  description,
  placeholder = "0",
  min = 0,
  max = 100,
  step = 0.01,
  className = "",
}: PercentageInputProps) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Remove non-numeric characters except decimal point
    const numericValue = rawValue.replace(/[^0-9.]/g, "");
    
    // Parse as float, default to 0 if NaN
    const parsedValue = parseFloat(numericValue);
    
    // Clamp value between min and max
    let finalValue = isNaN(parsedValue) ? 0 : parsedValue;
    finalValue = Math.max(min, Math.min(max, finalValue));
    
    onChange(finalValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          value={value}
          onChange={handleChange}
          className="pr-8"
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
        />
        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          %
        </span>
      </div>
      {description && (
        <StandaloneFormDescription>{description}</StandaloneFormDescription>
      )}
    </div>
  );
};

export default PercentageInput;
