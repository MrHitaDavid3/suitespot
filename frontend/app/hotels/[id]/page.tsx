'use client';

import Link from 'next/link';
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
  Sparkles,
  Users, 
  ChevronRight, 
  CheckCircle2, 
  ArrowUpRight
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
      "Perched along the Mediterranean coastline, Casa Sol combines relaxed island architecture with modern luxury. Enjoy private terrace sea views, locally sourced daily breakfasts, and seamless access to Mallorca's quietest coves.",
    price: 189,
    images: [
      'https://manage.isleblue.co/uploads/villas/images/9720/mallorca-villa-alegria-mallorca-2026-017.jpg',
      'https://manage.isleblue.co/uploads/villas/images/9720/mallorca-villa-alegria-mallorca-2026-001.jpg',
      'https://manage.isleblue.co/uploads/villas/images/9720/mallorca-villa-alegria-mallorca-2026-025.jpg',
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
        image: 'https://manage.isleblue.co/uploads/villas/images/9720/mallorca-villa-alegria-mallorca-2026-003.jpg',
      },
      {
        id: 'garden-terrace',
        title: 'Garden Terrace Room',
        bed: '1 Queen Bed',
        capacity: '2 Guests',
        size: '35 m²',
        price: 155,
        features: ['Direct courtyard access', 'Outdoor lounge chairs', 'Soaking tub', 'Free cancellation'],
        image: 'https://manage.isleblue.co/uploads/villas/images/9720/mallorca-villa-alegria-mallorca-2026-020.jpg',
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
      'https://thehoxton.com/wp-content/uploads/sites/5/2020/05/Amsterdam_Hero.jpg',
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TcmMQ8mgIob-yujUh6oZbdotb91bYkr5iB58ALdtAMpQCPjpQBtzGy46oF36elW6-z52nurdk4-ZeIZV5kTxpwftnAaZkBzX1rCbi6Lus24OEX3ii2eU74V0y2yICu4XHl1p4=s680-w680-h510-rw',
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TMqCZj0zC9mES8ybt5IAQ-Rjg2iKpbfKK5iBxGDTnYe8UJjob8YQidP63jnzmP6RMwVYMLYaTxosnaI0AJfF4TTJ8PyfSv263ikJmpUg68oY5FLkeu3E08ZA8fRNpzd7IxR_c_=s680-w680-h510-rw',
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
        image: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SRv_5gKGp5HUEJqZXBLSSnoU4PQUUNUKZ1njJI5CQNNZPy16ACrmG0Y82rUZ5mjmOfnArobmiGZY15Cur3dG2uJRfJgfpMmukdRotAigZTo40YP3J7szFHdZyZq3hiDYbZMT1r=s680-w680-h510-rw',
      },
    ],
  },
  'forestis': {
    name: 'Forestis',
    location: 'Dolomites, Italy',
    badge: 'A breath of fresh air',
    rating: '4.9',
    reviewsCount: 118,
    description:
      'Perched high in the Dolomites, Forestis combines clear mountain air, pure spring water, and minimalist wood-and-stone architecture to create an unmatched alpine sanctuary for deep relaxation.',
    price: 340,
    images: [
      'https://boutiquehotels.org/wp-content/uploads/7ac2fd8a-5eb3-4b10-8a63-663e6e4934eb-1.webp',
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSD8mBu5dFw8y2RtMqhxKnZc55PsqwGyrcThkmGeT_1f4sMyzoWkbIzYvo&s=10',
    ],
    amenities: [
      { name: 'Complimentary Breakfast', icon: Coffee },
      { name: 'High-Speed Wi-Fi', icon: Wifi },
      { name: 'Luxury Spa & Wellness', icon: Sparkles },
      { name: 'Indoor & Outdoor Pool', icon: Waves },
    ],
    rooms: [
      {
        id: 'tower-suite',
        title: 'Tower Suite Dolomites',
        bed: '1 King Bed',
        capacity: '2 Guests',
        size: '55 m²',
        price: 340,
        features: ['Panoramic Dolomite mountain views', 'Private sun loggia', 'Natural stone bathroom with soaking tub'],
        image: 'https://media.cntraveler.com/photos/69fb03505661b487f1aacdb5/16:9/w_2560%2Cc_limit/Rooftop-Forestis%2C-Bressanone-Triple-Crown-May2026-PR-Global-1.jpg',
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
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/hotels" className="hover:text-ink transition-colors">Hotels</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink uppercase tracking-wider">{hotel.name}</span>
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