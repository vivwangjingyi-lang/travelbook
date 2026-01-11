'use client';

import React from 'react';
import { POICategory } from '@/stores/travelBookStore';

interface CategoryFilterProps {
  selectedCategory: POICategory | 'all';
  categoryCounts: Record<POICategory | 'all', number>;
  onSelectCategory: (category: POICategory | 'all') => void;
}

export default function CategoryFilter({
  selectedCategory,
  categoryCounts,
  onSelectCategory,
}: CategoryFilterProps) {
  const categories: (POICategory | 'all')[] = [
    'all',
    'accommodation',
    'sightseeing',
    'food',
    'entertainment',
    'shopping',
    'transportation',
  ];

  // Format category name for display
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="flex flex-wrap gap-1 mb-2 overflow-x-auto pb-1">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 ease-in-out ${selectedCategory === cat
            ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-pressed={selectedCategory === cat}
        >
          {formatCategoryName(cat)}
          <span className="text-xs opacity-80">{categoryCounts[cat]}</span>
        </button>
      ))}
    </div>
  );
}
