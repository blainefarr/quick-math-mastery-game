
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeaderboardFilters } from "@/hooks/useLeaderboard";
import { Operation } from "@/types";

type Props = {
  filters: LeaderboardFilters;
  onFilterChange: (filters: Partial<LeaderboardFilters>) => void;
  className?: string;
};

const OPERATIONS: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
const GRADES = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
const RANGES = [
  { label: '1-10', min: 1, max: 10 },
  { label: '1-20', min: 1, max: 20 },
  { label: '1-100', min: 1, max: 100 },
];

export const LeaderboardFilters = ({ filters, onFilterChange, className = '' }: Props) => {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-center ${className}`}>
      <Select
        value={filters.operation}
        onValueChange={(value: Operation) => onFilterChange({ operation: value })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select operation" />
        </SelectTrigger>
        <SelectContent>
          {OPERATIONS.map((op) => (
            <SelectItem key={op} value={op}>
              {op.charAt(0).toUpperCase() + op.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={`${filters.min1}-${filters.max1}`}
        onValueChange={(value) => {
          const [min, max] = value.split('-').map(Number);
          onFilterChange({ min1: min, max1: max, min2: min, max2: max });
        }}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {RANGES.map((range) => (
            <SelectItem key={range.label} value={`${range.min}-${range.max}`}>
              Range: {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.grade || ''}
        onValueChange={(value) => onFilterChange({ grade: value || null })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Grades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Grades</SelectItem>
          {GRADES.map((grade) => (
            <SelectItem key={grade} value={grade}>
              {grade}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
