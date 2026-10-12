'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
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
      'https://manage.isleblue.co/uploads/villas/images/9720/mallorca-villa-alegria-mallorca-2026-022-header-2_medium.jpg',
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
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SWXXNsxzmlKzs5LUAWq0ReZ5ZKGZcyoaEQvWgwwRoz41oAkaz1DNScTKPVSt3Z9MAEkab5O7HxrU0jBEjZn3envk5r0ifdTglEoehJf9A-Syi9uCjoOJYEtmJu4oHcoeSrUZktEg=s680-w680-h510-rw',
      'https://thehoxton.com/wp-content/uploads/sites/5/2020/05/Amsterdam_Hero.jpg',
    ],
    amenities: [
      { name: 'Complimentary Breakfast', icon: Coffee },
      { name: 'High-Speed Wi-Fi', icon: Wifi },
      { name: 'Air Conditioning', icon: Wind },
      { name: 'Restaurant On-Site', icon: Tv },
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
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/29/8c/6b/forestis.jpg?w=900&h=500&s=1',
      'https://boutiquehotels.org/wp-content/uploads/7ac2fd8a-5eb3-4b10-8a63-663e6e4934eb-1.webp',
    ],
    amenities: [
      { name: 'Complimentary Breakfast', icon: Coffee },
      { name: 'High-Speed Wi-Fi', icon: Wifi },
      { name: 'Luxury Spa & Wellness', icon: Sparkles },
      { name: 'Mountain Views', icon: Waves },
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
  'villa-azur': {
    name: 'Villa Azur',
    location: 'Nice, France',
    badge: 'Riviera luxury',
    rating: '4.7',
    reviewsCount: 82,
    description: 'Stunning Riviera property featuring open-air terraces, private pool, and direct access to the Mediterranean coastline.',
    price: 295,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmabu_1ZPIolwSRUFEjh9RdqIU-m5GJA1o8RWMBtxm0dncTbwgHQpIa1I&s=10',
    ],
    amenities: [
      { name: 'Private Swimming Pool', icon: Waves },
      { name: 'Beach Nearby', icon: Sparkles },
      { name: 'Free Parking', icon: Wifi },
    ],
    rooms: [
      {
        id: 'azur-suite',
        title: 'Riviera Suite',
        bed: '1 King Bed',
        capacity: '2 Guests',
        size: '48 m²',
        price: 295,
        features: ['Sea breeze terrace', 'Marble bathroom'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmabu_1ZPIolwSRUFEjh9RdqIU-m5GJA1o8RWMBtxm0dncTbwgHQpIa1I&s=10',
      }
    ]
  },
  'kyoto-ryokan': {
    name: 'Kyoto Hanasu',
    location: 'Kyoto, Japan',
    badge: 'Traditional serenity',
    rating: '4.9',
    reviewsCount: 140,
    description: 'Immerse yourself in authentic Japanese hospitality with tatami rooms, soothing hot spring baths, and kaiseki dining.',
    price: 245,
    images: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTDTC6Y7BHJ94vQmIDiMO9TIMLcJfN7VP7Q4KWqx6BWPkFi9kwSgzrN8A&s=10',
    ],
    amenities: [
      { name: 'Breakfast Included', icon: Coffee },
      { name: 'Spa & Wellness', icon: Sparkles },
      { name: 'Restaurant On-Site', icon: Tv },
    ],
    rooms: [
      {
        id: 'tatami-room',
        title: 'Traditional Tatami Suite',
        bed: 'Futon Beds',
        capacity: '2 Guests',
        size: '40 m²',
        price: 245,
        features: ['Garden view', 'Private Onsen access'],
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTDTC6Y7BHJ94vQmIDiMO9TIMLcJfN7VP7Q4KWqx6BWPkFi9kwSgzrN8A&s=10',
      }
    ]
  },
  'nordic-haven': {
    name: 'Nordic Light Hotel',
    location: 'Stockholm, Sweden',
    badge: 'Minimalist design',
    rating: '4.5',
    reviewsCount: 76,
    description: 'Sleek Scandinavian design centered around natural light, minimalist aesthetics, and central Stockholm convenience.',
    price: 175,
    images: [
      'https://cdn.prod.website-files.com/649dd95ac16380b41dca4834/66cdd6c51a158aa42339158b_The%20haven%20islands%20Best%20Airbnb%20maison%20ours%20Treehouse%20Cabane%20dans%20les%20arbres%20Anthony%20VERLAINE%2026.jpg',
    ],
    amenities: [
      { name: 'High-Speed Wi-Fi', icon: Wifi },
      { name: 'Restaurant', icon: Coffee },
      { name: 'Free Parking', icon: Wind },
    ],
    rooms: [
      {
        id: 'nordic-double',
        title: 'Nordic Minimalist Double',
        bed: '1 Queen Bed',
        capacity: '2 Guests',
        size: '30 m²',
        price: 175,
        features: ['Forest view', 'Rainfall shower'],
        image: 'https://cdn.prod.website-files.com/649dd95ac16380b41dca4834/66cdd6c51a158aa42339158b_The%20haven%20islands%20Best%20Airbnb%20maison%20ours%20Treehouse%20Cabane%20dans%20les%20arbres%20Anthony%20VERLAINE%2026.jpg',
      }
    ]
  },
  'oasis-tulum': {
    name: 'Oasis Tulum',
    location: 'Tulum, Mexico',
    badge: 'Tropical escape',
    rating: '4.6',
    reviewsCount: 110,
    description: 'Steps away from Caribbean turquoise waters, offering boho-chic cabanas, beachfront dining, and lush jungle vibes.',
    price: 165,
    images: [
      'https://www.oasistulumresort.com/images/gallery/gallery-3.jpg',
    ],
    amenities: [
      { name: 'Beach Nearby', icon: Waves },
      { name: 'Swimming Pool', icon: Sparkles },
      { name: 'Breakfast Included', icon: Coffee },
    ],
    rooms: [
      {
        id: 'tulum-bungalow',
        title: 'Jungle Beach Bungalow',
        bed: '1 King Bed',
        capacity: '2 Guests',
        size: '45 m²',
        price: 165,
        features: ['Hammock terrace', 'Outdoor shower'],
        image: 'https://www.oasistulumresort.com/images/gallery/gallery-3.jpg',
      }
    ]
  },
  'alpine-lodge': {
    name: 'Zermatt Peak Lodge',
    location: 'Zermatt, Switzerland',
    badge: 'Alpine classic',
    rating: '5.0',
    reviewsCount: 64,
    description: 'Luxurious chalet overlooking the Matterhorn with private wellness facilities, gourmet dining, and ski-in/ski-out access.',
    price: 450,
    images: [
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/63917895.jpg?k=c2bf510cc721db6cee0641427afce37dc48e7c4bd1baabfcea4f8be62ca5195f&o=',
    ],
    amenities: [
      { name: 'Mountain Views', icon: Waves },
      { name: 'Spa & Wellness', icon: Sparkles },
      { name: 'Gourmet Restaurant', icon: Coffee },
    ],
    rooms: [
      {
        id: 'matterhorn-suite',
        title: 'Matterhorn Master Suite',
        bed: '1 King Bed',
        capacity: '2 Guests',
        size: '70 m²',
        price: 450,
        features: ['Fireplace', 'Private jacuzzi', 'Matterhorn view'],
        image: 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/63917895.jpg?k=c2bf510cc721db6cee0641427afce37dc48e7c4bd1baabfcea4f8be62ca5195f&o=',
      }
    ]
  },
  'soho-urban': {
    name: 'The Soho Loft',
    location: 'London, UK',
    badge: 'Trendy hotspot',
    rating: '4.4',
    reviewsCount: 55,
    description: 'Industrial-chic loft apartments in the heart of London featuring exposed brick, high ceilings, and vibrant local nightlife.',
    price: 140,
    images: [
      'https://thumbs.6sqft.com/wp-content/uploads/2021/12/16122119/421_West_Broadway_Apt_2N_New_York_10012__2_.jpg?w=1560&format=webp',
    ],
    amenities: [
      { name: 'High-Speed Wi-Fi', icon: Wifi },
      { name: 'Restaurant', icon: Coffee },
      { name: 'Free Parking', icon: Wind },
    ],
    rooms: [
      {
        id: 'soho-studio',
        title: 'Soho Urban Studio',
        bed: '1 Queen Bed',
        capacity: '2 Guests',
        size: '32 m²',
        price: 140,
        features: ['City views', 'Kitchenette'],
        image: 'https://thumbs.6sqft.com/wp-content/uploads/2021/12/16122119/421_West_Broadway_Apt_2N_New_York_10012__2_.jpg?w=1560&format=webp',
      }
    ]
  },
};

