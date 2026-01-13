'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { TravelBook } from "@/stores/travelBookStore";

// Mock data for example travel books
const exampleBooks: TravelBook[] = [
  {
    id: "example-1",
    title: "European Adventure",
    description: "A journey through the heart of Europe",
    startDate: "2023-05-15",
    endDate: "2023-06-05",
    coverImage: "",
    pois: [
      {
        id: "poi-1",
        name: "Eiffel Tower",
        category: "sightseeing",
        visitTime: "2 hours",
        notes: "Iconic landmark with stunning views",
        createdAt: "2023-05-30T09:00:00.000Z"
      },
      {
        id: "poi-2",
        name: "Louvre Museum",
        category: "sightseeing",
        visitTime: "3 hours",
        notes: "World's largest art museum",
        createdAt: "2023-05-30T10:00:00.000Z"
      },
      {
        id: "poi-3",
        name: "Colosseum",
        category: "sightseeing",
        visitTime: "2 hours",
        notes: "Ancient Roman amphitheater",
        createdAt: "2023-05-31T14:00:00.000Z"
      },
      {
        id: "poi-4",
        name: "Pisa Tower",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Famous leaning tower",
        createdAt: "2023-06-01T10:00:00.000Z"
      },
      {
        id: "poi-5",
        name: "Rialto Bridge",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Beautiful bridge in Venice",
        createdAt: "2023-06-02T15:00:00.000Z"
      },
      {
        id: "poi-6",
        name: "Le Grand Paris Hotel",
        category: "accommodation",
        visitTime: "Overnight",
        notes: "Luxury hotel with excellent service",
        createdAt: "2023-05-29T18:00:00.000Z"
      },
      {
        id: "poi-7",
        name: "Trattoria Da Luigi",
        category: "food",
        visitTime: "1.5 hours",
        notes: "Authentic Italian cuisine",
        createdAt: "2023-05-30T19:00:00.000Z"
      }
    ],
    canvasPois: [
      {
        id: "canvas-poi-1",
        name: "Eiffel Tower",
        category: "sightseeing",
        visitTime: "2 hours",
        x: 150,
        y: 100,
        notes: "Iconic landmark with stunning views",
        createdAt: "2023-05-30T09:00:00.000Z"
      },
      {
        id: "canvas-poi-2",
        name: "Louvre Museum",
        category: "sightseeing",
        visitTime: "3 hours",
        x: 400,
        y: 200,
        notes: "World's largest art museum",
        createdAt: "2023-05-30T10:00:00.000Z"
      },
      {
        id: "canvas-poi-3",
        name: "Colosseum",
        category: "sightseeing",
        visitTime: "2 hours",
        x: 600,
        y: 350,
        notes: "Ancient Roman amphitheater",
        createdAt: "2023-05-31T14:00:00.000Z"
      }
    ],
    dailyItineraries: [
      {
        day: 1,
        selectedPoiIds: ["poi-1", "poi-2", "poi-7"],
        orderedPois: [
          { poiId: "poi-1", order: 1 },
          { poiId: "poi-7", order: 2 },
          { poiId: "poi-2", order: 3 }
        ],
        routes: [
          {
            id: "route-1",
            fromPoiId: "poi-1",
            toPoiId: "poi-7",
            transportation: "taxi",
            duration: "15 minutes"
          },
          {
            id: "route-2",
            fromPoiId: "poi-7",
            toPoiId: "poi-2",
            transportation: "bus",
            duration: "25 minutes"
          }
        ]
      },
      {
        day: 2,
        selectedPoiIds: ["poi-3"],
        orderedPois: [
          { poiId: "poi-3", order: 1 }
        ],
        routes: []
      }
    ],
    memos: [
      {
        id: "memo-1",
        title: "First Day in Paris",
        content: "What an amazing first day! The Eiffel Tower at sunset was breathtaking. The dinner at Trattoria Da Luigi was delicious, especially the pasta.",
        date: "2023-05-15T18:30:00Z",
        pinned: true
      },
      {
        id: "memo-2",
        title: "Rome Highlights",
        content: "Visited the Colosseum today. It's incredible to imagine what it was like in ancient times. The architecture is amazing.",
        date: "2023-05-20T15:45:00Z"
      }
    ],
    scenes: [],
    activeSceneId: '',
    sceneRoutes: []
  },
  {
    id: "example-2",
    title: "Asian Exploration",
    description: "Discovering the wonders of Asia",
    startDate: "2023-09-10",
    endDate: "2023-09-30",
    coverImage: "",
    pois: [
      {
        id: "poi-8",
        name: "Taj Mahal",
        category: "sightseeing",
        visitTime: "2 hours",
        notes: "Beautiful mausoleum in white marble",
        createdAt: "2023-09-12T10:00:00.000Z"
      },
      {
        id: "poi-9",
        name: "Great Wall of China",
        category: "sightseeing",
        visitTime: "3 hours",
        notes: "Ancient defensive structure",
        createdAt: "2023-09-15T11:00:00.000Z"
      },
      {
        id: "poi-10",
        name: "Tokyo Tower",
        category: "sightseeing",
        visitTime: "1.5 hours",
        notes: "Communication and observation tower",
        createdAt: "2023-09-20T09:00:00.000Z"
      },
      {
        id: "poi-11",
        name: "Bangkok Grand Palace",
        category: "sightseeing",
        visitTime: "2 hours",
        notes: "Official residence of the King of Thailand",
        createdAt: "2023-09-25T14:00:00.000Z"
      },
      {
        id: "poi-12",
        name: "Hotel Grand Tokyo",
        category: "accommodation",
        visitTime: "Overnight",
        notes: "Modern hotel in the heart of Tokyo",
        createdAt: "2023-09-19T18:00:00.000Z"
      },
      {
        id: "poi-13",
        name: "Sushi Bar Yohei",
        category: "food",
        visitTime: "1 hour",
        notes: "Authentic Japanese sushi",
        createdAt: "2023-09-20T20:00:00.000Z"
      }
    ],
    canvasPois: [
      {
        id: "canvas-poi-4",
        name: "Taj Mahal",
        category: "sightseeing",
        visitTime: "2 hours",
        x: 200,
        y: 150,
        notes: "Beautiful mausoleum in white marble",
        createdAt: "2023-09-12T10:00:00.000Z"
      },
      {
        id: "canvas-poi-5",
        name: "Great Wall of China",
        category: "sightseeing",
        visitTime: "3 hours",
        x: 500,
        y: 250,
        notes: "Ancient defensive structure",
        createdAt: "2023-09-15T11:00:00.000Z"
      }
    ],
    dailyItineraries: [
      {
        day: 1,
        selectedPoiIds: ["poi-10", "poi-13"],
        orderedPois: [
          { poiId: "poi-10", order: 1 },
          { poiId: "poi-13", order: 2 }
        ],
        routes: [
          {
            id: "route-3",
            fromPoiId: "poi-10",
            toPoiId: "poi-13",
            transportation: "bus",
            duration: "20 minutes"
          }
        ]
      }
    ],
    memos: [
      {
        id: "memo-3",
        title: "First Impressions of Tokyo",
        content: "Tokyo is such a vibrant city! The blend of modern and traditional is fascinating. The sushi at Sushi Bar Yohei was the best I've ever had.",
        date: "2023-09-12T20:15:00Z",
        pinned: true
      }
    ],
    scenes: [],
    activeSceneId: '',
    sceneRoutes: []
  },
  {
    id: "example-3",
    title: "American Road Trip",
    description: "Crossing the United States by car",
    startDate: "2023-07-01",
    endDate: "2023-07-21",
    coverImage: "",
    pois: [
      {
        id: "poi-14",
        name: "Grand Canyon",
        category: "sightseeing",
        visitTime: "4 hours",
        notes: "Breathtaking natural wonder",
        createdAt: "2023-07-05T09:00:00.000Z"
      },
      {
        id: "poi-15",
        name: "Las Vegas Strip",
        category: "entertainment",
        visitTime: "2 hours",
        notes: "Famous resort city",
        createdAt: "2023-07-10T21:00:00.000Z"
      },
      {
        id: "poi-16",
        name: "Golden Gate Bridge",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Iconic suspension bridge",
        createdAt: "2023-07-15T14:00:00.000Z"
      },
      {
        id: "poi-17",
        name: "Hollywood Sign",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Symbol of the American film industry",
        createdAt: "2023-07-18T10:00:00.000Z"
      },
      {
        id: "poi-18",
        name: "Motel 6 Grand Canyon",
        category: "accommodation",
        visitTime: "Overnight",
        notes: "Affordable lodging near the canyon",
        createdAt: "2023-07-04T18:00:00.000Z"
      },
      {
        id: "poi-19",
        name: "In-N-Out Burger",
        category: "food",
        visitTime: "30 minutes",
        notes: "Famous fast food chain",
        createdAt: "2023-07-15T17:00:00.000Z"
      }
    ],
    canvasPois: [
      {
        id: "canvas-poi-6",
        name: "Grand Canyon",
        category: "sightseeing",
        visitTime: "4 hours",
        x: 300,
        y: 200,
        notes: "Breathtaking natural wonder",
        createdAt: "2023-07-05T09:00:00.000Z"
      },
      {
        id: "canvas-poi-7",
        name: "Golden Gate Bridge",
        category: "sightseeing",
        visitTime: "1 hour",
        x: 550,
        y: 150,
        notes: "Iconic suspension bridge",
        createdAt: "2023-07-15T14:00:00.000Z"
      }
    ],
    dailyItineraries: [
      {
        day: 1,
        selectedPoiIds: ["poi-16", "poi-19"],
        orderedPois: [
          { poiId: "poi-16", order: 1 },
          { poiId: "poi-19", order: 2 }
        ],
        routes: [
          {
            id: "route-4",
            fromPoiId: "poi-16",
            toPoiId: "poi-19",
            transportation: "car",
            duration: "30 minutes"
          }
        ]
      },
      {
        day: 2,
        selectedPoiIds: ["poi-14"],
        orderedPois: [
          { poiId: "poi-14", order: 1 }
        ],
        routes: []
      }
    ],
    memos: [
      {
        id: "memo-4",
        title: "Road Trip Begins",
        content: "Started our cross-country road trip today! The Golden Gate Bridge was even more impressive in person. Had our first In-N-Out Burger - delicious!",
        date: "2023-07-02T19:45:00Z",
        pinned: true
      },
      {
        id: "memo-5",
        title: "Grand Canyon",
        content: "Words can't describe the beauty of the Grand Canyon. The colors at sunset were amazing.",
        date: "2023-07-05T18:30:00Z"
      }
    ],
    scenes: [],
    activeSceneId: '',
    sceneRoutes: []
  },
  {
    id: "example-4",
    title: "African Safari",
    description: "Wildlife adventures in Africa",
    startDate: "2023-11-05",
    endDate: "2023-11-20",
    coverImage: "",
    pois: [
      {
        id: "poi-20",
        name: "Serengeti National Park",
        category: "sightseeing",
        visitTime: "Full day",
        notes: "Famous wildlife reserve",
        createdAt: "2023-11-07T07:00:00.000Z"
      },
      {
        id: "poi-21",
        name: "Ngorongoro Crater",
        category: "sightseeing",
        visitTime: "Half day",
        notes: "Natural amphitheater with wildlife",
        createdAt: "2023-11-10T08:00:00.000Z"
      },
      {
        id: "poi-22",
        name: "Maasai Village",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Traditional Maasai community",
        createdAt: "2023-11-10T14:00:00.000Z"
      },
      {
        id: "poi-23",
        name: "Serengeti Safari Lodge",
        category: "accommodation",
        visitTime: "Overnight",
        notes: "Luxury lodge with wildlife views",
        createdAt: "2023-11-06T18:00:00.000Z"
      },
      {
        id: "poi-24",
        name: "Boma Dinner",
        category: "food",
        visitTime: "2 hours",
        notes: "Traditional African dinner with entertainment",
        createdAt: "2023-11-07T19:00:00.000Z"
      }
    ],
    canvasPois: [
      {
        id: "canvas-poi-8",
        name: "Serengeti National Park",
        category: "sightseeing",
        visitTime: "Full day",
        x: 250,
        y: 200,
        notes: "Famous wildlife reserve",
        createdAt: "2023-11-07T07:00:00.000Z"
      },
      {
        id: "canvas-poi-9",
        name: "Ngorongoro Crater",
        category: "sightseeing",
        visitTime: "Half day",
        x: 500,
        y: 300,
        notes: "Natural amphitheater with wildlife",
        createdAt: "2023-11-10T08:00:00.000Z"
      }
    ],
    dailyItineraries: [
      {
        day: 1,
        selectedPoiIds: ["poi-20", "poi-24"],
        orderedPois: [
          { poiId: "poi-20", order: 1 },
          { poiId: "poi-24", order: 2 }
        ],
        routes: []
      },
      {
        day: 2,
        selectedPoiIds: ["poi-21", "poi-22"],
        orderedPois: [
          { poiId: "poi-21", order: 1 },
          { poiId: "poi-22", order: 2 }
        ],
        routes: []
      }
    ],
    memos: [
      {
        id: "memo-6",
        title: "First Safari Experience",
        content: "Unbelievable! We saw lions, elephants, giraffes, and zebras on our first safari drive. The Serengeti is truly magical.",
        date: "2023-11-07T19:00:00Z",
        pinned: true
      },
      {
        id: "memo-7",
        title: "Maasai Village Visit",
        content: "Visited a traditional Maasai village today. We learned about their culture and traditions. The people were very friendly.",
        date: "2023-11-10T16:30:00Z"
      }
    ],
    scenes: [],
    activeSceneId: '',
    sceneRoutes: []
  }
];

