import { Input } from "@/components/ui/input";

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onStartChange: (date: string | null) => void;
  onEndChange: (date: string | null) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
}: DateRangePickerProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        placeholder="Start date"
        value={startDate || ""}
        onChange={(e) => onStartChange(e.target.value || null)}
        className="w-[150px]"
        min="1957-01-01"
        max="2022-12-31"
      />
      <span className="text-muted-foreground text-sm">to</span>
      <Input
        type="date"
        placeholder="End date"
        value={endDate || ""}
        onChange={(e) => onEndChange(e.target.value || null)}
        className="w-[150px]"
        min="1957-01-01"
        max="2022-12-31"
      />
    </div>
  );
}
