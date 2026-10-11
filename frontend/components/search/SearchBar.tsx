'use client';

import { useState, useSyncExternalStore, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, ArrowUpRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchValues = {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
};

type SearchBarProps = {
  defaultValues?: Partial<SearchValues>;
  onSearch?: (values: SearchValues) => void;
  className?: string;
};

const today = () => new Date().toLocaleDateString("en-CA");
const noopSubscribe = () => () => {};

export default function SearchBar({ defaultValues, onSearch, className }: SearchBarProps) {
  const router = useRouter();
  const [destination, setDestination] = useState(defaultValues?.destination ?? "");
  const [checkIn, setCheckIn] = useState(defaultValues?.checkIn ?? "2026-11-21");
  const [checkOut, setCheckOut] = useState(defaultValues?.checkOut ?? "2026-11-24");
  const [adults, setAdults] = useState(defaultValues?.adults ?? 2);
  const [children, setChildren] = useState(defaultValues?.children ?? 0);
  
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const guestRef = useRef<HTMLDivElement>(null);

  const minDate = useSyncExternalStore(noopSubscribe, today, () => "");

  // Close guest dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setIsGuestOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanDestination = destination.trim();
    if (onSearch) {
      onSearch({ destination: cleanDestination, checkIn, checkOut, adults, children });
      return;
    }

    const params = new URLSearchParams({
      destination: cleanDestination,
      checkIn,
      checkOut,
      guests: String(adults + children),
      adults: String(adults),
      children: String(children),
    });
    router.push(`/hotels?${params.toString()}`);
  }

  const totalGuests = adults + children;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "bg-surface rounded-control border border-line shadow-sm p-4 w-full",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* 1. DESTINATION */}
        <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-line pb-3 md:pb-0 md:pr-4 flex items-center gap-3">
          <MapPin className="w-5 h-5 text-ink shrink-0" />
          <div className="w-full">
            <label htmlFor="destination" className="block text-[10px] font-bold tracking-wider text-muted uppercase">
              WHERE TO?
            </label>
            <input 
              id="destination"
              type="text" 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="City, region or hotel" 
              className="w-full text-sm font-semibold text-ink focus:outline-none placeholder-muted bg-transparent mt-0.5"
            />
          </div>
        </div>

        {/* 2. CHECK-IN */}
        <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-line pb-3 md:pb-0 md:pr-4 flex items-center gap-3">
         <Calendar className="w-5 h-5 text-ink shrink-0" />
         <div className="w-full">
           <label htmlFor="checkIn" className="block text-[10px] font-bold tracking-wider text-muted uppercase cursor-pointer">
             CHECK-IN
           </label>
            <input
              id="checkIn"
              type="date"
             min={minDate || undefined}
             value={checkIn}
             onChange={(e) => setCheckIn(e.target.value)}
             className="w-full text-sm font-semibold text-ink bg-transparent focus:outline-none mt-0.5 cursor-pointer"
           />
         </div>
        </div>

        {/* 3. CHECK-OUT */}
        <div className="md:col-span-2 border-b md:border-b-0 md:border-r border-line pb-3 md:pb-0 md:pr-4 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-ink shrink-0" />
         <div className="w-full">
            <label htmlFor="checkOut" className="block text-[10px] font-bold tracking-wider text-muted uppercase cursor-pointer">
             CHECK-OUT
           </label>
           <input
              id="checkOut"
             type="date"
             min={checkIn || minDate || undefined}
             value={checkOut}
             onChange={(e) => setCheckOut(e.target.value)}
             className="w-full text-sm font-semibold text-ink bg-transparent focus:outline-none mt-0.5 cursor-pointer"
            />
          </div>
        </div>

        {/* 4. GUESTS (Adults & Children Selector Dropdown) */}
        <div className="md:col-span-2 pb-3 md:pb-0 md:pr-2 flex items-center gap-3 relative" ref={guestRef}>
          <Users className="w-5 h-5 text-ink shrink-0" />
          <div className="w-full cursor-pointer" onClick={() => setIsGuestOpen(!isGuestOpen)}>
            <span className="block text-[10px] font-bold tracking-wider text-muted uppercase">GUESTS</span>
            <span className="text-sm font-semibold text-ink block mt-0.5 truncate">
              {adults} adults{children > 0 ? `, ${children} child` : ''}
            </span>
          </div>

          {/* Guest Dropdown Popup */}
          {isGuestOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-surface rounded-card border border-line shadow-lg p-4 z-50 space-y-4">
              {/* Adults Counter */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-ink">Adults</p>
                  <p className="text-[10px] text-muted">Ages 13 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(Math.max(1, adults - 1))}
                    disabled={adults <= 1}
                    className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-surface-muted disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5 text-ink" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(Math.min(10, adults + 1))}
                    className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-surface-muted"
                  >
                    <Plus className="w-3.5 h-3.5 text-ink" />
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="flex items-center justify-between pt-3 border-t border-line/60">
                <div>
                  <p className="text-xs font-bold text-ink">Children</p>
                  <p className="text-[10px] text-muted">Ages 0–12</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(Math.max(0, children - 1))}
                    disabled={children <= 0}
                    className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-surface-muted disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5 text-ink" />
                  </button>
                  <span className="text-xs font-bold w-4 text-center">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(Math.min(6, children + 1))}
                    className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-surface-muted"
                  >
                    <Plus className="w-3.5 h-3.5 text-ink" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. SUBMIT BUTTON */}
        <div className="md:col-span-2">
          <button 
            type="submit" 
            className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-control font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            Search stays <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </form>
  );
}