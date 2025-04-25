
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface ProductFiltersProps {
  onFilterChange: (filters: FiltersType) => void;
  categories: string[];
}

export interface FiltersType {
  search: string;
  category: string;
  priceRange: [number, number];
  sortBy: string;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ onFilterChange, categories }) => {
  const [filters, setFilters] = useState<FiltersType>({
    search: '',
    category: '',
    priceRange: [0, 1000],
    sortBy: 'featured',
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCategoryChange = (value: string) => {
    const newFilters = { ...filters, category: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceChange = (value: number[]) => {
    const newFilters = { ...filters, priceRange: [value[0], value[1] || filters.priceRange[1]] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    const newFilters = { ...filters, sortBy: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const newFilters = {
      search: '',
      category: '',
      priceRange: [0, 1000],
      sortBy: 'featured',
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
      <div>
        <Label htmlFor="search" className="text-sm font-medium">Search</Label>
        <div className="relative">
          <Input
            id="search"
            placeholder="Search products..."
            value={filters.search}
            onChange={handleSearchChange}
            className="pl-10"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div>
        <Label htmlFor="category" className="text-sm font-medium">Category</Label>
        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger id="category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <Label className="text-sm font-medium">Price Range</Label>
          <span className="text-sm text-gray-500">
            ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
          </span>
        </div>
        <Slider
          defaultValue={[0, 1000]}
          max={1000}
          step={10}
          value={[filters.priceRange[0], filters.priceRange[1]]}
          onValueChange={handlePriceChange}
          className="py-4"
        />
      </div>

      <div>
        <Label htmlFor="sort" className="text-sm font-medium">Sort By</Label>
        <Select value={filters.sortBy} onValueChange={handleSortChange}>
          <SelectTrigger id="sort">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="featured">Featured</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={resetFilters} 
        className="w-full border-agrigreen-500 text-agrigreen-600 hover:bg-agrigreen-50"
      >
        Reset Filters
      </Button>
    </div>
  );
};

export default ProductFilters;
