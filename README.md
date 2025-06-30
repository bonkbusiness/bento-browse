# Table.se Scraper Suite

## Overview

A robust, modular Python suite for scraping and exporting product data from [table.se](https://www.table.se). Designed for extensibility, resilience, and maintainability, it supports category and product extraction, parallel scraping, quality control (QC), deduplication, error reporting, and multiple output formats (XLSX, CSV).

---

## Features

- **Bento-browser friendly:** All extracted/exported data and UI recommendations are tailored for use in bento-style/mobile-first browsers and apps.
- **Mobile-first design:** Exported data structures and UI suggestions prioritize optimal experience in bento browsers and small screens.
- **Product Datapoints:** All modules (scraper, exporters, QC) use a harmonized, comprehensive set of product fields.
- **Modular architecture:** Each workflow (category, product, export, QC) is a dedicated module.
- **Parallel scraping:** Categories and products fetched in parallel, with retries & throttling.
- **Exclusion logic:** Easily skip unwanted categories/products via `exclusions.py`.
- **QC & Deduplication:** Automated completeness checks and duplicate detection.
- **Exporters:** Output to XLSX and CSV with auto-generated filenames.
- **Caching:** Product cache avoids redundant scrapes; supports incremental runs.
- **Configurable:** CLI options for parallelism, retries, output, and more.
- **Extensible:** Add new exporters, scrapers, or QC logic easily.
- **Testing:** Unit tests for core modules; testable with mocks.
- **Documentation:** Docstrings, usage guides, and developer notes.

---

## Bento-browser & Mobile-first Guidance

When consuming Table.se data in a [Bento Browser](https://www.bentobrowser.com/) or similar mobile apps:

- **Product cards:**  
  - Use `max-width: 570px`, `width: 99vw`, `border-radius: 12px`, and generous padding.
  - Title (`Namn`) should be uppercase, single line, with ellipsis if too long, and never exceed the card border radius.
  - Serie and Färg should be shown in a full-width block with natural word wrap (no fixed row count).
  - Two-column data grid for prices and features; always mobile-responsive.
  - Related products, image popups, and carousels should use even spacing and never overflow.
- **Touch/UX:**  
  - All interactive elements (image popups, related product taps, etc.) should be touch-optimized.
  - Avoid hover-only UI.
- **Performance:**  
  - Exported CSV/XLSX is optimized for mobile parsing and quick rendering in bento browsers.
- **Theme:**  
  - All field and style recommendations work with both light and dark mode.

---

## Changelog

## v1.2 (2025-06-29)

### Bento-browser & Mobile-first

- **Bento-browser section:** README now includes a dedicated section on best practices and requirements for using Table.se data in bento browsers and similar mobile apps.
- **UI/Export Guidance:** Recommendations for title, card width, field layout, touch targets, and responsive design.

... (earlier changelog as before) ...

---

## Quickstart

(unchanged, see above)

---

## Usage: Common Workflows

(unchanged, see above)

---

## Repo Structure

(unchanged, see above)

---

## Developer How-To

(unchanged, see above)

---

## FAQ

(unchanged, see above)

---

## License

MIT (see `LICENSE`).

---

## Credits

- Inspired by real-world e-commerce scraping needs.
- Open to contributions—see [CONTRIBUTING.md] if present, or open a PR!
