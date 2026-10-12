import Link from 'next/link';
import Image from 'next/image';
import { User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="w-full bg-ink text-white py-3 sm:py-4 px-4 sm:px-6 lg:px-16 flex items-center justify-between gap-3">
      {/* Logo & Brand */}
      <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative w-9 h-10 shrink-0">
          <Image
            src="/logo.png"
            alt="SuiteSpot Logo Icon"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-base sm:text-lg tracking-tight leading-none">
            LikeHome
          </span>
          <span className="text-[9px] sm:text-[10px] text-muted tracking-widest uppercase">
            BY SUITESPOT
          </span>
        </div>
      </Link>

      {/* Navigation Actions */}
      <div className="flex items-center gap-1 sm:gap-4">
        {/* Sign in: Shows icon on mobile, text link on desktop */}
        <Link 
          href="/login" 
          className="text-xs font-bold hover:text-accent transition-colors h-11 w-11 sm:h-auto sm:w-auto justify-center flex items-center gap-1 text-white/90"
          title="Sign in"
          aria-label="Sign in"
        >
          <User aria-hidden="true" className="w-5 h-5 sm:hidden" />
          <span className="hidden sm:inline">Sign in</span>
        </Link>

        {/* Find your stay button */}
        <Link 
          href="/hotels" 
          className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3 sm:px-4 py-2.5 rounded-control flex items-center gap-1.5 whitespace-nowrap transition-all"
        >
          <span>Find your stay</span>
          <span aria-hidden="true" className="text-sm">↗</span>
        </Link>
      </div>
    </header>
  );
}