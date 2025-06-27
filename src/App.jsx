import React, { useState } from "react";
import SearchBar from "./components/SearchBar";
import ProductGrid from "./components/ProductGrid";
import ProductDetail from "./components/ProductDetail";
import UploadProducts from "./components/FileUpload";

export default function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div>
      <UploadProducts onProductsLoaded={setProducts} />
      <SearchBar search={search} setSearch={setSearch} />
      <ProductGrid
        products={products}
        search={search}
        onProductClick={setSelectedProduct}
      />
      {selectedProduct && (
        <ProductDetail
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}