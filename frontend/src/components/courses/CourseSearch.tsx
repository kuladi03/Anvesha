import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CourseSearchProps {
  onSearch: (value: string) => void;
  onFilterChange: (value: string) => void;
}

export const CourseSearch = ({ onSearch, onFilterChange }: CourseSearchProps) => {
  return (
    <div className="flex gap-4 items-center mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search courses..."
          className="pl-8"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
    </div>
  );
};
