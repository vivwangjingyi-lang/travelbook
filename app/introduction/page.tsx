'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTravelBookStore } from "@/stores/travelBookStore";
import ConfirmationModal from "@/components/ConfirmationModal";
import FloatingNavbar from "@/components/FloatingNavbar";

interface FormData {
  title: string;
  destination: string;
  companions: string;
  description: string;
  coverImage: string | null;
  startDate: string;
  endDate: string;
}

export default function Introduction() {
  const router = useRouter();
  const { currentBook, updateBook, isDirty, saveBook, resetBook } = useTravelBookStore();
  
  const [formData, setFormData] = useState<FormData>({
    title: currentBook?.title || "",
    destination: currentBook?.destination || "",
    companions: currentBook?.companions || "",
    description: currentBook?.description || "",
    coverImage: currentBook?.coverImage || null,
    startDate: currentBook?.startDate || "",
    endDate: currentBook?.endDate || ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  // Handle cover image upload with compression
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };
      
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max dimensions for cover image
        const maxWidth = 800;
        const maxHeight = 800;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw image with new dimensions
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality compression
          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
          
          // Update form data with compressed image
          setFormData(prev => ({ ...prev, coverImage: compressedImage }));
        }
      };
      
      // Read the file
      reader.readAsDataURL(file);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Journey name is required";
    }
    
    if (!formData.destination.trim()) {
      newErrors.destination = "Destination is required";
    }
    
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm() && currentBook) {
      // Update the current book with form data
      updateBook({
        title: formData.title,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        destination: formData.destination,
        companions: formData.companions,
        ...(formData.coverImage && { coverImage: formData.coverImage })
      });
      
      // Navigate to Chapter 1 (Transportation)
      router.push('/departure');
    }
  };

  // Handle back to library
  const handleBackToLibrary = () => {
    if (isDirty) {
      setShowModal(true);
    } else {
      router.push('/');
    }
  };

  // Save and exit
  const handleSaveAndExit = () => {
    saveBook();
    router.push('/');
  };

  // Discard changes and exit
  const handleDiscardChanges = () => {
    resetBook();
    router.push('/');
  };

  // Cancel navigation
  const handleCancel = () => {
    setShowModal(false);
  };
  
  return (
    <div className="min-h-screen p-8 pb-20 font-[family-name:var(--font-geist-sans)]">
      {/* Floating Navigation */}
      <FloatingNavbar currentChapter={0} />
      
      <div className="max-w-4xl mx-auto pt-24">
        {/* Header */}
        <motion.header 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold mb-2 text-slate-800 font-[family-name:var(--font-playfair-display)]">Introduction</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Define your journey
          </p>
        </motion.header>
        
        {/* Form */}
        <motion.div 
          className="bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Journey Name */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Journey Name
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.title ? 'border-red-500' : 'border-slate-200'} bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all`}
                placeholder="e.g., 'Summer Adventure in Italy'"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>
            
            {/* Destination */}
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-2">
                Destination
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-lg border ${errors.destination ? 'border-red-500' : 'border-slate-200'} bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all`}
                placeholder="e.g., 'Rome, Italy'"
              />
              {errors.destination && <p className="mt-1 text-sm text-red-600">{errors.destination}</p>}
            </div>
            
            {/* Travel Companions */}
            <div>
              <label htmlFor="companions" className="block text-sm font-medium text-slate-700 mb-2">
                Travel Companions (Optional)
              </label>
              <input
                type="text"
                id="companions"
                name="companions"
                value={formData.companions}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                placeholder="e.g., 'Family, Friends, Solo'"
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Journey Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
                placeholder="What are you looking forward to most on this journey?"
              ></textarea>
            </div>
            
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Journey Cover Image (Optional)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="coverImage"
                />
                <label htmlFor="coverImage" className="cursor-pointer">
                  {formData.coverImage ? (
                    <div className="relative">
                      <img 
                        src={formData.coverImage} 
                        alt="Journey Cover" 
                        className="max-h-48 mx-auto rounded-lg object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <span className="text-white font-medium">Change Image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-4xl mb-2">🖼️</span>
                      <span className="text-slate-600">Click to upload cover image</span>
                      <span className="text-xs text-slate-500 mt-1">PNG, JPG, or GIF (Max 5MB)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
            
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.startDate ? 'border-red-500' : 'border-slate-200'} bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all`}
                />
                {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.endDate ? 'border-red-500' : 'border-slate-200'} bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all`}
                />
                {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8">
              <button
                type="button"
                onClick={handleBackToLibrary}
                className="px-6 py-2.5 bg-white/80 backdrop-blur-sm text-slate-700 border border-slate-300 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300"
              >
                Back to Library
              </button>
              
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-800 text-white rounded-full shadow-lg hover:bg-slate-700 hover:shadow-xl transition-all duration-300"
              >
                Continue to Chapter 1
              </button>
            </div>
          </form>
        </motion.div>

        {/* Navigation Confirmation Modal */}
        <ConfirmationModal
          isOpen={showModal}
          onClose={handleCancel}
          onConfirm={handleSaveAndExit}
          title="You have unsaved changes"
          message="What would you like to do with your unsaved changes?"
          confirmText="Save & Exit"
          cancelText="Cancel"
        >
          {/* Additional button for Discard Changes */}
          <button
            onClick={handleDiscardChanges}
            className="absolute bottom-6 left-6 px-4 py-2 bg-gray-200/80 backdrop-blur-sm text-slate-700 rounded-full shadow-lg hover:bg-gray-300/80 transition-all duration-300 text-sm"
          >
            Discard Changes
          </button>
        </ConfirmationModal>
      </div>
    </div>
  );
}