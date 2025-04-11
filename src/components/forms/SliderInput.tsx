
import React from "react";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { StandaloneFormDescription } from "./StandaloneFormDescription";

interface SliderInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  valueDisplay?: string;
  className?: string;
}

const SliderInput = ({
  id,
  label,
  value,
  onChange,
  description,
  min = 0,
  max = 100,
  step = 1,
  valueDisplay,
  className = "",
}: SliderInputProps) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm font-medium">
          {valueDisplay || value}
        </span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        className="cursor-pointer"
      />
      {description && (
        <StandaloneFormDescription>{description}</StandaloneFormDescription>
      )}
    </div>
  );
};

export default SliderInput;