export default function ExampleBookDetail() {
  const router = useRouter();
  const params = useParams();
  const [book, setBook] = useState<TravelBook | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Get book ID from params
  const bookId = params.id as string;

  // Find the book in example books
  useEffect(() => {
    const foundBook = exampleBooks.find(b => b.id === bookId);
    if (foundBook) {
      setBook(foundBook);
    } else {
      // Book not found, redirect to examples page
      router.push('/examples');
    }
  }, [bookId, router]);

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
        <div className="max-w-6xl mx-auto flex items-center justify-center h-96">
          <p className="text-xl text-slate-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900 transition-colors duration-300 mr-4"
            >
              ← Back to Examples
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold mb-4 text-slate-900 font-[family-name:var(--font-playfair-display)]">{book.title}</h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mb-6">{book.description}</p>
            <p className="text-lg text-slate-500">{book.startDate} - {book.endDate}</p>
          </motion.div>
        </header>

        {/* Tabs */}
        <div className="mb-12 border-b border-slate-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === "overview" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("pois")}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === "pois" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Points of Interest ({book.pois.length})
            </button>
            <button
              onClick={() => setActiveTab("itineraries")}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === "itineraries" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Daily Itineraries ({book.dailyItineraries.length})
            </button>
            <button
              onClick={() => setActiveTab("memos")}
              className={`py-4 px-1 border-b-2 font-medium ${activeTab === "memos" ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              Travel Memos ({book.memos.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Book Details */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-slate-800 font-[family-name:var(--font-playfair-display)]">Book Details</h2>
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-lg border border-slate-100">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Title</h3>
                      <p className="text-lg text-slate-900">{book.title}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Description</h3>
                      <p className="text-lg text-slate-900">{book.description}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Date Range</h3>
                      <p className="text-lg text-slate-900">{book.startDate} - {book.endDate}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Points of Interest</h3>
                      <p className="text-lg text-slate-900">{book.pois.length} locations</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Daily Itineraries</h3>
                      <p className="text-lg text-slate-900">{book.dailyItineraries.length} days planned</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 mb-1">Travel Memos</h3>
                      <p className="text-lg text-slate-900">{book.memos.length} memories recorded</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Canvas */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-slate-800 font-[family-name:var(--font-playfair-display)]">Travel Map</h2>
                <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-lg border border-slate-100 h-96">
                  <div className="relative w-full h-full">
                    {/* Simple map visualization */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg">
                      {/* Canvas POIs */}
                      {book.canvasPois.map((poi) => (
                        <div
                          key={poi.id}
                          className="absolute w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white cursor-pointer hover:bg-indigo-600 transition-colors"
                          style={{ left: `${poi.x}px`, top: `${poi.y}px` }}
                          title={poi.name}
                        >
                          <span className="text-sm font-medium">{poi.name.charAt(0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pois" && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-lg border border-slate-100">
              <h2 className="text-2xl font-semibold mb-8 text-slate-800 font-[family-name:var(--font-playfair-display)]">Points of Interest</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {book.pois.map((poi) => (
                  <div
                    key={poi.id}
                    className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-slate-900 font-[family-name:var(--font-playfair-display)]">{poi.name}</h3>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                        {poi.category}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="text-slate-500">Visit Time: </span>
                      <span className="text-slate-800 font-medium">{poi.visitTime}</span>
                    </div>
                    {poi.notes && (
                      <div>
                        <span className="text-slate-500">Notes: </span>
                        <span className="text-slate-800">{poi.notes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "itineraries" && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-lg border border-slate-100">
              <h2 className="text-2xl font-semibold mb-8 text-slate-800 font-[family-name:var(--font-playfair-display)]">Daily Itineraries</h2>

              <div className="space-y-10">
                {book.dailyItineraries.length > 0 ? (
                  book.dailyItineraries.map((itinerary) => (
                    <div key={itinerary.day}>
                      <h3 className="text-xl font-semibold mb-5 text-slate-800 font-[family-name:var(--font-playfair-display)]">Day {itinerary.day}</h3>

                      <div className="space-y-4">
                        {/* Ordered POIs */}
                        <div>
                          <h4 className="text-lg font-medium mb-3 text-slate-700">Planned Activities</h4>
                          <div className="space-y-3">
                            {itinerary.orderedPois.length > 0 ? (
                              itinerary.orderedPois.map((dailyPoi) => {
                                const poi = book.pois.find(p => p.id === dailyPoi.poiId);
                                if (!poi) return null;

                                return (
                                  <div key={dailyPoi.poiId} className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium mr-4">
                                      {dailyPoi.order}
                                    </div>
                                    <div>
                                      <div className="font-medium text-slate-900">{poi.name}</div>
                                      <div className="text-slate-500 text-sm">{poi.visitTime}</div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-slate-500">No activities planned for this day.</p>
                            )}
                          </div>
                        </div>

                        {/* Routes */}
                        {itinerary.routes.length > 0 && (
                          <div>
                            <h4 className="text-lg font-medium mb-3 text-slate-700">Routes</h4>
                            <div className="space-y-3">
                              {itinerary.routes.map((route) => {
                                const fromPoi = book.pois.find(p => p.id === route.fromPoiId);
                                const toPoi = book.pois.find(p => p.id === route.toPoiId);

                                if (!fromPoi || !toPoi) return null;

                                return (
                                  <div key={route.id} className="flex items-center">
                                    <div className="mr-4">
                                      <span className="font-medium text-slate-900">{fromPoi.name}</span>
                                    </div>
                                    <div className="mx-4">
                                      <span className="text-slate-500">→</span>
                                    </div>
                                    <div className="mr-4">
                                      <span className="font-medium text-slate-900">{toPoi.name}</span>
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                                      {route.transportation} ({route.duration})
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No daily itineraries planned yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "memos" && (
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-8 shadow-lg border border-slate-100">
              <h2 className="text-2xl font-semibold mb-8 text-slate-800 font-[family-name:var(--font-playfair-display)]">Travel Memos</h2>

              <div className="space-y-6">
                {book.memos.length > 0 ? (
                  book.memos.map((memo) => (
                    <div
                      key={memo.id}
                      className={`border border-slate-200 rounded-lg p-6 ${memo.pinned ? 'border-indigo-300 bg-indigo-50' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-semibold text-slate-900 font-[family-name:var(--font-playfair-display)]">{memo.title}</h3>
                        {memo.pinned && (
                          <span className="text-yellow-500">📌</span>
                        )}
                      </div>
                      <p className="text-slate-700 mb-3">{memo.content}</p>
                      <div className="text-sm text-slate-500">
                        {new Date(memo.date).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500">No travel memos recorded yet.</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
