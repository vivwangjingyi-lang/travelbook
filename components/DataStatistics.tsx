'use client';

import React from 'react';
import { POI, POICategory } from '@/stores/travelBookStore';

interface DataStatisticsProps {
  pois: POI[];
}

export default function DataStatistics({ pois }: DataStatisticsProps) {
  const totalPOIs = pois.length;

  const categoryCounts = pois.reduce((counts, poi) => {
    counts[poi.category] = (counts[poi.category] || 0) + 1;
    return counts;
  }, {} as Record<POICategory, number>);

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4 text-slate-800">Statistics</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">Total POIs</p>
        <p className="text-2xl font-bold text-indigo-600">{totalPOIs}</p>
      </div>
      
      <h4 className="text-sm font-medium text-gray-600 mb-2">POIs by Category</h4>
      <div className="space-y-2">
        {Object.entries(categoryCounts).map(([category, count]) => (
          <div key={category} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
              <span className="text-xs text-gray-500">({count})</span>
            </div>
            <div className="w-2/3">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${(count / totalPOIs) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
