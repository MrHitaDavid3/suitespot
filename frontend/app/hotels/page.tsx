'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchBar from '@/components/search/SearchBar';
import FilterPanel from '@/components/search/FilterPanel';
import SortControl from '@/components/search/SortControl';
import { Star, Heart, ArrowUpRight } from 'lucide-react';

const HOTELS = [
  {
    id: 'casa-sol',
    name: 'Casa Sol',
    location: 'MALLORCA, SPAIN',
    badge: 'Sun-seeker favorite',
    rating: 4.9,
    stars: 5,
    roomTypes: ['double', 'suite'],
    tags: ['Pool', 'Breakfast included', 'Beach nearby'],
    price: 189,
    recommendedRank: 1,
    image:
      'https://manage.isleblue.co/uploads/villas/images/9720/mallorca-villa-alegria-mallorca-2026-022-header-2_medium.jpg',
  },
  {
    id: 'hoxton-amsterdam',
    name: 'The Hoxton, Amsterdam',
    location: 'AMSTERDAM, NETHERLANDS',
    badge: 'City with character',
    rating: 4.8,
    stars: 4,
    roomTypes: ['single', 'double'],
    tags: ['Restaurant'],
    price: 215,
    recommendedRank: 2,
    image:
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SWXXNsxzmlKzs5LUAWq0ReZ5ZKGZcyoaEQvWgwwRoz41oAkaz1DNScTKPVSt3Z9MAEkab5O7HxrU0jBEjZn3envk5r0ifdTglEoehJf9A-Syi9uCjoOJYEtmJu4oHcoeSrUZktEg=s680-w680-h510-rw',
  },
  {
    id: 'forestis',
    name: 'Forestis',
    location: 'DOLOMITES, ITALY',
    badge: 'A breath of fresh air',
    rating: 4.9,
    stars: 5,
    roomTypes: ['suite'],
    tags: ['Mountain views', 'Spa & wellness'],
    price: 340,
    recommendedRank: 3,
    image:
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2c/29/8c/6b/forestis.jpg?w=900&h=500&s=1',
  },
  {
    id: 'villa-azur',
    name: 'Villa Azur',
    location: 'NICE, FRANCE',
    badge: 'Riviera luxury',
    rating: 4.7,
    stars: 5,
    roomTypes: ['double', 'suite'],
    tags: ['Pool', 'Beach nearby', 'Free parking'],
    price: 295,
    recommendedRank: 4,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmabu_1ZPIolwSRUFEjh9RdqIU-m5GJA1o8RWMBtxm0dncTbwgHQpIa1I&s=10',
  },
  {
    id: 'kyoto-ryokan',
    name: 'Kyoto Hanasu',
    location: 'KYOTO, JAPAN',
    badge: 'Traditional serenity',
    rating: 4.9,
    stars: 4,
    roomTypes: ['single', 'double'],
    tags: ['Breakfast included', 'Spa & wellness', 'Restaurant'],
    price: 245,
    recommendedRank: 5,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTDTC6Y7BHJ94vQmIDiMO9TIMLcJfN7VP7Q4KWqx6BWPkFi9kwSgzrN8A&s=10',
  },
  {
    id: 'nordic-haven',
    name: 'Nordic Light Hotel',
    location: 'STOCKHOLM, SWEDEN',
    badge: 'Minimalist design',
    rating: 4.5,
    stars: 4,
    roomTypes: ['single', 'double'],
    tags: ['Restaurant', 'Free parking'],
    price: 175,
    recommendedRank: 6,
    image:
      'https://cdn.prod.website-files.com/649dd95ac16380b41dca4834/66cdd6c51a158aa42339158b_The%20haven%20islands%20Best%20Airbnb%20maison%20ours%20Treehouse%20Cabane%20dans%20les%20arbres%20Anthony%20VERLAINE%2026.jpg',
  },
  {
    id: 'oasis-tulum',
    name: 'Oasis Tulum',
    location: 'TULUM, MEXICO',
    badge: 'Tropical escape',
    rating: 3.6,
    stars: 4,
    roomTypes: ['double', 'suite'],
    tags: ['Pool', 'Beach nearby', 'Breakfast included'],
    price: 165,
    recommendedRank: 7,
    image:
      'https://www.oasistulumresort.com/images/gallery/gallery-3.jpg',
  },
  {
    id: 'alpine-lodge',
    name: 'Zermatt Peak Lodge',
    location: 'ZERMATT, SWITZERLAND',
    badge: 'Alpine classic',
    rating: 5.0,
    stars: 5,
    roomTypes: ['suite'],
    tags: ['Mountain views', 'Spa & wellness', 'Restaurant'],
    price: 450,
    recommendedRank: 8,
    image:
      'https://cf.bstatic.com/xdata/images/hotel/max1024x768/63917895.jpg?k=c2bf510cc721db6cee0641427afce37dc48e7c4bd1baabfcea4f8be62ca5195f&o=',
  },
  {
    id: 'soho-urban',
    name: 'The Soho Loft',
    location: 'LONDON, UK',
    badge: 'Trendy hotspot',
    rating: 2.4,
    stars: 3,
    roomTypes: ['single', 'double'],
    tags: ['Restaurant', 'Free parking'],
    price: 140,
    recommendedRank: 9,
    image:
      'https://thumbs.6sqft.com/wp-content/uploads/2021/12/16122119/421_West_Broadway_Apt_2N_New_York_10012__2_.jpg?w=1560&format=webp',
  },
];

