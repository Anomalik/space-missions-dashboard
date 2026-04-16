import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";

interface StatusMultiSelectProps {
  statuses: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function StatusMultiSelect({ statuses, selected, onChange }: StatusMultiSelectProps) {
  const toggleStatus = (status: string) => {
    if (selected.includes(status)) {
      onChange(selected.filter((s) => s !== status));
    } else {
      onChange([...selected, status]);
    }
  };

  const label = selected.length === 0
    ? "All Statuses"
    : selected.length === 1
    ? selected[0]
    : `${selected.length} statuses`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-between w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground cursor-pointer"
      >
        <span className="truncate">{label}</span>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className="flex w-full items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
          >
            <div className="flex h-4 w-4 items-center justify-center rounded-sm border border-primary">
              {selected.includes(status) && <Check className="h-3 w-3" />}
            </div>
            {status}
          </button>
        ))}
        {selected.length > 0 && (
          <>
            <div className="my-1 h-px bg-border" />
            <button
              onClick={() => onChange([])}
              className="flex w-full items-center px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-sm cursor-pointer"
            >
              Clear filters
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
