import React from "react";

export default function ProductCard({ product, onClick }) {
  return (
    <div
      tabIndex={0}
      className="group bg-white/20 dark:bg-white/10 rounded-xl p-4 cursor-pointer hover:ring-2 hover:ring-primary transition ring-inset"
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") onClick && onClick();
      }}
      role="button"
      aria-label={`Visa detaljer för ${product.Namn}`}
    >
      {product["Produktbild-URL"] ? (
        <img
          src={product["Produktbild-URL"]}
          alt={product.Namn}
          className="w-24 h-24 object-cover rounded-lg mb-2 bg-white/30"
          loading="lazy"
        />
      ) : (
        <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-lg mb-2 flex items-center justify-center text-gray-500 text-xs">
          Ingen bild
        </div>
      )}
      <div className="font-bold text-white mb-1">{product.Namn}</div>
      <div className="text-xs text-white/60 mb-1">
        {product["Artikelnummer"]}
      </div>
      {product["Pris inkl. moms (värde)"] && (
        <div className="text-xs text-white/80 font-mono">
          {product["Pris inkl. moms (värde)"]}{" "}
          {product["Pris inkl. moms (enhet)"]}
        </div>
      )}
    </div>
  );
}