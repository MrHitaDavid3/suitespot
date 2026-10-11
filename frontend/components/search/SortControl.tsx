"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "rating", label: "Guest rating" },
  { value: "distance", label: "Distance" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

const DEFAULT_SORT: SortValue = "recommended";

function isSortValue(value: string | null): value is SortValue {
  return SORT_OPTIONS.some((o) => o.value === value);
}

export default function SortControl({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fromUrl = searchParams.get("sort");
  const current: SortValue = isSortValue(fromUrl) ? fromUrl : DEFAULT_SORT;

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_SORT) params.delete("sort");
    else params.set("sort", value);
    params.delete("offset"); // new order starts back on page 1

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label htmlFor="sort" className="text-sm text-muted whitespace-nowrap">
        Sort by
      </label>
      <select
        id="sort"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        className="h-10 rounded-control border border-line-strong bg-surface px-3 text-sm text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}