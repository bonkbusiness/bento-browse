/**
 * App.jsx
 *
 * Main entry point for the Bento Browse React application.
 *
 * Features:
 * - Shopify Polaris-based UI with dark mode support
 * - Product CSV import and search/filtering
 * - Inline product list with click-to-view ProductCard popup
 * - Smart fuzzy searching (by name, SKU, or category)
 * - Success/warning/error messaging for uploads
 * - Responsive, accessible design
 *
 * Component structure:
 * - AppProvider (Polaris theme + i18n)
 *   - YouTubeHeader (search box, dark mode toggle, upload button)
 *   - Page
 *     - CsvImport (file input & parsing)
 *     - Spinner (loading state)
 *     - Success/Warning/Error banners
 *     - Product list (as clickable rows)
 *     - ProductCard (popup overlay for product details and switching between related products)
 *
 * State Management:
 * - search: current search string
 * - products: array of all parsed products
 * - darkMode: theme toggle
 * - selectedProduct: product for ProductCard popup
 * - uploadInProgress/showResults: spinner state
 * - showSuccess, warningMessage, errorMessage: upload/parse messaging
 *
 * Styling:
 * - Custom Polaris overrides for background/theme, both light and dark
 * - Responsive, accessible inline styles
 */

import React, { useState, useEffect, useRef } from "react";
import {
  AppProvider,
  Page,
  Card,
  Spinner,
} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import CsvImport from "./CsvImport.jsx";
import { tableSeLightTheme, tableSeDarkTheme } from "./theme.js";
import YouTubeHeader from "./YouTubeHeader.jsx";
import { ImageSquare } from "phosphor-react";
import ProductCard from "./ProductCard.jsx";

/**
 * Custom hook: Applies global CSS overrides for Polaris backgrounds and shadows.
 * Ensures theme coloring consistency beyond what Polaris exposes.
 */
function usePolarisCustomOverrides(darkMode, dark, light) {
  useEffect(() => {
    const styleId = "polaris-global-overrides";
    let style = document.getElementById(styleId);
    const css = `
      .Polaris-AppProvider,
      .Polaris-Frame,
      .Polaris-Page,
      .Polaris-Page__Content,
      .Polaris-Box {
        --pc-box-background: ${darkMode ? dark : light} !important;
        --p-color-bg: ${darkMode ? dark : light} !important;
        background: ${darkMode ? dark : light} !important;
      }
      .Polaris-ShadowBevel {
        --pc-shadow-bevel-content-xs: none !important;
        box-shadow: none !important;
      }
      body {
        background: ${darkMode ? dark : light} !important;
      }
    `;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.innerHTML = css;
    return () => {
      if (style && style.parentNode) style.parentNode.removeChild(style);
    };
  }, [darkMode, dark, light]);
}

