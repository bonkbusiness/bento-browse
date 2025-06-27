# BentoBrowse

A lightning-fast, mobile-first, modern product database web app for browsing, searching, and filtering products from spreadsheet exports (CSV/XLSX).  
Inspired by Material You, bento grid layouts, glassmorphism, and modern UI trends.

## Features

- Upload CSV or XLSX files (exported from @bonkbusiness/table-se-scraper-suite or similar)
- Instant, fuzzy search across all products
- Mobile-first, responsive, and accessible UI
- Modern design: bento grid, glassmorphism, grain, dark mode, and more

## Getting Started

### 1. Install dependencies

```sh
npm install
```

### 2. Start development server

```sh
npm run dev
```

### 3. Open your browser

Go to [http://localhost:5173](http://localhost:5173) (or the port Vite shows).

## Project Structure

- `src/components/` - Reusable UI components (upload, search, grid, card, theme toggle)
- `src/assets/` - Static assets (e.g., grain.png for background effect)
- `App.jsx` - Main application shell
- `index.html`, `index.css` - HTML and global styles
- `tailwind.config.js` - Tailwind CSS configuration

## Customization

- Adjust design or accent colors in `tailwind.config.js`
- Update grid or card layout in `ProductGrid` and `ProductCard`
- Add more search/filter options as needed

---

**BentoBrowse** is MIT licensed.  
Design and code by [bonkbusiness](https://github.com/bonkbusiness).