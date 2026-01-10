'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FloatingNavbar from "@/components/FloatingNavbar";
import { useTravelBookStore } from "@/stores/travelBookStore";

type TransportationType = 'flight' | 'train' | 'bus' | 'car' | 'other';

interface TransportationTicket {
  id: string;
  type: TransportationType;
  provider: string;
  ticketNumber: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  price: string;
  class: string;
  notes?: string;
}

export default function Departure() {
  const router = useRouter();
  const { currentBook, updateBook } = useTravelBookStore();
  
  // Use transportation tickets from current book or initialize empty array
  const [tickets, setTickets] = useState<TransportationTicket[]>(() => {
    // @ts-ignore - We'll add transportationTickets to the store later if needed
    return currentBook?.transportationTickets || [];
  });
  
  const [editingTicket, setEditingTicket] = useState<TransportationTicket | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Initialize form data
  const [formData, setFormData] = useState<Omit<TransportationTicket, 'id'>>({
    type: 'flight',
    provider: '',
    ticketNumber: '',
    departureLocation: '',
    arrivalLocation: '',
    departureDate: currentBook?.startDate || '',
    departureTime: '12:00',
    arrivalDate: currentBook?.startDate || '',
    arrivalTime: '14:00',
    price: '',
    class: '',
    notes: ''
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle add ticket
  const handleAddTicket = () => {
    const newTicket: TransportationTicket = {
      ...formData,
      id: Date.now().toString()
    };
    
    const updatedTickets = [...tickets, newTicket];
    setTickets(updatedTickets);
    // @ts-ignore - We'll properly update the store later if needed
    updateBook({ transportationTickets: updatedTickets });
    
    setShowAddModal(false);
    resetForm();
  };
  
  // Handle delete ticket
  const handleDeleteTicket = (ticketId: string) => {
    const updatedTickets = tickets.filter(ticket => ticket.id !== ticketId);
    setTickets(updatedTickets);
    // @ts-ignore - We'll properly update the store later if needed
    updateBook({ transportationTickets: updatedTickets });
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'flight',
      provider: '',
      ticketNumber: '',
      departureLocation: '',
      arrivalLocation: '',
      departureDate: currentBook?.startDate || '',
      departureTime: '12:00',
      arrivalDate: currentBook?.startDate || '',
      arrivalTime: '14:00',
      price: '',
      class: '',
      notes: ''
    });
    setEditingTicket(null);
  };
  
  // Handle continue to next chapter
  const handleContinue = () => {
    router.push('/collection');
  };
  
  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={1} />
      
      <div className="max-w-4xl mx-auto pt-24">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 text-slate-800 font-[family-name:var(--font-playfair-display)]">Chapter I: Departure</h1>
          <p className="text-lg text-slate-600 leading-relaxed">Transportation Details</p>
        </header>

        {/* Main Content */}
        <main className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8">
          {/* Add Ticket Button */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
            >
              Add Transportation
            </button>
          </div>
          
          {/* Tickets List */}
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">✈️</span>
              <h3 className="text-xl font-semibold mb-2 text-slate-800">No Transportation Added Yet</h3>
              <p className="text-slate-600">Add your flight, train, or other travel tickets using the button above.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-slate-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">
                        {ticket.type === 'flight' && '✈️'}
                        {ticket.type === 'train' && '🚄'}
                        {ticket.type === 'bus' && '🚌'}
                        {ticket.type === 'car' && '🚗'}
                        {ticket.type === 'other' && '📋'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">
                          {ticket.provider} - {ticket.ticketNumber}
                        </h3>
                        <div className="text-sm text-slate-500">
                          {ticket.type.charAt(0).toUpperCase() + ticket.type.slice(1)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete ticket"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Departure</div>
                      <div className="text-slate-800 font-medium">{ticket.departureLocation}</div>
                      <div className="text-sm text-slate-500">
                        {ticket.departureDate} {ticket.departureTime}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Arrival</div>
                      <div className="text-slate-800 font-medium">{ticket.arrivalLocation}</div>
                      <div className="text-sm text-slate-500">
                        {ticket.arrivalDate} {ticket.arrivalTime}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Class</div>
                      <div className="text-slate-800">{ticket.class}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-slate-600 mb-1">Price</div>
                      <div className="text-slate-800">{ticket.price}</div>
                    </div>
                  </div>
                  
                  {ticket.notes && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-slate-600 mb-1">Notes</div>
                      <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded">{ticket.notes}</div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8">
            <button
              type="button"
              onClick={() => router.push('/introduction')}
              className="px-6 py-2 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300"
            >
              Back to Introduction
            </button>
            
            <button
              type="button"
              onClick={handleContinue}
              className="px-6 py-2 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
            >
              Continue to Chapter 2
            </button>
          </div>
        </main>
        
        {/* Add Ticket Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-slate-800 font-[family-name:var(--font-playfair-display)]">
                  Add Transportation Ticket
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-500 hover:text-slate-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Transportation Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    <option value="flight">✈️ Flight</option>
                    <option value="train">🚄 Train</option>
                    <option value="bus">🚌 Bus</option>
                    <option value="car">🚗 Car</option>
                    <option value="other">📋 Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Provider
                  </label>
                  <input
                    type="text"
                    name="provider"
                    value={formData.provider}
                    onChange={handleChange}
                    placeholder="e.g., 'Air France', 'Eurostar'"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ticket Number
                  </label>
                  <input
                    type="text"
                    name="ticketNumber"
                    value={formData.ticketNumber}
                    onChange={handleChange}
                    placeholder="e.g., 'AF1234', 'E45678'"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Class
                  </label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    placeholder="e.g., 'Economy', 'First Class'"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Departure Location
                  </label>
                  <input
                    type="text"
                    name="departureLocation"
                    value={formData.departureLocation}
                    onChange={handleChange}
                    placeholder="e.g., 'Paris CDG', 'London Euston'"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Arrival Location
                  </label>
                  <input
                    type="text"
                    name="arrivalLocation"
                    value={formData.arrivalLocation}
                    onChange={handleChange}
                    placeholder="e.g., 'Rome FCO', 'Florence SMN'"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Departure Date
                    </label>
                    <input
                      type="date"
                      name="departureDate"
                      value={formData.departureDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Departure Time
                    </label>
                    <input
                      type="time"
                      name="departureTime"
                      value={formData.departureTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Arrival Date
                    </label>
                    <input
                      type="date"
                      name="arrivalDate"
                      value={formData.arrivalDate}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Arrival Time
                    </label>
                    <input
                      type="time"
                      name="arrivalTime"
                      value={formData.arrivalTime}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g., '€120', '$150'"
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Additional details..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-4 pt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-white/80 backdrop-blur-sm border border-slate-300 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 text-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTicket}
                  className="px-6 py-3 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
                >
                  Add Ticket
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}