export default function HotelDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = (params?.id as string) || 'casa-sol';
  
  const hotel = HOTELS_DATA[hotelId] || HOTELS_DATA['casa-sol'];
  const [selectedRoomId, setSelectedRoomId] = useState(hotel.rooms[0]?.id);

  // Get today's date in YYYY-MM-DD format as the strict minimum boundary
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Default check-in to today or later, check-out to tomorrow or later
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 3);
  const defaultCheckOutStr = tomorrowObj.toISOString().split('T')[0];

  const paramCheckIn = searchParams.get('checkIn');
  const paramCheckOut = searchParams.get('checkOut');

  const [checkIn, setCheckIn] = useState(paramCheckIn && paramCheckIn >= todayStr ? paramCheckIn : todayStr);
  const [checkOut, setCheckOut] = useState(paramCheckOut && paramCheckOut > checkIn ? paramCheckOut : defaultCheckOutStr);

  const currentRoom = hotel.rooms.find((r) => r.id === selectedRoomId) || hotel.rooms[0];

  // Handle Check-in change and automatically push check-out forward if needed
  const handleCheckInChange = (newCheckIn: string) => {
    setCheckIn(newCheckIn);
    if (newCheckIn >= checkOut) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  // Calculate nights dynamically
  const calculateNights = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights(checkIn, checkOut);
  const roomTotal = currentRoom.price * nights;
  const taxes = 45;
  const grandTotal = roomTotal + taxes;

  return (
    <div className="bg-canvas min-h-screen text-ink pb-24">
      {/* Breadcrumb Bar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 pt-6 pb-4 flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2 text-muted min-w-0">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/hotels" className="hover:text-ink transition-colors">Hotels</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-ink uppercase tracking-wider truncate">{hotel.name}</span>
        </div>
      </div>

      {/* Main Header */}
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-2">
              <span className="bg-white/95 px-3 py-1 rounded-control text-xs font-bold border border-line shadow-sm whitespace-nowrap">
                {hotel.badge}
              </span>
              <div className="flex items-center gap-1 text-sm font-bold whitespace-nowrap">
                <Star className="w-4 h-4 fill-ink text-ink" />
                <span>{hotel.rating}</span>
                <span className="text-muted font-normal">({hotel.reviewsCount} reviews)</span>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-none break-words">
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
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 mb-10 sm:mb-16">
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
      <section className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        
        {/* Left Column: Details & Rooms */}
        <div className="lg:col-span-7 space-y-10 sm:space-y-12">
          
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
            <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
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
                const isSelected = selectedRoomId === room.id;
                return (
                  <div 
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-4 sm:p-6 rounded-card border transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-ink bg-surface shadow-md' 
                        : 'border-line bg-surface/50 hover:border-ink/50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
                      <div className="md:col-span-4 aspect-[4/3] rounded-control overflow-hidden">
                        <img src={room.image} alt={room.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex flex-col min-[400px]:flex-row min-[400px]:items-start justify-between gap-1 min-[400px]:gap-4">
                            <h3 className="text-xl font-black text-ink">{room.title}</h3>
                            <span className="text-xl font-black text-ink whitespace-nowrap">${room.price}<span className="text-xs font-normal text-muted">/night</span></span>
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
        <div id="reserve" className="lg:col-span-5 scroll-mt-4">
          <div className="sticky top-8 bg-surface rounded-card border border-line shadow-lg p-5 sm:p-6 lg:p-8 space-y-6">
            <div>
              <span className="text-xs font-black tracking-widest text-muted uppercase block mb-1">RESERVATION DETAILS</span>
              <h3 className="text-2xl font-black text-ink">Reserve your stay</h3>
            </div>

            <div className="space-y-4">
              {/* Interactive Date Pickers with Strict Future Restriction */}
              <div className="grid grid-cols-2 gap-3 p-4 rounded-control border border-line bg-canvas">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider text-muted uppercase mb-1">CHECK-IN</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={checkIn}
                    onChange={(e) => handleCheckInChange(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-ink focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="border-l border-line pl-3">
                  <label className="block text-[10px] font-bold tracking-wider text-muted uppercase mb-1">CHECK-OUT</label>
                  <input
                    type="date"
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-ink focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-4 rounded-control border border-line bg-canvas flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-ink shrink-0" />
                  <div>
                    <span className="block text-[10px] font-bold tracking-wider text-muted uppercase">SELECTED ROOM</span>
                    <span className="text-sm font-semibold text-ink truncate block max-w-[200px]">{currentRoom.title}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-accent whitespace-nowrap">{nights} {nights === 1 ? 'night' : 'nights'}</span>
              </div>
            </div>

            <div className="border-t border-line/60 pt-4 space-y-3 text-sm font-medium">
              <div className="flex justify-between text-muted">
                <span>${currentRoom.price} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span className="text-ink font-bold">${roomTotal}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Taxes & fees</span>
                <span className="text-ink font-bold">${taxes}</span>
              </div>
              <div className="border-t border-line/60 pt-3 flex justify-between text-lg font-black text-ink">
                <span>Total</span>
                <span>${grandTotal}</span>
              </div>
            </div>

            <button 
              onClick={() => alert(`Successfully reserved ${currentRoom.title} from ${checkIn} to ${checkOut} (${nights} nights, $${grandTotal} total)!`)}
              className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-control font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              Complete Reservation <ArrowUpRight className="w-5 h-5" />
            </button>

            <p className="text-[11px] text-center text-muted font-medium">
              You won&apos;t be charged yet · Free cancellation up to 48 hours before check-in
            </p>
          </div>
        </div>

      </section>

      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <span className="text-xl font-black text-ink">${currentRoom.price}</span>
          <span className="text-xs font-medium text-muted"> / night</span>
        </div>
        <a
          href="#reserve"
          className="bg-accent hover:bg-accent-hover text-white text-sm font-bold px-5 py-3 rounded-control whitespace-nowrap transition-colors"
        >
          Reserve
        </a>
      </div>
    </div>
  );
}