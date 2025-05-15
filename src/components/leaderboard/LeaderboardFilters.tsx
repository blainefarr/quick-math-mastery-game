
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { LeaderboardFilters as LeaderboardFiltersType } from "@/hooks/useLeaderboard";
import { Operation } from "@/types";
import { useCallback } from "react";

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
  // Memoized operation change handler
  const handleOperationChange = useCallback((value: Operation) => {
    onFilterChange({ operation: value });
  }, [onFilterChange]);

  // Memoized range change handler
  const handleRangeChange = useCallback((label: string) => {
    const selectedRange = RANGES.find(r => r.label === label);
    if (selectedRange) {
      onFilterChange({ 
        min1: selectedRange.min1, 
        max1: selectedRange.max1, 
        min2: selectedRange.min2, 
        max2: selectedRange.max2 
      });
    }
  }, [onFilterChange]);

  // Memoized grade change handler
  const handleGradeChange = useCallback((value: string) => {
    onFilterChange({ grade: value === "all" ? null : value });
  }, [onFilterChange]);
  
  return (
    <div className={`flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center ${className}`}>
      <Label className="font-medium whitespace-nowrap mr-2 mb-1 sm:mb-0">Filter:</Label>
      <div className="flex flex-wrap gap-2">
        <Select
          value={filters.operation}
          onValueChange={handleOperationChange}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-8">
            <SelectValue placeholder="All Operations" />
          </SelectTrigger>
          <SelectContent className="z-50">
            {OPERATIONS.map((op) => (
              <SelectItem key={op} value={op}>
                {op.charAt(0).toUpperCase() + op.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={getCurrentRangeLabel(filters)}
          onValueChange={handleRangeChange}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-8">
            <SelectValue placeholder="All Ranges" />
          </SelectTrigger>
          <SelectContent className="z-50">
            {RANGES.map((range) => (
              <SelectItem key={range.label} value={range.label}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.grade || "all"}
          onValueChange={handleGradeChange}
        >
          <SelectTrigger className="w-full sm:w-[140px] h-8">
            <SelectValue placeholder="All Grades" />
          </SelectTrigger>
          <SelectContent className="z-50">
            <SelectItem value="all">All Grades</SelectItem>
            {GRADES.map((grade) => (
              <SelectItem key={grade} value={grade}>
                {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Helper to get current range label
const getCurrentRangeLabel = (filters: LeaderboardFiltersType) => {
  if (!filters.min1 && !filters.max1) return 'All Ranges';
  
  const matchedRange = RANGES.find(
    r => r.min1 === filters.min1 && r.max1 === filters.max1 && 
         r.min2 === filters.min2 && r.max2 === filters.max2
  );
  
  return matchedRange ? matchedRange.label : 'All Ranges';
};
