'use client';

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
        notes: "Iconic landmark with stunning views"
      },
      {
        id: "poi-2",
        name: "Louvre Museum",
        category: "sightseeing",
        visitTime: "3 hours",
        notes: "World's largest art museum"
      },
      {
        id: "poi-3",
        name: "Colosseum",
        category: "sightseeing",
        visitTime: "2 hours",
        notes: "Ancient Roman amphitheater"
      },
      {
        id: "poi-4",
        name: "Pisa Tower",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Famous leaning tower"
      },
      {
        id: "poi-5",
        name: "Rialto Bridge",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Beautiful bridge in Venice"
      },
      {
        id: "poi-6",
        name: "Le Grand Paris Hotel",
        category: "accommodation",
        visitTime: "Overnight",
        notes: "Luxury hotel with excellent service"
      },
      {
        id: "poi-7",
        name: "Trattoria Da Luigi",
        category: "food",
        visitTime: "1.5 hours",
        notes: "Authentic Italian cuisine"
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
        notes: "Iconic landmark with stunning views"
      },
      {
        id: "canvas-poi-2",
        name: "Louvre Museum",
        category: "sightseeing",
        visitTime: "3 hours",
        x: 400,
        y: 200,
        notes: "World's largest art museum"
      },
      {
        id: "canvas-poi-3",
        name: "Colosseum",
        category: "sightseeing",
        visitTime: "2 hours",
        x: 600,
        y: 350,
        notes: "Ancient Roman amphitheater"
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
    ]
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
        notes: "Beautiful mausoleum in white marble"
      },
      {
        id: "poi-9",
        name: "Great Wall of China",
        category: "sightseeing",
        visitTime: "3 hours",
        notes: "Ancient defensive structure"
      },
      {
        id: "poi-10",
        name: "Tokyo Tower",
        category: "sightseeing",
        visitTime: "1.5 hours",
        notes: "Communication and observation tower"
      },
      {
        id: "poi-11",
        name: "Bangkok Grand Palace",
        category: "sightseeing",
        visitTime: "2 hours",
        notes: "Official residence of the King of Thailand"
      },
      {
        id: "poi-12",
        name: "Hotel Grand Tokyo",
        category: "accommodation",
        visitTime: "Overnight",
        notes: "Modern hotel in the heart of Tokyo"
      },
      {
        id: "poi-13",
        name: "Sushi Bar Yohei",
        category: "food",
        visitTime: "1 hour",
        notes: "Authentic Japanese sushi"
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
        notes: "Beautiful mausoleum in white marble"
      },
      {
        id: "canvas-poi-5",
        name: "Great Wall of China",
        category: "sightseeing",
        visitTime: "3 hours",
        x: 500,
        y: 250,
        notes: "Ancient defensive structure"
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
    ]
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
        notes: "Breathtaking natural wonder"
      },
      {
        id: "poi-15",
        name: "Las Vegas Strip",
        category: "entertainment",
        visitTime: "2 hours",
        notes: "Famous resort city"
      },
      {
        id: "poi-16",
        name: "Golden Gate Bridge",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Iconic suspension bridge"
      },
      {
        id: "poi-17",
        name: "Hollywood Sign",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Symbol of the American film industry"
      },
      {
        id: "poi-18",
        name: "Motel 6 Grand Canyon",
        category: "accommodation",
        visitTime: "Overnight",
        notes: "Affordable lodging near the canyon"
      },
      {
        id: "poi-19",
        name: "In-N-Out Burger",
        category: "food",
        visitTime: "30 minutes",
        notes: "Famous fast food chain"
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
        notes: "Breathtaking natural wonder"
      },
      {
        id: "canvas-poi-7",
        name: "Golden Gate Bridge",
        category: "sightseeing",
        visitTime: "1 hour",
        x: 550,
        y: 150,
        notes: "Iconic suspension bridge"
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
    ]
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
        notes: "Famous wildlife reserve"
      },
      {
        id: "poi-21",
        name: "Ngorongoro Crater",
        category: "sightseeing",
        visitTime: "Half day",
        notes: "Natural amphitheater with wildlife"
      },
      {
        id: "poi-22",
        name: "Maasai Village",
        category: "sightseeing",
        visitTime: "1 hour",
        notes: "Traditional Maasai community"
      },
      {
        id: "poi-23",
        name: "Serengeti Safari Lodge",
        category: "accommodation",
        visitTime: "Overnight",
        notes: "Luxury lodge with wildlife views"
      },
      {
        id: "poi-24",
        name: "Boma Dinner",
        category: "food",
        visitTime: "2 hours",
        notes: "Traditional African dinner with entertainment"
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
        notes: "Famous wildlife reserve"
      },
      {
        id: "canvas-poi-9",
        name: "Ngorongoro Crater",
        category: "sightseeing",
        visitTime: "Half day",
        x: 500,
        y: 300,
        notes: "Natural amphitheater with wildlife"
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
    ]
  }
];

export default function ExamplesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900 transition-colors duration-300 mr-4"
            >
              ← Back to Home
            </button>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold mb-4 text-slate-900 font-[family-name:var(--font-playfair-display)]">Project Examples</h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Explore these beautiful travel journals created with The Anthology
            </p>
          </motion.div>
        </header>

        {/* Example Books Grid */}
        <section className="mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {exampleBooks.map((book, index) => (
              <motion.div
                key={book.id}
                className="aspect-[3/4] rounded-xl overflow-hidden relative group cursor-pointer border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.1)]"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 25px 70px -12px rgba(0, 0, 0, 0.3)"
                }}
                transition={{ duration: 0.3 }}
                onClick={() => router.push(`/examples/${book.id}`)}
              >
                {/* Book Cover */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-300 via-purple-200 to-amber-200">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 via-purple-300/20 to-amber-300/20"></div>
                  {/* Book Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-8xl opacity-30">📖</span>
                  </div>
                </div>
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                
                {/* Book Content (At Bottom) */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                  {/* Date Range */}
                  <div className="text-sm opacity-90 mb-2">
                    {book.startDate} - {book.endDate}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-white font-[family-name:var(--font-playfair-display)]">{book.title}</h3>
                  
                  {/* Volume Number */}
                  <div className="text-xs opacity-70 mt-1">Example {index + 1}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Tutorial Section */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-4xl font-semibold mb-12 text-center text-slate-800 font-[family-name:var(--font-playfair-display)]">How to Use The Anthology</h2>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-indigo-700">1</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-800 font-[family-name:var(--font-playfair-display)]">Create Your Book</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Click the "Create New Book" button on the homepage to start your travel journal. Enter a title, description, and date range for your journey.
                    </p>
                  </div>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-indigo-700">2</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-800 font-[family-name:var(--font-playfair-display)]">Add Content</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Use the different sections (Introduction, Plot, Collection, Canvas, Departure, Epilogue) to add photos, notes, and memories from your trip.
                    </p>
                  </div>
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-indigo-700">3</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-800 font-[family-name:var(--font-playfair-display)]">Customize Design</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Customize the appearance of your travel book with different layouts, colors, and fonts to make it uniquely yours.
                    </p>
                  </div>
                </div>
                
                {/* Step 4 */}
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-indigo-700">4</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold mb-3 text-slate-800 font-[family-name:var(--font-playfair-display)]">Save & Share</h3>
                    <p className="text-slate-600 leading-relaxed">
                      Your travel book is automatically saved as you work. Share your finished journal with friends and family to relive your adventures together.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
