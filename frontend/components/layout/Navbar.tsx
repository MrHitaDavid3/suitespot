import Link from 'next/link';
import { User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="w-full bg-ink text-white py-4 px-6 lg:px-16 flex items-center justify-between">
      {/* Logo & Brand */}
      <Link href="/" className="flex items-center gap-3">
        <div className="bg-accent text-white font-black px-2.5 py-1.5 rounded text-sm">
          S
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
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Sign in: Shows icon on mobile, text link on desktop */}
        <Link 
          href="/login" 
          className="text-xs font-bold hover:text-accent transition-colors p-2 sm:p-0 flex items-center gap-1 text-white/90"
          title="Sign in"
        >
          <User className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline">Sign in</span>
        </Link>

        {/* Find your stay button */}
        <Link 
          href="/hotels" 
          className="bg-accent hover:bg-accent-hover text-white text-xs font-bold px-3 sm:px-4 py-2.5 rounded-control flex items-center gap-1.5 transition-all"
        >
          <span>Find your stay</span>
          <span className="text-sm">↗</span>
        </Link>
      </div>
    </header>
  );
}