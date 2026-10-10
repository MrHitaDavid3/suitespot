'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Star, 
  MapPin, 
  Wifi, 
  Coffee, 
  Waves,
  Tv, 
  Wind, 
  Calendar, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  ArrowUpRight,
  Heart,
  Share2
} from 'lucide-react';

const HOTELS_DATA: Record<string, {
  name: string;
  location: string;
  badge: string;
  rating: string;
  reviewsCount: number;
  description: string;
  price: number;
  images: string[];
  amenities: { name: string; icon: React.ComponentType<{ className?: string }> }[];
  rooms: {
    id: string;
    title: string;
    bed: string;
    capacity: string;
    size: string;
    price: number;
    features: string[];
    image: string;
  }[];
}> = {
  'casa-sol': {
    name: 'Casa Sol',
    location: 'Mallorca, Spain',
    badge: 'Sun-seeker favorite',
    rating: '4.9',
    reviewsCount: 128,
    description:
      'Perched along the Mediterranean coastline, Casa Sol combines relaxed island architecture with modern luxury. Enjoy private terrace sea views, locally sourced daily breakfasts, and seamless access to Mallorca&apos;s quietest coves.',
    price: 189,
    images: [
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QkXGXfAwhzFSwjYRyzUwsCkd2Z3ccrtRNTTePrE44Cewcrzo_64983KqKSRj4YZBBOLtpv3xbAN2aIoCxvQsubiA7dzNGloJp1w5y1xDo5kOsGgAUJ517VVM3wUWqkrhqg_0wR=s680-w680-h510-rw',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
    ],
    amenities: [
      { name: 'Private Swimming Pool', icon: Waves },
      { name: 'Complimentary Breakfast', icon: Coffee },
      { name: 'High-Speed Wi-Fi', icon: Wifi },
      { name: 'Air Conditioning', icon: Wind },
      { name: 'Smart TV', icon: Tv },
    ],
    rooms: [
      {
        id: 'deluxe-sea-view',
        title: 'Deluxe Sea View Suite',
        bed: '1 King Bed',
        capacity: '2 Guests',
        size: '42 m²',
        price: 189,
        features: ['Private balcony with ocean view', 'En-suite rainfall shower', 'Espresso machine', 'Free cancellation'],
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
      },
      {
        id: 'garden-terrace',
        title: 'Garden Terrace Room',
        bed: '1 Queen Bed',
        capacity: '2 Guests',
        size: '35 m²',
        price: 155,
        features: ['Direct courtyard access', 'Outdoor lounge chairs', 'Soaking tub', 'Free cancellation'],
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
  'hoxton-amsterdam': {
    name: 'The Hoxton, Amsterdam',
    location: 'Amsterdam, Netherlands',
    badge: 'City with character',
    rating: '4.8',
    reviewsCount: 94,
    description:
      'Set across five historic canal houses on the Herengracht, The Hoxton brings classic Dutch architecture into dialogue with modern, design-forward room layouts and curated local art.',
    price: 215,
    images: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QkXGXfAwhzFSwjYRyzUwsCkd2Z3ccrtRNTTePrE44Cewcrzo_64983KqKSRj4YZBBOLtpv3xbAN2aIoCxvQsubiA7dzNGloJp1w5y1xDo5kOsGgAUJ517VVM3wUWqkrhqg_0wR=s680-w680-h510-rw',
    ],
    amenities: [
      { name: 'Complimentary Breakfast', icon: Coffee },
      { name: 'High-Speed Wi-Fi', icon: Wifi },
      { name: 'Air Conditioning', icon: Wind },
      { name: 'Smart TV', icon: Tv },
    ],
    rooms: [
      {
        id: 'canal-view-room',
        title: 'Canal View King',
        bed: '1 King Bed',
        capacity: '2 Guests',
        size: '38 m²',
        price: 215,
        features: ['Overlooking Herengracht Canal', 'Vintage style lounge seating', 'Walk-in rain shower'],
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
      },
    ],
  },
};

export default function HotelDetailPage() {
  const params = useParams();
  const hotelId = (params?.id as string) || 'casa-sol';
  
  const hotel = HOTELS_DATA[hotelId] || HOTELS_DATA['casa-sol'];
  const [selectedRoom, setSelectedRoom] = useState(hotel.rooms[0]?.id);

  return (
    <div className="bg-canvas min-h-screen text-ink pb-24">
      {/* Breadcrumb Bar */}
      <div className="max-w-[1600px] mx-auto px-8 lg:px-16 pt-6 pb-4 flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2 text-muted">
          <a href="/" className="hover:text-ink transition-colors">Home</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <a href="/hotels" className="hover:text-ink transition-colors">Hotels</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink uppercase tracking-wider">{hotel.name}</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <Heart className="w-4 h-4" /> Save
          </button>
        </div>
      </div>

      {/* Main Header */}
      <section className="max-w-[1600px] mx-auto px-8 lg:px-16 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/95 px-3 py-1 rounded-control text-xs font-bold border border-line shadow-sm">
                {hotel.badge}
              </span>
              <div className="flex items-center gap-1 text-sm font-bold">
                <Star className="w-4 h-4 fill-ink text-ink" />
                <span>{hotel.rating}</span>
                <span className="text-muted font-normal">({hotel.reviewsCount} reviews)</span>
              </div>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight uppercase leading-none">
              {hotel.name}
            </h1>
            <p className="flex items-center gap-1.5 text-muted font-semibold mt-2">
              <MapPin className="w-4 h-4 text-ink" />
              {hotel.location}
            </p>
          </div>

          <div className="text-left lg:text-right">
            <span className="text-xs font-bold text-muted uppercase block">Starting from</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black">${hotel.price}</span>
              <span className="text-sm font-medium text-muted">/ night</span>
            </div>
          </div>
        </div>
      </section>

      {/* Image Gallery Grid */}
      <section className="max-w-[1600px] mx-auto px-8 lg:px-16 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 aspect-[16/10] rounded-card overflow-hidden shadow-sm">
            <img 
                src={hotel.images[0]} 
             alt={hotel.name}
                className="w-full h-full object-cover"
           />
          </div>
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4">
            {hotel.images.slice(1, 3).map((img, idx) => (
             <div key={idx} className="aspect-[16/10] lg:aspect-auto lg:h-[calc(50%-0.5rem)] rounded-card overflow-hidden shadow-sm">
               <img 
                    src={img} 
                   alt={`${hotel.name} detail ${idx + 1}`}
                    className="w-full h-full object-cover"
                 />
               </div>
              ))}
         </div>
        </div>
      </section>

      {/* Content & Booking Section */}
      <section className="max-w-[1600px] mx-auto px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Details & Rooms */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Overview */}
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase mb-4">About this stay</h2>
            <p className="text-lg text-muted leading-relaxed font-medium">
              {hotel.description}
            </p>
          </div>

          {/* Key Amenities */}
          <div className="border-t border-line/60 pt-8">
            <h2 className="text-xl font-black tracking-tight uppercase mb-6">What this stay offers</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {hotel.amenities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 p-3.5 bg-surface rounded-control border border-line">
                    <Icon className="w-5 h-5 text-ink shrink-0" />
                    <span className="text-xs font-bold text-ink">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Room Selection Cards */}
          <div className="border-t border-line/60 pt-8">
            <h2 className="text-2xl font-black tracking-tight uppercase mb-6">Select your room</h2>
            
            <div className="space-y-6">
              {hotel.rooms.map((room) => {
                const isSelected = selectedRoom === room.id;
                return (
                  <div 
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`p-6 rounded-card border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-ink bg-surface shadow-md' 
                        : 'border-line bg-surface/50 hover:border-ink/50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-4 aspect-[4/3] rounded-control overflow-hidden">
                        <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-ink">{room.title}</h3>
                            <span className="text-xl font-black text-ink">${room.price}<span className="text-xs font-normal text-muted">/night</span></span>
                          </div>
                          <p className="text-xs font-bold text-muted mt-1">{room.bed} · {room.capacity} · {room.size}</p>
                        </div>

                        <ul className="space-y-1.5">
                          {room.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-center gap-2 text-xs font-medium text-stone-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0" />
                              {feat}
                            </li>
                          ))}
                        </ul>

                        <div className="pt-2">
                          <button className={`w-full py-3 px-4 rounded-control text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                            isSelected 
                              ? 'bg-accent text-white' 
                              : 'bg-ink text-white hover:bg-primary-hover'
                          }`}>
                            {isSelected ? 'Selected' : 'Choose Room'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 bg-surface rounded-card border border-line shadow-lg p-6 lg:p-8 space-y-6">
            <div>
              <span className="text-xs font-black tracking-widest text-muted uppercase block mb-1">RESERVATION DETAILS</span>
              <h3 className="text-2xl font-black text-ink">Reserve your stay</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-control border border-line bg-canvas flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-ink shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-muted uppercase">DATES</span>
                    <span className="text-sm font-semibold text-ink">21 Nov 2026 – 24 Nov 2026</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-accent">3 nights</span>
              </div>

              <div className="p-4 rounded-control border border-line bg-canvas flex items-center gap-3">
                <Users className="w-5 h-5 text-ink shrink-0" />
                <div>
                  <span className="block text-[10px] font-bold tracking-wider text-muted uppercase">GUESTS</span>
                  <span className="text-sm font-semibold text-ink">2 Adults · 1 Room</span>
                </div>
              </div>
            </div>

            <div className="border-t border-line/60 pt-4 space-y-3 text-sm font-medium">
              <div className="flex justify-between text-muted">
                <span>${hotel.price} x 3 nights</span>
                <span className="text-ink font-bold">${hotel.price * 3}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Taxes & fees</span>
                <span className="text-ink font-bold">$45</span>
              </div>
              <div className="border-t border-line/60 pt-3 flex justify-between text-lg font-black text-ink">
                <span>Total</span>
                <span>${hotel.price * 3 + 45}</span>
              </div>
            </div>

            <button className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-control font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md">
              Complete Reservation <ArrowUpRight className="w-5 h-5" />
            </button>

            <p className="text-[11px] text-center text-muted font-medium">
              You won&apos;t be charged yet · Free cancellation up to 48 hours before check-in
            </p>
          </div>
        </div>

      </section>
    </div>
  );
}