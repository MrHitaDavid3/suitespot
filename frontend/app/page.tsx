'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users, 
  ArrowUpRight, 
  ArrowDown, 
  Heart, 
  Star, 
  ArrowRight
} from 'lucide-react';

const CATEGORIES = [
  'Our favorites',
  'By the coast',
  'City escapes',
  'Into the wild',
];

const HOTELS = [
  {
    id: 'casa-sol',
    name: 'Casa Sol',
    location: 'MALLORCA, SPAIN',
    badge: 'Sun-seeker favorite',
    rating: '4.9',
    tags: 'Pool · Breakfast included · Beach nearby',
    price: '$189',
    image:
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QkXGXfAwhzFSwjYRyzUwsCkd2Z3ccrtRNTTePrE44Cewcrzo_64983KqKSRj4YZBBOLtpv3xbAN2aIoCxvQsubiA7dzNGloJp1w5y1xDo5kOsGgAUJ517VVM3wUWqkrhqg_0wR=s680-w680-h510-rw',
  },
  {
    id: 'hoxton-amsterdam',
    name: 'The Hoxton, Amsterdam',
    location: 'AMSTERDAM, NETHERLANDS',
    badge: 'City with character',
    rating: '4.8',
    tags: 'Canal views · Restaurant · Design-led rooms',
    price: '$215',
    image:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop',
  },
  {
    id: 'forestis',
    name: 'Forestis',
    location: 'DOLOMITES, ITALY',
    badge: 'A breath of fresh air',
    rating: '4.9',
    tags: 'Mountain views · Spa · Adults-only',
    price: '$340',
    image:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop',
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('Our favorites');

  return (
    <div className="bg-canvas min-h-screen flex flex-col justify-between scroll-smooth">
      
      {/* 1. HERO & SEARCH SECTION */}
      <main className="max-w-[1600px] mx-auto px-8 lg:px-16 pt-8 pb-12 w-full min-h-[calc(100vh-80px)] flex flex-col justify-between">
        
        {/* Search Controls */}
        <div className="mb-6">
          <div className="bg-surface rounded-control border border-line shadow-sm p-5 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-line pb-3 md:pb-0 md:pr-6 flex items-center gap-4">
                <MapPin className="w-6 h-6 text-ink shrink-0" />
                <div className="w-full">
                  <span className="block text-xs font-bold tracking-wider text-muted uppercase">WHERE TO?</span>
                  <input 
                    type="text" 
                    placeholder="City, region or hotel" 
                    className="w-full text-base font-semibold text-ink focus:outline-none placeholder-muted bg-transparent mt-0.5"
                  />
                </div>
              </div>

              <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-line pb-3 md:pb-0 md:pr-6 flex items-center gap-4">
                <Calendar className="w-6 h-6 text-ink shrink-0" />
                <div>
                  <span className="block text-xs font-bold tracking-wider text-muted uppercase">CHECK-IN</span>
                  <span className="text-base font-semibold text-ink block mt-0.5">21 Nov 2026</span>
                </div>
              </div>

              <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-line pb-3 md:pb-0 md:pr-6 flex items-center gap-4">
                <Calendar className="w-6 h-6 text-ink shrink-0" />
                <div>
                  <span className="block text-xs font-bold tracking-wider text-muted uppercase">CHECK-OUT</span>
                  <span className="text-base font-semibold text-ink block mt-0.5">24 Nov 2026</span>
                </div>
              </div>

              <div className="md:col-span-2 pb-3 md:pb-0 flex items-center gap-4">
                <Users className="w-6 h-6 text-ink shrink-0" />
                <div>
                  <span className="block text-xs font-bold tracking-wider text-muted uppercase">GUESTS</span>
                  <span className="text-base font-semibold text-ink block mt-0.5">2 adults · 1 room</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <a href="#explore" className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 px-5 rounded-control font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm">
                  Search stays <ArrowUpRight className="w-5 h-5" />
                </a>
              </div>

            </div>
          </div>

          <p className="text-sm text-muted font-medium px-1">
            Your next great stay, without the guesswork. · Handpicked hotels · Clear prices · Real people to help
          </p>
        </div>

        {/* Hero Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center my-auto py-8">
          
          <div className="lg:col-span-6 space-y-8">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-accent"></span>
              <span className="text-sm font-black tracking-widest text-ink uppercase">
                GOOD PLACES. GREAT STAYS.
              </span>
            </div>

            <h1 className="text-7xl sm:text-8xl 2xl:text-[100px] font-black tracking-[0.04em] text-ink leading-[0.92] uppercase">
              CHECK IN.<br />
              SWITCH<br />
              OFF.
            </h1>

            <p className="text-xl 2xl:text-2xl text-muted max-w-xl font-normal leading-relaxed">
              Extraordinary hotels. Unforgettable places. Find a stay that feels like the best part of your trip.
            </p>

            <a 
              href="#explore" 
              className="inline-flex items-center gap-3 text-lg font-bold text-ink hover:opacity-75 transition-opacity pt-2"
            >
              A little escape starts here <ArrowDown className="w-6 h-6" />
            </a>
          </div>

          <div className="lg:col-span-6 flex justify-end">
            <div className="relative w-full max-w-xl 2xl:max-w-2xl aspect-[4/5] rounded-t-full overflow-hidden shadow-2xl">
              <img 
                src="https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QkXGXfAwhzFSwjYRyzUwsCkd2Z3ccrtRNTTePrE44Cewcrzo_64983KqKSRj4YZBBOLtpv3xbAN2aIoCxvQsubiA7dzNGloJp1w5y1xDo5kOsGgAUJ517VVM3wUWqkrhqg_0wR=s680-w680-h510-rw" 
                alt="Casa Sol, Mallorca" 
                className="w-full h-full object-cover"
              />
              
              <div className="absolute bottom-6 left-6 right-6 bg-canvas/90 backdrop-blur-md p-5 rounded-control flex items-center justify-between border border-white/40 shadow-md">
                <div>
                  <h3 className="font-bold text-lg text-ink">Casa Sol, Mallorca</h3>
                  <p className="text-sm text-muted mt-0.5">Your sun-soaked state of mind</p>
                </div>
                <button className="p-2 hover:bg-black/5 rounded-control transition-colors">
                  <ArrowUpRight className="w-6 h-6 text-ink" />
                </button>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* 2. STATS BAR */}
      <section className="bg-[#F8EA9B] text-[#1C1D1B] py-8 px-8 lg:px-16 border-t border-[#E8DA8B]">
        <div className="max-w-[1600px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-lg font-black tracking-tight leading-tight uppercase">
              SMALL DETAILS.<br />
              BIG DIFFERENCE.
            </h2>
          </div>
          <div>
            <span className="block text-3xl font-black tracking-tight">500+</span>
            <span className="text-sm text-stone-700 font-medium">handpicked hotels</span>
          </div>
          <div>
            <span className="block text-3xl font-black tracking-tight">35</span>
            <span className="text-sm text-stone-700 font-medium">destinations to discover</span>
          </div>
          <div>
            <span className="block text-3xl font-black tracking-tight">4.9 / 5</span>
            <span className="text-sm text-stone-700 font-medium">from happy travelers</span>
          </div>
          <div>
            <span className="block text-3xl font-black tracking-tight">24 / 7</span>
            <span className="text-sm text-stone-700 font-medium">human support</span>
          </div>
        </div>
      </section>

      {/* 3. EXPLORE SECTION */}
      <section id="explore" className="bg-canvas py-20 px-8 lg:px-16 max-w-[1600px] mx-auto w-full border-t border-line/40">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 bg-accent inline-block"></span>
            <span className="text-xs font-black tracking-widest text-ink uppercase">
              THE SUITE SPOT EDIT
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h2 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-[0.02em] text-ink leading-[0.95] uppercase max-w-4xl">
              NOT JUST A ROOM.<br />
              YOUR KIND OF PLACE.
            </h2>

            <button className="inline-flex items-center gap-2 bg-ink hover:bg-primary-hover text-white font-bold text-sm px-6 py-3.5 rounded-control transition-all shrink-0">
              Explore all hotels <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-ink text-white border-ink'
                    : 'bg-transparent text-ink border-line hover:border-ink/50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* 3-Column Hotel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {HOTELS.map((hotel) => (
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

                <h3 className="text-2xl lg:text-3xl font-black text-ink tracking-tight mb-1.5">
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
                  <span className="text-[10px] text-muted block font-medium mt-0.5">From · taxes included</span>
                </div>

                <a
                  href={`/hotels/${hotel.id}`}
                  className="inline-flex items-center gap-2 bg-ink hover:bg-primary-hover text-white font-bold text-xs px-5 py-3 rounded-control transition-all"
                >
                  Book stay <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* 4. ORANGE CALLOUT BANNER */}
      <section className="bg-accent text-ink py-20 px-8 lg:px-16 w-full">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-4xl">
            <span className="block text-xs font-black tracking-widest uppercase mb-4 opacity-90">
              YOU DESERVE A CHANGE OF SCENERY
            </span>
            <h2 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.92] uppercase">
              YOUR NEXT<br />
              SUITE SPOT AWAITS.
            </h2>
          </div>

          <div className="space-y-6 lg:text-right max-w-md">
            <p className="text-lg lg:text-xl font-medium leading-relaxed">
              A room you&apos;ll love. A place you&apos;ll remember. Let&apos;s find yours.
            </p>
            <button className="inline-flex items-center gap-3 bg-ink hover:bg-primary-hover text-white font-bold text-sm px-8 py-4 rounded-control transition-all shadow-md">
              Find your perfect stay <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-[#1C1D1B] text-white pt-20 pb-10 px-8 lg:px-16 w-full">
        <div className="max-w-[1600px] mx-auto space-y-16">
          
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Brand Info */}
            <div className="md:col-span-4 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-control flex items-center justify-center font-black text-ink text-xl">
                  S
                </div>
                <span className="text-2xl font-black tracking-tight">suite spot</span>
              </div>
              <p className="text-sm text-stone-400 max-w-xs font-medium leading-relaxed">
                Good places. Great stays.<br />
                Your kind of getaway, curated.
              </p>
            </div>

            {/* Explore Links */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-black tracking-widest text-stone-400 uppercase">EXPLORE</h4>
              <ul className="space-y-3 text-sm font-medium text-stone-200">
                <li><a href="#" className="hover:text-accent transition-colors">Our hotels</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Destinations</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Special offers</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">The Suite life</a></li>
              </ul>
            </div>

            {/* Suite Spot Links */}
            <div className="md:col-span-2 space-y-4">
              <h4 className="text-xs font-black tracking-widest text-stone-400 uppercase">SUITE SPOT</h4>
              <ul className="space-y-3 text-sm font-medium text-stone-200">
                <li><a href="#" className="hover:text-accent transition-colors">Our story</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">How we curate</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Partner with us</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Get in touch</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="md:col-span-4 space-y-4">
              <h3 className="text-2xl font-black tracking-tight uppercase">
                GOOD MAIL. GREAT ESCAPES.
              </h3>
              <p className="text-xs text-stone-400 font-medium leading-relaxed">
                Fresh finds, insider tips and a few sweet deals.<br />
                A little wanderlust in your inbox.
              </p>

              {/* Form Input */}
              <div className="pt-2">
                <div className="flex bg-[#ECE8DF] rounded-control overflow-hidden p-1">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="bg-transparent text-ink placeholder-stone-500 text-xs font-semibold px-4 py-3 w-full focus:outline-none"
                  />
                  <button className="bg-accent hover:bg-accent-hover text-white p-3 rounded-control transition-colors shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[10px] text-stone-500 font-medium block mt-2">
                  Only the good stuff. Unsubscribe anytime.
                </span>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-stone-400">
            <p>© 2026 Suite Spot. All stays welcome.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
              <span>EUR € · English</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}