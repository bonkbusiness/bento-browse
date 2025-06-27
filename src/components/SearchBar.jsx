import React from "react";

export default function SearchBar({ search, setSearch }) {
    console.log("search value:", search);
  return (
    <div className="mb-6 flex items-center gap-2 relative">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Sök produkter..."
        aria-label="Sök produkter"
        className="w-full px-4 py-2 rounded-xl bg-white/20 dark:bg-white/10 backdrop-blur-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="grain-bg absolute inset-0 rounded-xl pointer-events-none"></div>
    </div>
  );
}