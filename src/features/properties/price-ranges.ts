export type PriceRange = {
  key: string;
  minPrice?: number;
  maxPrice?: number;
};

export const priceRanges: Record<"FOR_SALE" | "FOR_RENT", readonly PriceRange[]> = {
  FOR_SALE: [
    { key: "any" },
    { key: "sale-0-2500000", minPrice: 0, maxPrice: 2_500_000 },
    { key: "sale-2500000-5000000", minPrice: 2_500_000, maxPrice: 5_000_000 },
    { key: "sale-5000000-10000000", minPrice: 5_000_000, maxPrice: 10_000_000 },
    { key: "sale-10000000-20000000", minPrice: 10_000_000, maxPrice: 20_000_000 },
    { key: "sale-20000000-35000000", minPrice: 20_000_000, maxPrice: 35_000_000 },
    { key: "sale-35000000-50000000", minPrice: 35_000_000, maxPrice: 50_000_000 },
    { key: "sale-50000000-plus", minPrice: 50_000_000 },
  ],
  FOR_RENT: [
    { key: "any" },
    { key: "rent-0-20000", minPrice: 0, maxPrice: 20_000 },
    { key: "rent-20000-40000", minPrice: 20_000, maxPrice: 40_000 },
    { key: "rent-40000-75000", minPrice: 40_000, maxPrice: 75_000 },
    { key: "rent-75000-125000", minPrice: 75_000, maxPrice: 125_000 },
    { key: "rent-125000-250000", minPrice: 125_000, maxPrice: 250_000 },
    { key: "rent-250000-plus", minPrice: 250_000 },
  ],
};

export function priceRangeFromQuery(listingType: keyof typeof priceRanges, minPrice?: string | null, maxPrice?: string | null) {
  const min = minPrice ? Number(minPrice) : undefined;
  const max = maxPrice ? Number(maxPrice) : undefined;
  return priceRanges[listingType].find((range) => range.minPrice === min && range.maxPrice === max)?.key ?? "any";
}
