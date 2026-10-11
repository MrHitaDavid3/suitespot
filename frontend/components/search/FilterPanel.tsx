"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const ROOM_TYPES = [
  { value: "", label: "Any" },
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "suite", label: "Suite" },
] as const;

const STAR_OPTIONS = [1, 2, 3, 4, 5] as const;

const FILTER_KEYS = ["minPrice", "maxPrice", "minStars", "roomType"] as const;

type Filters = {
  minPrice: string;
  maxPrice: string;
  minStars: string;
  roomType: string;
};

type Errors = Partial<Record<"minPrice" | "maxPrice", string>>;

function validate(f: Filters): Errors {
  const e: Errors = {};
  const min = f.minPrice === "" ? null : Number(f.minPrice);
  const max = f.maxPrice === "" ? null : Number(f.maxPrice);
  if (min !== null && (Number.isNaN(min) || min < 0)) e.minPrice = "Enter 0 or more.";
  if (max !== null && (Number.isNaN(max) || max < 0)) e.maxPrice = "Enter 0 or more.";
  if (!e.minPrice && !e.maxPrice && min !== null && max !== null && min > max)
    e.maxPrice = "Max must be at least the min.";
  return e;
}

type FilterPanelProps = { className?: string };

export default function FilterPanel({ className }: FilterPanelProps) {
  const searchParams = useSearchParams();
  // Re-mount the form when the URL changes (e.g. back button) so it shows the current filters.
  return <FilterForm key={searchParams.toString()} className={className} />;
}

function FilterForm({ className }: FilterPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>({
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    minStars: searchParams.get("minStars") ?? "",
    roomType: searchParams.get("roomType") ?? "",
  });
  const [errors, setErrors] = useState<Errors>({});

  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length;

  function update(name: keyof Filters, value: string) {
    setFilters((f) => ({ ...f, [name]: value }));
    if (name in errors) setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function pushParams(next: Filters) {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_KEYS) {
      const value = next[key].trim();
      if (value) params.set(key, value);
      else params.delete(key);
    }
    params.delete("offset"); // new filters start back on page 1
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(filters);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    pushParams(filters);
  }

  function handleClear() {
    const empty: Filters = { minPrice: "", maxPrice: "", minStars: "", roomType: "" };
    setFilters(empty);
    setErrors({});
    pushParams(empty);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Filter hotels"
      className={cn("space-y-6 rounded-card border border-line bg-surface p-5", className)}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink">
          Filters{activeCount > 0 && <span className="ml-1 text-muted">({activeCount})</span>}
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-muted underline underline-offset-4 hover:text-ink cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Price */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Price per night ($)</legend>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="minPrice" className="text-xs text-muted">
              Min
            </label>
            <Input
              id="minPrice"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => update("minPrice", e.target.value)}
              aria-invalid={!!errors.minPrice}
              aria-describedby={errors.minPrice ? "minPrice-error" : undefined}
            />
            {errors.minPrice && (
              <p id="minPrice-error" className="text-xs text-danger">
                {errors.minPrice}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="maxPrice" className="text-xs text-muted">
              Max
            </label>
            <Input
              id="maxPrice"
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Any"
              value={filters.maxPrice}
              onChange={(e) => update("maxPrice", e.target.value)}
              aria-invalid={!!errors.maxPrice}
              aria-describedby={errors.maxPrice ? "maxPrice-error" : undefined}
            />
            {errors.maxPrice && (
              <p id="maxPrice-error" className="text-xs text-danger">
                {errors.maxPrice}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Star rating */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Star rating</legend>
        <div className="flex flex-wrap gap-2">
          <ChipButton pressed={filters.minStars === ""} onClick={() => update("minStars", "")}>
            Any
          </ChipButton>
          {STAR_OPTIONS.map((n) => (
            <ChipButton
              key={n}
              pressed={filters.minStars === String(n)}
              onClick={() => update("minStars", String(n))}
              aria-label={n === 5 ? "5 stars" : `${n} stars and up`}
            >
              {n === 5 ? "5★" : `${n}★+`}
            </ChipButton>
          ))}
        </div>
      </fieldset>

      {/* Room type */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">Room type</legend>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((r) => (
            <ChipButton
              key={r.value || "any"}
              pressed={filters.roomType === r.value}
              onClick={() => update("roomType", r.value)}
            >
              {r.label}
            </ChipButton>
          ))}
        </div>
      </fieldset>

      <Button type="submit" className="w-full">
        Apply filters
      </Button>
    </form>
  );
}

function ChipButton({
  pressed,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pressed: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        "h-9 rounded-control border px-3 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        pressed
          ? "border-primary bg-primary text-primary-foreground"
          : "border-line-strong bg-surface text-ink hover:bg-surface-muted",
        className
      )}
      {...props}
    />
  );
}