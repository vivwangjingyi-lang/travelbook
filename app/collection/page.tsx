'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore, POICategory } from "@/stores/travelBookStore";

export default function Collection() {
  const router = useRouter();
  const { currentBook, addPOI, deletePOI } = useTravelBookStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<POICategory>("sightseeing");
  const [visitTime, setVisitTime] = useState("");
  const [notes, setNotes] = useState("");

  const pois = currentBook?.pois || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPOI({ name, category, visitTime, notes });
    setName("");
    setVisitTime("");
    setNotes("");
  };

  const handleDelete = (poiId: string) => {
    deletePOI(poiId);
  };

  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={2} />
      
      <div className="max-w-4xl mx-auto pt-24">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-slate-800">Chapter II: Collection</h1>
          <p className="text-lg text-slate-600 leading-relaxed">Gather your points of interest</p>
        </header>

        {/* Main Content */}
        <main className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add POI Form */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-slate-800">Add New Point of Interest</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="e.g., 'Eiffel Tower'"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium text-slate-700">
                    Category
                  </label>
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
                  <label htmlFor="visitTime" className="block text-sm font-medium text-slate-700">
                    Visit Time
                  </label>
                  <input
                    type="text"
                    id="visitTime"
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    placeholder="e.g., '2 hours'"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
                >
                  Add POI
                </button>
              </form>
            </div>

            {/* POI List */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-slate-800">Your Collection</h2>
              {pois.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p>No points of interest added yet</p>
                  <p className="text-sm mt-2">Start by adding your first POI above</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {pois.map((poi) => (
                    <div
                      key={poi.id}
                      className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-slate-800">{poi.name}</h4>
                          <div className="flex gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${poi.category === "accommodation" ? "bg-blue-100 text-blue-700" : 
                                                                     poi.category === "sightseeing" ? "bg-green-100 text-green-700" : 
                                                                     poi.category === "food" ? "bg-red-100 text-red-700" : 
                                                                     poi.category === "entertainment" ? "bg-purple-100 text-purple-700" : 
                                                                     poi.category === "shopping" ? "bg-yellow-100 text-yellow-700" : 
                                                                     "bg-gray-100 text-gray-700"}`}>
                              {poi.category.charAt(0).toUpperCase() + poi.category.slice(1)}
                            </span>
                            <span className="text-xs text-slate-500">{poi.visitTime}</span>
                          </div>
                          {poi.notes && (
                            <p className="text-sm text-slate-600 mt-2">{poi.notes}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(poi.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Next Button */}
              {pois.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => router.push('/canvas')}
                    className="w-full px-4 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
                  >
                    Continue to Canvas
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}