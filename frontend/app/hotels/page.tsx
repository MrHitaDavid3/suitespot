'use client';

import React, { useState } from 'react';
import { Star, MapPin, Heart, ArrowUpRight, Filter } from 'lucide-react';

const CATEGORIES = [
  'All Stays',
  'By the coast',
  'City escapes',
  'Into the wild',
  'Design-led',
];

const ALL_HOTELS = [
  {
    id: 'casa-sol',
    name: 'Casa Sol',
    location: 'MALLORCA, SPAIN',
    category: 'By the coast',
    badge: 'Sun-seeker favorite',
    rating: '4.9',
    tags: 'Pool · Breakfast included · Beach nearby',
    price: '$189',
    image:
      'https://manage.isleblue.co/uploads/villas/images/9720/mallorca-villa-alegria-mallorca-2026-022-header-2_medium.jpg',
  },
  {
    id: 'hoxton-amsterdam',
    name: 'The Hoxton, Amsterdam',
    location: 'AMSTERDAM, NETHERLANDS',
    category: 'City escapes',
    badge: 'City with character',
    rating: '4.8',
    tags: 'Canal views · Restaurant · Design-led rooms',
    price: '$215',
    image:
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SWXXNsxzmlKzs5LUAWq0ReZ5ZKGZcyoaEQvWgwwRoz41oAkaz1DNScTKPVSt3Z9MAEkab5O7HxrU0jBEjZn3envk5r0ifdTglEoehJf9A-Syi9uCjoOJYEtmJu4oHcoeSrUZktEg=s680-w680-h510-rw',
  },
  {
    id: 'forestis',
    name: 'Forestis',
    location: 'DOLOMITES, ITALY',
    category: 'Into the wild',
    badge: 'A breath of fresh air',
    rating: '4.9',
    tags: 'Mountain views · Spa · Adults-only',
    price: '$340',
    image:
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/29/8c/6b/forestis.jpg?w=900&h=500&s=1',
  },
];

export default function HotelsDirectoryPage() {
  const [activeCategory, setActiveCategory] = useState('All Stays');

  const filteredHotels = activeCategory === 'All Stays'
    ? ALL_HOTELS
    : ALL_HOTELS.filter((h) => h.category === activeCategory);

  return (
    <div className="bg-canvas min-h-screen text-ink py-12 px-8 lg:px-16 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="mb-10 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-accent inline-block"></span>
          <span className="text-xs font-black tracking-widest uppercase text-ink">
            DIRECTORY
          </span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight uppercase leading-none">
          ALL HOTELS & STAYS
        </h1>
        <p className="text-lg text-muted font-medium max-w-xl">
          Explore our complete collection of handpicked properties across the globe.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-4 mb-10 border-b border-line/60">
        <div className="flex items-center gap-3">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-ink text-white border-ink'
                    : 'bg-transparent text-ink border-line hover:border-ink/50'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-muted shrink-0">
          <Filter className="w-4 h-4" />
          <span>Showing {filteredHotels.length} stays</span>
        </div>
      </div>

      {/* Hotel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredHotels.map((hotel) => (
          <div key={hotel.id} className="group flex flex-col justify-between">
            
            <div className="relative aspect-[4/3] rounded-card overflow-hidden mb-5 shadow-sm">
              <img
                src={hotel.image}
                alt={hotel.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-control text-xs font-bold text-ink shadow-sm">
                {hotel.badge}
              </div>

              <button className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center text-ink hover:bg-white transition-colors shadow-sm">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold text-muted mb-1.5">
                <span className="tracking-wider">{hotel.location}</span>
                <div className="flex items-center gap-1 text-ink">
                  <Star className="w-3.5 h-3.5 fill-ink text-ink" />
                  <span>{hotel.rating}</span>
                </div>
              </div>

              <h3 className="text-2xl font-black text-ink tracking-tight mb-1.5">
                {hotel.name}
              </h3>

              <p className="text-xs text-muted font-medium mb-6">
                {hotel.tags}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-line/60">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-ink">{hotel.price}</span>
                  <span className="text-xs font-medium text-muted">/ night</span>
                </div>
              </div>

              <a
                href={`/hotels/${hotel.id}`}
                className="inline-flex items-center gap-2 bg-ink hover:bg-primary-hover text-white font-bold text-xs px-5 py-3 rounded-control transition-all"
              >
                View stay <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}