'use client';

import React, { useState, useEffect } from 'react';
import { POI, POICategory, Scene } from '@/stores/travelBookStore';

interface POIFormProps {
  initialData?: POI;
  onSubmit: (poiData: Omit<POI, 'id'>) => void;
  onCancel?: () => void;
  isEditMode?: boolean;
  title?: string;
  feedback?: { message: string; type: 'success' | 'error' } | null;
  allPois?: POI[];
  scenes?: Scene[]; // 新增：可选的场景列表
}

export default function POIForm({ initialData, onSubmit, onCancel, isEditMode = false, title, feedback, allPois, scenes = [] }: POIFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<POICategory>('sightseeing');
  const [visitTime, setVisitTime] = useState('');
  const [notes, setNotes] = useState('');
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [sceneId, setSceneId] = useState<string | undefined>(undefined); // 新增场景ID状态
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form fields
  const resetForm = () => {
    setName('');
    setCategory('sightseeing');
    setVisitTime('');
    setNotes('');
    setParentId(undefined);
    setSceneId(undefined);
    setErrors({});
  };

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setVisitTime(initialData.visitTime);
      setNotes(initialData.notes || '');
      setParentId(initialData.parentId);
      setSceneId(initialData.sceneId); // 初始化场景ID
    } else {
      resetForm();
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!visitTime.trim()) newErrors.visitTime = 'Visit time is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        name,
        category,
        visitTime,
        notes,
        parentId,
        sceneId, // 提交场景ID
        createdAt: initialData?.createdAt || new Date().toISOString(),
      });
      if (!isEditMode) resetForm();
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-slate-800">
        {title || (isEditMode ? 'Edit Point of Interest' : 'Add New Point of Interest')}
      </h2>

      {feedback && (
        <div className={`mb-4 px-4 py-3 rounded-lg ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 场景选择 (如果有场景数据) */}
        {scenes && scenes.length > 0 && (
          <div className="space-y-2">
            <label htmlFor="scene" className="block text-sm font-medium text-slate-700">Destination (Mapped to Canvas)</label>
            <select
              id="scene"
              value={sceneId || ''}
              onChange={(e) => setSceneId(e.target.value || undefined)}
              className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">-- Select Destination --</option>
              {scenes.map(scene => (
                <option key={scene.id} value={scene.id}>
                  {scene.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500">
              Selecting a destination will automatically add this POI to that destination's map.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border ${errors.name ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-slate-500`}
            placeholder="e.g., 'Eiffel Tower'"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as POICategory)}
            className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="sightseeing">Sightseeing</option>
            <option value="accommodation">Accommodation</option>
            <option value="food">Food</option>
            <option value="entertainment">Entertainment</option>
            <option value="shopping">Shopping</option>
            <option value="transportation">Transportation</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="visitTime" className="block text-sm font-medium text-slate-700">Visit Time</label>
          <input
            type="text"
            id="visitTime"
            value={visitTime}
            onChange={(e) => setVisitTime(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border ${errors.visitTime ? 'border-red-300' : 'border-slate-200'} focus:outline-none focus:ring-2 focus:ring-slate-500`}
            placeholder="e.g., '2 hours'"
          />
          {errors.visitTime && <p className="text-xs text-red-500">{errors.visitTime}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="parentId" className="block text-sm font-medium text-slate-700">Belongs to (Parent Location)</label>
          <select
            id="parentId"
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value || undefined)}
            className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
          >
            <option value="">None (Top-level)</option>
            {allPois && allPois
              .filter(p => !isEditMode || (p.id !== initialData?.id)) // Prevent self-selection
              .map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))
            }
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
          >
            {isEditMode ? 'Update POI' : 'Add POI'}
          </button>
          {isEditMode && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full shadow-md hover:bg-gray-300 transition-all duration-300"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}