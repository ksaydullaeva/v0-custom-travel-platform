import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface Props {
  selected: Date[];
  onChange: (dates: Date[]) => void;
}

export default function MultiDatePicker({ selected, onChange }: Props) {
  return (
    <DayPicker
      mode="multiple"
      selected={selected}
      onSelect={(dates) => onChange(dates as Date[])}
    />
  );
}