export default function App() {
  // State: search query, products, theme, popup, spinner, and upload banners
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Upload banners and spinner state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTrigger, setSuccessTrigger] = useState(0);
  const [warningMessage, setWarningMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const spinnerTimeoutRef = useRef();
  const SPINNER_MIN_DURATION = 900;

  // Product details popup
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Theme color constants
  const COLOR_LIGHT_BG = "#fff";
  const COLOR_DARK_BG = "#18191a";
  const COLOR_LIGHT_CARD = "#fff";
  const COLOR_DARK_CARD = "#18191a";
  const COLOR_LIGHT_BORDER = "#e0e0e0";
  const COLOR_DARK_BORDER = "#232426";
  const COLOR_LIGHT_TEXT = "#18191a";
  const COLOR_DARK_TEXT = "#f6f6f6";
  const COLOR_LIGHT_FADED = "#888";
  const COLOR_DARK_FADED = "#aaa";
  const COLOR_LIGHT_ICON_BG = "#f8f8f8";
  const COLOR_DARK_ICON_BG = "#232426";
  const tableSeOrange = "#ff7e1b";

  // Sizing constants
  const HEADER_HEIGHT = 56;
  const ICON_SIZE = 22;

  // Apply custom Polaris theme overrides
  usePolarisCustomOverrides(darkMode, COLOR_DARK_BG, COLOR_LIGHT_BG);

  /**
   * Triggered when a CSV upload starts.
   * Shows spinner and hides results.
   */
  const handleUploadStart = () => {
    setUploadInProgress(true);
    setShowResults(false);
    if (spinnerTimeoutRef.current) clearTimeout(spinnerTimeoutRef.current);
  };

  /**
   * Called by CsvImport when CSV parsing is done.
   * Ensures spinner is visible for at least SPINNER_MIN_DURATION ms.
   */
  const handleCsvData = (rows) => {
    spinnerTimeoutRef.current = setTimeout(() => {
      setProducts(rows);
      setUploadInProgress(false);
      setShowResults(true);
    }, SPINNER_MIN_DURATION);
  };

  /**
   * Trigger success banner when all required columns are present.
   */
  function onAllRequiredColumnsPresent() {
    setSuccessTrigger(Date.now());
  }

  // Auto-hide success banner after 3s (unless warning/error is shown)
  useEffect(() => {
    if (successTrigger === 0) return;
    setShowSuccess(true);
    const timer = setTimeout(() => {
      setShowSuccess((current) =>
        warningMessage || errorMessage ? current : false
      );
    }, 3000);
    return () => clearTimeout(timer);
  }, [successTrigger, warningMessage, errorMessage]);

  // Hide success if warning or error appears
  useEffect(() => {
    if ((warningMessage || errorMessage) && showSuccess) {
      setShowSuccess(false);
    }
  }, [warningMessage, errorMessage, showSuccess]);

  /**
   * Normalizes strings for search: lowercase, removes accents, replaces non-alphanum with space.
   */
  function normalize(str) {
    return String(str || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\d]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Heuristic: Detect whether user is searching by SKU or by product name.
   */
  function isLikelySku(q) {
    return /\d/.test(q) || (/^[\w\-]+$/.test(q) && q.length < 10);
  }

  /**
   * Compute a relevancy score for a match (for fuzzy search).
   */
  function getRelevancy(p, q, mode) {
    const name = normalize(p["Namn"]);
    const sku = normalize(p["Artikelnummer"]);
    const parent = normalize(p["Kategori (parent)"]);
    const sub = normalize(p["Kategori (sub)"]);
    if (mode === "sku") {
      if (sku.includes(q)) return 100;
      if (sub.includes(q)) return 90;
      if (parent.includes(q)) return 80;
      if (name.includes(q)) return 70;
    } else {
      if (sub.includes(q)) return 100;
      if (parent.includes(q)) return 90;
      if (sku.includes(q)) return 80;
      if (name.includes(q)) return 70;
    }
    return 0;
  }

  /**
   * Memoized filtered & sorted product list based on search.
   */
  const filtered = React.useMemo(() => {
    if (!search) return products;
    const qWords = normalize(search).split(" ").filter(Boolean);
    const mode = isLikelySku(search) ? "sku" : "name";
    return products
      .map((p) => {
        let totalScore = 0;
        let allMatched = true;
        for (const q of qWords) {
          const score = getRelevancy(p, q, mode);
          if (score > 0) totalScore += score;
          else allMatched = false;
        }
        return { ...p, _score: allMatched ? totalScore : 0 };
      })
      .filter((p) => p._score > 0)
      .sort((a, b) => b._score - a._score);
  }, [products, search]);

  /**
   * Triggers the hidden file input for CSV upload.
   */
  function handleUploadClick() {
    const el = document.getElementById("csv-input");
    if (el) el.click();
  }

  // Uniform icon wrapper for product list and empty state
  const iconButtonStyle = {
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer"
  };

  // Only show "Inga produkter matchar din sökning" if a file is uploaded
  const hasFileUploaded = products.length > 0;

  // Show main content if not uploading, or after upload spinner is done
  const shouldShowContent =
    (!uploadInProgress && showResults) ||
    (!uploadInProgress && products.length === 0);

  // Cleanup spinner timeout on unmount
  useEffect(() => {
    return () => {
      if (spinnerTimeoutRef.current) clearTimeout(spinnerTimeoutRef.current);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", width: "100vw" }}>
      <AppProvider
        i18n={enTranslations}
        theme={darkMode ? tableSeDarkTheme : tableSeLightTheme}
      >
        <YouTubeHeader
          darkMode={darkMode}
          searchValue={search}
          setSearchValue={setSearch}
          onSearch={setSearch}
          onUpload={handleUploadClick}
          onToggleDarkMode={() => setDarkMode((v) => !v)}
        />
        <div style={{ paddingTop: HEADER_HEIGHT, background: darkMode ? COLOR_DARK_BG : COLOR_LIGHT_BG, minHeight: "100vh" }}>
          <Page title="" fullWidth>
            <CsvImport
              onData={handleCsvData}
              onAllRequiredColumnsPresent={onAllRequiredColumnsPresent}
              setWarningMessage={setWarningMessage}
              setErrorMessage={setErrorMessage}
              onUploadStart={handleUploadStart}
            />
            {uploadInProgress && (
              <div
                style={{
                  minHeight: 250,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <Spinner accessibilityLabel="Laddar produkter" size="large" />
                <div style={{
                  marginTop: 18,
                  color: darkMode ? COLOR_DARK_FADED : COLOR_LIGHT_FADED,
                  fontWeight: 500,
                  fontSize: 16,
                }}>
                  Laddar produkter...
                </div>
              </div>
            )}
            {shouldShowContent && (
              <>
                {warningMessage && (
                  <div
                    style={{
                      color: "#b38800",
                      background: "#fffbe7",
                      border: "1px solid #ffe082",
                      borderRadius: 6,
                      padding: "10px 18px",
                      margin: "18px auto",
                      maxWidth: 400,
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: 16,
                      transition: "opacity 0.5s",
                    }}
                  >
                    {warningMessage}
                  </div>
                )}
                {errorMessage && (
                  <div
                    style={{
                      color: "#b00020",
                      background: "#ffeaea",
                      border: "1px solid #ffcdd2",
                      borderRadius: 6,
                      padding: "10px 18px",
                      margin: "18px auto",
                      maxWidth: 400,
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: 16,
                      transition: "opacity 0.5s",
                    }}
                  >
                    {errorMessage}
                  </div>
                )}
                {showSuccess && !warningMessage && !errorMessage && (
                  <div
                    style={{
                      color: "green",
                      background: "#eafbe7",
                      border: "1px solid #b8e6c1",
                      borderRadius: 6,
                      padding: "10px 18px",
                      margin: "18px auto",
                      maxWidth: 400,
                      textAlign: "center",
                      fontWeight: 600,
                      fontSize: 16,
                      transition: "opacity 0.5s",
                    }}
                  >
                    Alla obligatoriska kolumner finns!
                  </div>
                )}
                <div>
                  <Card
                    style={{
                      background: darkMode ? COLOR_DARK_CARD : COLOR_LIGHT_CARD,
                      border: "none",
                      boxShadow: "none",
                      color: darkMode ? COLOR_DARK_TEXT : COLOR_LIGHT_TEXT,
                      margin: 0,
                      padding: 0,
                      borderRadius: 0,
                      transition: "background 0.18s,color 0.18s",
                    }}
                  >
                    {filtered.length === 0 && hasFileUploaded ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: darkMode ? COLOR_DARK_FADED : COLOR_LIGHT_FADED,
                          padding: "1em 0",
                          fontSize: 17,
                        }}
                      >
                        {/* No icon here */}
                        <div style={{ marginTop: 8 }}>
                          <strong style={{ color: darkMode ? COLOR_DARK_TEXT : COLOR_LIGHT_TEXT }}>
                            Inga produkter matchar din sökning
                          </strong>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0,
                          background: darkMode ? COLOR_DARK_CARD : COLOR_LIGHT_CARD,
                          borderRadius: 0,
                        }}
                      >
                        {filtered.map((item, idx) => {
                          const imgUrl = item["Produktbild-URL"];
                          return (
                            <div
                              key={item["Artikelnummer"] || idx}
                              onClick={() => setSelectedProduct(item)}
                              onTouchStart={() => setSelectedProduct(item)}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                borderBottom: idx === filtered.length - 1
                                  ? "none"
                                  : `1px solid ${darkMode ? COLOR_DARK_BORDER : COLOR_LIGHT_BORDER}`,
                                padding: "7px 0 7px 0",
                                gap: 9,
                                background: "transparent",
                                color: darkMode ? COLOR_DARK_TEXT : COLOR_LIGHT_TEXT,
                                cursor: "pointer",
                              }}
                            >
                              {/* Image */}
                              <div
                                style={{
                                  width: 44,
                                  height: 44,
                                  background: darkMode ? COLOR_DARK_ICON_BG : COLOR_LIGHT_ICON_BG,
                                  borderRadius: 6,
                                  overflow: "hidden",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={item["Namn"] || "Produktbild"}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "contain",
                                      display: "block",
                                      background: darkMode ? COLOR_DARK_ICON_BG : COLOR_LIGHT_ICON_BG,
                                    }}
                                  />
                                ) : (
                                  <span style={{ color: darkMode ? COLOR_DARK_FADED : COLOR_LIGHT_FADED, ...iconButtonStyle }}>
                                    <ImageSquare size={ICON_SIZE} />
                                  </span>
                                )}
                              </div>
                              {/* Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: 15,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    textTransform: "uppercase",
                                    minWidth: 0,
                                    color: darkMode ? COLOR_DARK_TEXT : COLOR_LIGHT_TEXT,
                                  }}
                                  title={item["Namn"]}
                                >
                                  {item["Namn"] || <em style={{ color: darkMode ? COLOR_DARK_FADED : COLOR_LIGHT_FADED }}>Namnlös</em>}
                                </div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    fontSize: 15,
                                    color: tableSeOrange,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    minWidth: 0,
                                  }}
                                  title={item["Artikelnummer"]}
                                >
                                  {item["Artikelnummer"]}
                                </div>
                              </div>
                              {/* Prices */}
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: 1,
                                  minWidth: 80,
                                }}
                              >
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                    fontSize: 14,
                                    color: darkMode ? COLOR_DARK_TEXT : COLOR_LIGHT_TEXT,
                                  }}
                                >
                                  <span>{item["Pris exkl. moms (värde)"]}</span>
                                  <span style={{ fontSize: 12, color: darkMode ? COLOR_DARK_FADED : COLOR_LIGHT_FADED, marginLeft: 2 }}>
                                    {item["Pris exkl. moms (enhet)"]}
                                  </span>
                                </span>
                                <span
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                    fontSize: 14,
                                    color: darkMode ? COLOR_DARK_TEXT : COLOR_LIGHT_TEXT,
                                  }}
                                >
                                  <span>{item["Pris inkl. moms (värde)"]}</span>
                                  <span style={{ fontSize: 12, color: darkMode ? COLOR_DARK_FADED : COLOR_LIGHT_FADED, marginLeft: 2 }}>
                                    {item["Pris inkl. moms (enhet)"]}
                                  </span>
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </div>
              </>
            )}
          </Page>
        </div>
        {/* ProductCard Popup */}
        <ProductCard
          product={selectedProduct}
          allProducts={products}
          onClose={() => setSelectedProduct(null)}
          darkMode={darkMode}
          onProductSelect={rel => {
            // Always pick from products list for correct object identity
            const match = products.find(p => p["Artikelnummer"] === rel["Artikelnummer"]);
            setSelectedProduct(match || rel);
          }}
        />
      </AppProvider>
    </div>
  );
}