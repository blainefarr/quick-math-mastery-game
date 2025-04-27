
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeaderboardFilters as LeaderboardFiltersType } from "@/hooks/useLeaderboard";
import { Operation } from "@/types";

type Props = {
  filters: LeaderboardFiltersType;
  onFilterChange: (filters: Partial<LeaderboardFiltersType>) => void;
  className?: string;
};

const OPERATIONS: Operation[] = ['addition', 'subtraction', 'multiplication', 'division'];
// Match the grade options from MyAccount.tsx
const GRADES = [
  "Pre-k",
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade", 
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th - 9th Grade",
  "High School",
  "Adult"
];

const RANGES = [
  { label: '1-10', min1: 1, max1: 10, min2: 1, max2: 10 },
  { label: '1-20', min1: 1, max1: 20, min2: 1, max2: 20 },
  { label: '1-100', min1: 1, max1: 100, min2: 1, max2: 100 },
  { label: 'All Ranges', min1: null, max1: null, min2: null, max2: null },
];

export const LeaderboardFilters = ({ filters, onFilterChange, className = '' }: Props) => {
  // Helper to get current range label
  const getCurrentRangeLabel = () => {
    if (!filters.min1 && !filters.max1) return 'All Ranges';
    
    const matchedRange = RANGES.find(
      r => r.min1 === filters.min1 && r.max1 === filters.max1 && 
           r.min2 === filters.min2 && r.max2 === filters.max2
    );
    
    return matchedRange ? matchedRange.label : `${filters.min1}-${filters.max1}`;
  };

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
        value={getCurrentRangeLabel()}
        onValueChange={(label) => {
          const selectedRange = RANGES.find(r => r.label === label);
          if (selectedRange) {
            onFilterChange({ 
              min1: selectedRange.min1, 
              max1: selectedRange.max1, 
              min2: selectedRange.min2, 
              max2: selectedRange.max2 
            });
          }
        }}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {RANGES.map((range) => (
            <SelectItem key={range.label} value={range.label}>
              {range.label === 'All Ranges' ? range.label : `Range: ${range.label}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.grade || "all"}
        onValueChange={(value) => onFilterChange({ grade: value === "all" ? null : value })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Grades" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Grades</SelectItem>
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
