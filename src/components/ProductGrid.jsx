import React from "react";
import ProductCard from "./ProductCard";
import Fuse from "fuse.js";

export default function ProductGrid({ products, search, onProductClick }) {
  const fuse = React.useMemo(
    () =>
      new Fuse(products, {
        keys: ["Namn", "Artikelnummer"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [products]
  );

  const filtered =
    search.trim() === ""
      ? products
      : fuse.search(search).map(res => res.item);

  // Sort by sub, then parent
  const sorted = React.useMemo(() => {
    const subParent = (p) => [
      (p["Kategori (sub)"] || "").toLowerCase(),
      (p["Kategori (parent)"] || "").toLowerCase(),
    ];
    return [...filtered].sort((a, b) => {
      const [subA, parentA] = subParent(a);
      const [subB, parentB] = subParent(b);
      if (subA !== subB) return subA < subB ? -1 : 1;
      if (parentA !== parentB) return parentA < parentB ? -1 : 1;
      return 0;
    });
  }, [filtered]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {sorted.map((product, i) => (
        <ProductCard
          product={product}
          key={product["Artikelnummer"] || i}
          onClick={() => onProductClick(product)}
        />
      ))}
      {sorted.length === 0 && (
        <div className="col-span-full text-center text-white/70 py-12">
          Inga produkter hittades.
        </div>
      )}
    </div>
  );
}