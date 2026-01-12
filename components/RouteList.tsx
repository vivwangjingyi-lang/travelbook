'use client';

import React from 'react';
import { Route, CanvasPOI } from '@/stores/travelBookStore';
import { useLanguageStore } from '@/stores/languageStore';
import { getTranslation } from '@/utils/i18n';

interface RouteListProps {
  routes: Route[];
  canvasPOIs: CanvasPOI[];
  onRouteDelete?: (routeId: string) => void;
}

const RouteList: React.FC<RouteListProps> = ({ routes, canvasPOIs, onRouteDelete }) => {
  const { language } = useLanguageStore();
  const t = (key: string) => getTranslation(key, language);

  // Get POI name by ID
  const getPOIName = (poiId: string): string => {
    const poi = canvasPOIs.find(cp => cp.id === poiId);
    return poi ? poi.name : 'Unknown';
  };

  // Get transportation icon or text
  const getTransportationText = (transportation: string): string => {
    // Just return the transportation type directly
    return transportation;
  };

  // Sort routes by order (based on POI order)
  const sortedRoutes = [...routes].sort((a, b) => {
    // This is a simple sort - in a real app we might want to sort based on actual itinerary order
    // For now, we'll sort by fromPoiId and toPoiId to get a consistent order
    return `${a.fromPoiId}-${a.toPoiId}`.localeCompare(`${b.fromPoiId}-${b.toPoiId}`);
  });

  if (sortedRoutes.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm text-center">
        <p className="text-sm text-slate-500">{t('plot.noRoutes')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-slate-800">{t('plot.routeListTitle')}</h3>
      <div className="space-y-3">
        {sortedRoutes.map((route, index) => (
          <div key={route.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white/90">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">{index + 1}.</span>
                <span className="text-sm font-medium text-slate-800">{getPOIName(route.fromPoiId)}</span>
                <span className="text-xs text-slate-500">→</span>
                <span className="text-sm font-medium text-slate-800">{getPOIName(route.toPoiId)}</span>
                <span className="text-xs text-slate-600">:{getTransportationText(route.transportation)} {route.duration}</span>
              </div>
            </div>
            {onRouteDelete && (
              <button
                onClick={() => onRouteDelete(route.id)}
                className="ml-2 p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 transition-colors"
                title={t('plot.deleteRoute')}
                aria-label={t('plot.deleteRoute')}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteList;
