import React from "react";
import ProductCard from "./ProductCard";

// Utility: Find relevant products by category and SKU proximity
function getRelevantProducts(currentProduct, allProducts, maxResults = 6) {
  const currentParent = currentProduct["Kategori (parent)"];
  const currentSub = currentProduct["Kategori (sub)"];
  const currentSKU = parseInt(currentProduct["Artikelnummer"], 10);

  return allProducts
    .filter(p => p !== currentProduct && p["Artikelnummer"])
    .map(p => {
      let categoryScore = 0;
      if (
        p["Kategori (parent)"] === currentParent &&
        p["Kategori (sub)"] === currentSub
      ) {
        categoryScore = 2;
      } else if (p["Kategori (parent)"] === currentParent) {
        categoryScore = 1;
      }
      const sku = parseInt(p["Artikelnummer"], 10);
      const skuDistance =
        !isNaN(currentSKU) && !isNaN(sku)
          ? Math.abs(currentSKU - sku)
          : Number.MAX_SAFE_INTEGER;
      return { p, categoryScore, skuDistance };
    })
    .sort((a, b) => {
      if (b.categoryScore !== a.categoryScore)
        return b.categoryScore - a.categoryScore;
      return a.skuDistance - b.skuDistance;
    })
    .slice(0, maxResults)
    .map(res => res.p);
}

export default function ProductDetail({ product, allProducts, onClose }) {
  if (!product) return null;

  const relevant = getRelevantProducts(product, allProducts);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-xl font-bold text-primary hover:text-red-500"
          aria-label="Stäng"
        >
          &times;
        </button>
        <div className="flex gap-4 items-start">
          {product["Produktbild-URL"] ? (
            <img
              src={product["Produktbild-URL"]}
              alt={product.Namn}
              className="w-32 h-32 object-cover rounded-lg bg-white/30"
              loading="lazy"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs">
              Ingen bild
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-xl font-bold mb-1 text-primary">{product.Namn}</h2>
            <div className="text-sm text-white/60 mb-2">
              Artikelnummer: {product["Artikelnummer"]}
              {product["Serie"] && <> · {product["Serie"]}</>}
            </div>
            <div className="mb-2">
              {product["Pris inkl. moms (värde)"] && (
                <span className="font-mono text-white/80 mr-2">
                  {product["Pris inkl. moms (värde)"]}{" "}
                  {product["Pris inkl. moms (enhet)"]}
                </span>
              )}
              {product["Produkt-URL"] && (
                <a
                  href={product["Produkt-URL"]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary ml-2"
                >
                  Se produkt
                </a>
              )}
            </div>
            <div className="text-white/80 text-sm mb-2">{product.Beskrivning}</div>
            {(product["Kategori (parent)"] || product["Kategori (sub)"]) && (
              <div className="text-xs text-white/50">
                {product["Kategori (parent)"]}
                {product["Kategori (parent)"] && product["Kategori (sub)"] && " / "}
                {product["Kategori (sub)"]}
              </div>
            )}
          </div>
        </div>
        {/* Related products */}
        {relevant.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-primary mb-2">Liknande produkter</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relevant.map(prod => (
                <ProductCard product={prod} key={prod["Artikelnummer"]} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}