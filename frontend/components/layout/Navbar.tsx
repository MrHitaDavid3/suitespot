'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-primary text-primary-foreground px-8 py-4 flex items-center justify-between border-b border-line">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center space-x-2 group">
        <div className="bg-accent text-white p-2 rounded-control flex items-center justify-center font-bold text-xl h-10 w-10">
          S
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xl font-bold tracking-tight text-white">
            LikeHome
          </span>
          <span className="text-[10px] text-muted tracking-wide font-medium uppercase">
            by SuiteSpot
          </span>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
        <Link href="/hotels" className="hover:text-muted transition-colors">
          Our hotels
        </Link>
        <Link href="/destinations" className="hover:text-muted transition-colors">
          Destinations
        </Link>
        <Link href="/offers" className="hover:text-muted transition-colors">
          Offers
        </Link>
        <Link href="/suite-life" className="hover:text-muted transition-colors">
          The Suite life
        </Link>
      </div>

      {/* Auth & Primary Action */}
      <div className="flex items-center space-x-6">
        <Link href="/login" className="text-sm font-semibold hover:text-muted transition-colors">
          Sign in
        </Link>
        <Link 
          href="/search" 
          className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-control text-sm font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          Find your stay <ArrowUpRight className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}