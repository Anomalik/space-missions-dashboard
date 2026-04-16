import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompanySelectProps {
  companies: string[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function CompanySelect({ companies, value, onChange }: CompanySelectProps) {
  return (
    <Select
      value={value || "all"}
      onValueChange={(v) => onChange(v === "all" ? null : v)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="All Companies" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Companies</SelectItem>
        {companies.map((company) => (
          <SelectItem key={company} value={company}>
            {company}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