function DirectoryContent() {
  const searchParams = useSearchParams();

  // 1. Read URL parameters for search & filters
  const destinationQuery = searchParams.get('destination')?.toLowerCase().trim() || '';
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const minStarsParam = searchParams.get('minStars');
  const roomTypeParam = searchParams.get('roomType');
  const amenitiesParam = searchParams.get('amenities');
  const sortParam = searchParams.get('sort') || 'recommended';

  const selectedAmenities = amenitiesParam ? amenitiesParam.split(',').map((a) => a.trim().toLowerCase()) : [];

  // 2. Filter hotels against all active criteria
  const filteredHotels = HOTELS.filter((hotel) => {
    // Destination match
    if (
      destinationQuery &&
      !hotel.name.toLowerCase().includes(destinationQuery) &&
      !hotel.location.toLowerCase().includes(destinationQuery)
    ) {
      return false;
    }

    // Min Price
    if (minPriceParam && hotel.price < Number(minPriceParam)) {
      return false;
    }

    // Max Price
    if (maxPriceParam && hotel.price > Number(maxPriceParam)) {
      return false;
    }

    // Min Stars (Slider support)
    if (minStarsParam && hotel.stars < Number(minStarsParam)) {
      return false;
    }

    // Room Type
    if (roomTypeParam && !hotel.roomTypes.includes(roomTypeParam)) {
      return false;
    }

    // Amenities Check
    if (selectedAmenities.length > 0) {
      const hotelTagsLower = hotel.tags.map((t) => t.toLowerCase());
      const matchesAll = selectedAmenities.every((selected) =>
        hotelTagsLower.some((tag) => tag.includes(selected))
      );
      if (!matchesAll) return false;
    }

    return true;
  });

  // 3. Sort hotels
  const sortedHotels = [...filteredHotels].sort((a, b) => {
    if (sortParam === 'price_asc') return a.price - b.price;
    if (sortParam === 'price_desc') return b.price - a.price;
    if (sortParam === 'rating') return b.rating - a.rating;
    return a.recommendedRank - b.recommendedRank;
  });

  return (
    <div className="bg-canvas min-h-screen text-ink py-12 px-8 lg:px-16 max-w-[1600px] mx-auto space-y-8">
      <SearchBar
        defaultValues={{
          destination: searchParams.get('destination') || '',
          checkIn: searchParams.get('checkIn') || '',
          checkOut: searchParams.get('checkOut') || '',
          adults: Number(searchParams.get('adults')) || 2,
          children: Number(searchParams.get('children')) || 0,
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-3 sticky top-8">
          <FilterPanel />
        </div>

        <div className="lg:col-span-9 space-y-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-muted">
              Showing <span className="text-ink font-bold">{sortedHotels.length}</span> stays
              {destinationQuery && <span> for &quot;{destinationQuery}&quot;</span>}
            </p>
            <SortControl />
          </div>

          {sortedHotels.length === 0 ? (
            <div className="p-12 text-center rounded-card border border-line bg-surface space-y-3">
              <p className="text-lg font-bold text-ink">No stays match your filters</p>
              <p className="text-sm text-muted">
                Try clearing some filters or adjusting your price range.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedHotels.map((hotel) => (
                <div key={hotel.id} className="group flex flex-col justify-between">
                  <div className="relative aspect-[4/3] rounded-card overflow-hidden mb-5 shadow-sm">
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
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
                    <h3 className="text-2xl font-black text-ink tracking-tight mb-1.5">{hotel.name}</h3>
                    <p className="text-xs text-muted font-medium mb-6">{hotel.tags.join(' · ')}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-line/60">
                    <div>
                      <span className="text-2xl font-black text-ink">${hotel.price}</span>
                      <span className="text-xs font-medium text-muted"> / night</span>
                    </div>
                    <a
                      href={`/hotels/${hotel.id}?${searchParams.toString()}`}
                      className="inline-flex items-center gap-2 bg-ink hover:bg-primary-hover text-white font-bold text-xs px-5 py-3 rounded-control transition-all"
                    >
                      Book stay <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-muted">Loading stays...</div>}>
      <DirectoryContent />
    </Suspense>
  );
}