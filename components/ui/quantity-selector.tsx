import React from 'react';

interface QuantitySelectorProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  required?: boolean;
  minimumLabel?: string;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = ({ label, min, max, value, onChange, required, minimumLabel }) => {
  return (
    <div className="mb-2">
      <div className="flex items-center justify-between">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <button type="button" className="rounded border px-2" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>-</button>
          <span>{value}</span>
          <button type="button" className="rounded border px-2" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}>+</button>
        </div>
      </div>
      {required && minimumLabel && <div className="text-xs text-orange-500">{minimumLabel}</div>}
    </div>
  );
};

export default QuantitySelector; 