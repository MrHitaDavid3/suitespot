"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchBar from "@/components/search/SearchBar";
import FilterPanel from "@/components/search/FilterPanel";
import SortControl from "@/components/search/SortControl";

type HotelResult = {
  id: string; name: string; city: string; state?: string | null;
  star_rating: number; image_url?: string | null;
  rooms_available: number; from_price: number;
};
const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");
function Results() {
  const params = useSearchParams();
  const query = params.toString();
  const [results, setResults] = useState<HotelResult[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const valid = !!(params.get("destination") && params.get("checkIn") && params.get("checkOut"));
  useEffect(() => {
    if (!valid) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError("");
      try {
        const q = new URLSearchParams(query);
        const guests = Math.max(1, Number(q.get("adults") || 1) + Number(q.get("children") || 0));
        q.set("guests", String(guests));
        const res = await fetch(`${API}/search?${q.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`Search failed (HTTP ${res.status}).`);
        const data = await res.json();
        setResults(data.results ?? []);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Search failed.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load(); return () => controller.abort();
  }, [query, valid]);
  return (
    <main className="bg-canvas min-h-screen text-ink py-8 px-4 sm:px-8 lg:px-16 max-w-[1600px] mx-auto space-y-8">
      <SearchBar defaultValues={{ destination: params.get("destination") || "", checkIn: params.get("checkIn") || "", checkOut: params.get("checkOut") || "", adults: Number(params.get("adults")) || 2, children: Number(params.get("children")) || 0 }} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <aside className="lg:col-span-3"><FilterPanel /></aside>
        <div className="lg:col-span-9 space-y-6">
          <div className="flex justify-between items-center gap-4"><h1 className="font-bold text-2xl">Available hotels</h1><SortControl /></div>
          {!valid ? <p>Enter a destination, check-in date, and check-out date to see available rooms.</p> : loading ? <p>Searching availability…</p> : error ? <p role="alert" className="text-red-600">{error}</p> : !results.length ? <p>No hotels match your dates and filters. Try different dates or filters.</p> : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map(h => <article key={h.id} className="border border-line rounded-card overflow-hidden bg-white shadow-sm">
                {h.image_url ? <img src={h.image_url} alt={h.name} className="h-48 w-full object-cover"/> : <div className="h-48 bg-stone-100 flex items-center justify-center">No photo available</div>}
                <div className="p-5 space-y-3"><h2 className="font-bold text-xl">{h.name}</h2><p className="text-sm">{h.city}{h.state ? `, ${h.state}` : ""} · {h.star_rating} stars</p>
                  <p className="text-sm">{h.rooms_available} available room(s)</p><p className="font-bold">From ${h.from_price}/night</p>
                  <Link href={`/hotels/${h.id}?${query}`} className="block text-center bg-ink text-white font-semibold rounded-control px-4 py-3">View rooms and book</Link>
                </div>
              </article>)}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
export default function HotelsPage() { return <Suspense fallback={<p className="p-8">Loading…</p>}><Results /></Suspense>; }
