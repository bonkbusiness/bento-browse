import React from "react";

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <button
      className="p-2 rounded-lg bg-white/10 hover:bg-primary hover:text-black transition"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Växla mörkt läge"
    >
      {theme === "dark" ? (
        <span role="img" aria-label="Ljust läge">🌞</span>
      ) : (
        <span role="img" aria-label="Mörkt läge">🌙</span>
      )}
    </button>
  );
}