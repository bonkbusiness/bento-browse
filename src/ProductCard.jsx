/**
 * ProductCard.jsx
 *
 * Product details popup card, mobile-first.
 * - Title (Namn) is uppercase, single-line, ellipsis, never exceeds card border-radius or width.
 * - Serie and Färg are in a full-width block below the grid, word-wrapped, no fixed height.
 * - All values are compact and responsive.
 * - Image popup always loads the highest available resolution.
 * - Card is mobile-friendly (max-width: 570px, width: 99vw, padding, border-radius).
 */

import React, { useState, useRef, useEffect } from "react";
import {
  TagChevron,
  Cube,
  Palette,
  Sparkle,
  ArchiveBox,
  Coins,
  Ruler,
  ArrowsLeftRight,
  ArrowsInSimple,
  Drop,
  Scales,
  ImageSquare,
  LinkSimple,
  Info,
  ListBullets,
} from "phosphor-react";

// --- Icon mapping for product fields ---
const FIELD_ICONS = {
  "Namn": <TagChevron size={18} />,
  "Serie": <ArchiveBox size={18} />,
  "Färg": <Palette size={18} />,
  "Material": <Sparkle size={18} />,
  "Exkl.": <Coins size={18} />,
  "Inkl.": <Coins size={18} />,
  "Längd": <Ruler size={18} />,
  "Bredd": <ArrowsLeftRight size={18} />,
  "Höjd": <ArrowsInSimple size={18} />,
  "Djup": <Cube size={18} />,
  "Diameter": <Drop size={18} />,
  "Kapacitet": <Info size={18} />,
  "Volym": <Cube size={18} />,
  "Vikt": <Scales size={18} />,
  "Kategori (parent)": <ListBullets size={18} />,
  "Kategori (sub)": <ListBullets size={18} />,
  "Produktbild-URL": <ImageSquare size={18} />,
  "Produkt-URL": <LinkSimple size={18} />,
  "Extra data": <Info size={18} />,
};

const PRICE_FIELDS = [
  ["Pris exkl. moms (värde)", "Pris exkl. moms (enhet)", "Exkl."],
  ["Pris inkl. moms (värde)", "Pris inkl. moms (enhet)", "Inkl."],
];

const OTHER_MEASUREMENTS = [
  "Längd", "Bredd", "Höjd", "Djup", "Diameter", "Kapacitet", "Volym", "Vikt"
];

// Serie and Färg are NOT in the column structure
const BASIC_FIELDS = [
  ["Material", "Material"],
  ["Kategori (parent)", "Kategori (parent)"],
  ["Kategori (sub)", "Kategori (sub)"],
];

function stripPriceLabel(label) {
  return label.replace(/pris/gi, "").replace(/moms/gi, "").replace(/\(\s*\)/g, "").replace(/\s+/g, " ").trim() || label;
}

function getHighResImage(url) {
  if (!url) return url;
  let highRes = url
    .replace(/(_small|_thumb|_medium)/gi, "")
    .replace(/(-\d+x\d+)(\.\w+)$/, "$2")
    .replace(/\/small\//gi, "/")
    .replace(/\/thumb\//gi, "/")
    .replace(/\/medium\//gi, "/")
    .replace(/(size=)\d+x\d+/gi, "size=2000x2000");
  return highRes;
}

export default function ProductCard({
  product,
  allProducts,
  onClose,
  darkMode,
  onProductSelect
}) {
  // All hooks at top
  const [imagePopup, setImagePopup] = useState(false);
  const titleRef = useRef(null);
  const gridContainerRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(340);

  useEffect(() => {
    if (gridContainerRef.current) {
      setGridWidth(gridContainerRef.current.offsetWidth || 340);
    }
    // Update on window resize for mobile
    function handleResize() {
      if (gridContainerRef.current) {
        setGridWidth(gridContainerRef.current.offsetWidth || 340);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [product, gridContainerRef.current]);

  if (!product) return null;

  const sku = String(product["Artikelnummer"] || "");
  const subcat = product["Kategori (sub)"] || "";
  const relevant = allProducts.filter(p => {
    const psku = String(p["Artikelnummer"] || "");
    return (
      psku &&
      psku !== sku &&
      (
        (sku && psku.startsWith(sku.slice(0, 3))) ||
        (subcat && p["Kategori (sub)"] === subcat)
      )
    );
  }).slice(0, 6);

  // --- Styles ---
  const overlayStyle = {
    position: "fixed",
    top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.5)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "auto"
  };
  const cardStyle = {
    background: darkMode ? "#232426" : "#fff",
    borderRadius: 12,
    maxWidth: 570,
    width: "99vw",
    padding: 20,
    boxShadow: "0 4px 32px #0003",
    position: "relative",
    color: darkMode ? "#f6f6f6" : "#18191a",
    border: darkMode ? "1px solid #444" : "1px solid #e0e0e0"
  };

  // Responsive: for grid and title, never overflow the card
  const responsiveGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 12px",
    marginBottom: 10,
    width: "100%",
    boxSizing: "border-box"
  };

  function renderGridField(icon, label, value, enhet) {
    if (!value) return null;
    return (
      <div
        key={label}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          minWidth: 0,
          marginBottom: 2,
        }}
      >
        <span style={{ minWidth: 22, display: "flex", justifyContent: "center" }}>{icon}</span>
        <span style={{
          fontWeight: 500,
          fontSize: 15,
          color: darkMode ? "#f6f6f6" : "#333",
          flexShrink: 0,
          minWidth: 46,
          maxWidth: 80,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>{label}</span>
        <span style={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          minWidth: 0,
          justifyContent: "flex-end"
        }}>
          <span style={{
            fontWeight: 600,
            fontSize: 15,
            color: darkMode ? "#fff" : "#222",
            textAlign: "right",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: 72,
          }}>
            {value}
          </span>
          {enhet && (
            <span style={{
              marginLeft: 4,
              color: darkMode ? "#FFD600" : "#1976d2",
              fontSize: 15,
              minWidth: 16,
              maxWidth: 36,
              textAlign: "left",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {enhet}
            </span>
          )}
        </span>
      </div>
    );
  }

  function buildColumns() {
    // Left column: Prices
    const leftColumn = [];
    PRICE_FIELDS.forEach(([valKey, enhetKey, label]) => {
      const value = product[valKey];
      const enhet = product[enhetKey];
      if (value) {
        leftColumn.push(
          renderGridField(
            FIELD_ICONS[label], stripPriceLabel(label), value, enhet
          )
        );
      }
    });

    // Right column: Article info and measurements (skip Artikelnummer, Serie, Färg)
    const rightColumn = [];
    BASIC_FIELDS.forEach(([label, key]) => {
      const value = product[key];
      if (value) {
        rightColumn.push(
          renderGridField(
            FIELD_ICONS[label], label, value
          )
        );
      }
    });
    OTHER_MEASUREMENTS.forEach(name => {
      const value = product[`${name} (värde)`];
      const enhet = product[`${name} (enhet)`];
      if (value) {
        rightColumn.push(
          renderGridField(
            FIELD_ICONS[name], name, value, enhet
          )
        );
      }
    });

    return [leftColumn, rightColumn];
  }

  const [leftColumn, rightColumn] = buildColumns();

  // --- Image Popup Overlay ---
  const imagePopupStyle = {
    position: "fixed",
    top: 0, left: 0, width: "100vw", height: "100vh",
    background: "rgba(0,0,0,0.88)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "zoom-out"
  };

  // Centered related products container
  const relatedProductsContainerStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    justifyContent: "center",
    paddingLeft: 0,
    paddingRight: 0,
  };

  // --- Render ---
  return (
    <>
      {/* Image popup overlay, always tries high-res */}
      {imagePopup && product["Produktbild-URL"] && (
        <div
          style={imagePopupStyle}
          onClick={() => setImagePopup(false)}
          tabIndex={0}
          role="button"
          aria-label="Stäng bild"
        >
          <img
            src={getHighResImage(product["Produktbild-URL"])}
            alt={product["Namn"]}
            style={{
              maxWidth: "98vw",
              maxHeight: "96vh",
              borderRadius: 12,
              boxShadow: "0 4px 32px #0008",
              cursor: "zoom-out",
              background: "#fff",
              objectFit: "contain",
              display: "block",
            }}
            onClick={e => { e.stopPropagation(); setImagePopup(false); }}
            onLoad={e => { e.target.style.opacity = 1; }}
          />
        </div>
      )}
      <div style={overlayStyle} onClick={onClose}>
        <div style={cardStyle} onClick={e => e.stopPropagation()}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              fontSize: 24,
              background: "none",
              border: "none",
              color: darkMode ? "#aaa" : "#888",
              cursor: "pointer"
            }}
            aria-label="Stäng"
          >×</button>
          {/* Header with image and name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            {product["Produktbild-URL"] ? (
              <img
                src={product["Produktbild-URL"]}
                alt={product["Namn"]}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "contain",
                  borderRadius: 8,
                  background: darkMode ? "#18191a" : "#f8f8f8",
                  cursor: "zoom-in",
                  flexShrink: 0
                }}
                onClick={() => setImagePopup(true)}
                tabIndex={0}
                role="button"
                aria-label="Visa större bild"
              />
            ) : (
              <ImageSquare size={50} color={darkMode ? "#FFD600" : "#888"} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                ref={titleRef}
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  marginBottom: 2,
                  lineHeight: 1.18,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "uppercase",
                  maxWidth: gridWidth ? gridWidth - 24 : 260, // leave room for padding
                  // Responsive: never exceed card width (border-radius)
                  transition: "max-width 0.2s",
                }}
                title={product["Namn"]}
              >
                {product["Namn"]}
              </div>
              <div style={{ color: "#ff7e1b", fontWeight: 600, fontSize: 13 }}>
                {sku}
              </div>
            </div>
          </div>
          {/* Two-column grid for datapoints */}
          <div
            ref={gridContainerRef}
            style={responsiveGridStyle}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>{leftColumn}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>{rightColumn}</div>
          </div>
          {/* Serie + Färg as a full-width block, word-wrap, no height restriction */}
          {(product["Serie"] || product["Färg"]) && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                margin: "8px 0 6px 0",
                padding: "8px 8px",
                width: "100%",
                borderRadius: 8,
                background: darkMode ? "#1d1d1e" : "#f7f7fa",
                border: darkMode ? "1px solid #333" : "1px solid #e0e0e0",
              }}
            >
              {/* Serie */}
              {product["Serie"] && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, width: "100%" }}>
                  <span
                    style={{
                      minWidth: 22, display: "flex", justifyContent: "center", marginTop: 3
                    }}>{FIELD_ICONS["Serie"]}</span>
                  <span style={{
                    fontWeight: 500,
                    fontSize: 15,
                    color: darkMode ? "#FFD600" : "#222",
                    flexShrink: 0,
                    minWidth: 52,
                    maxWidth: 90,
                    marginTop: 3,
                    marginRight: 8
                  }}>Serie</span>
                  <span style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: darkMode ? "#fff" : "#222",
                    display: "block",
                    lineHeight: "22px",
                    width: "100%",
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                  }}>
                    {product["Serie"]}
                  </span>
                </div>
              )}
              {/* Färg */}
              {product["Färg"] && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, width: "100%" }}>
                  <span
                    style={{
                      minWidth: 22, display: "flex", justifyContent: "center", marginTop: 3
                    }}>{FIELD_ICONS["Färg"]}</span>
                  <span style={{
                    fontWeight: 500,
                    fontSize: 15,
                    color: darkMode ? "#FFD600" : "#222",
                    flexShrink: 0,
                    minWidth: 52,
                    maxWidth: 90,
                    marginTop: 3,
                    marginRight: 8
                  }}>Färg</span>
                  <span style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: darkMode ? "#fff" : "#222",
                    display: "block",
                    lineHeight: "22px",
                    width: "100%",
                    wordBreak: "break-word",
                    whiteSpace: "pre-line",
                  }}>
                    {product["Färg"]}
                  </span>
                </div>
              )}
            </div>
          )}
          {/* Beskrivning in its own space */}
          {product["Beskrivning"] && (
            <div
              style={{
                margin: "14px 0 8px 0",
                padding: "10px 10px",
                background: darkMode ? "#191a1a" : "#f6f7fa",
                borderRadius: 8,
                fontSize: 15,
                whiteSpace: "pre-line",
                color: darkMode ? "#eee" : "#222",
                border: darkMode ? "1px solid #383838" : "1px solid #e0e0e0",
              }}
            >
              <strong style={{ display: "block", marginBottom: 4, color: darkMode ? "#FFD600" : "#333" }}>
                Beskrivning
              </strong>
              {product["Beskrivning"]}
            </div>
          )}
          {/* Product URL */}
          {product["Produkt-URL"] && (
            <a
              href={product["Produkt-URL"]}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                color: "#1976d2",
                textDecoration: "underline",
                marginBottom: 12,
                fontSize: 15
              }}
            >
              Visa på Table.se
            </a>
          )}
          <hr style={{ margin: "16px 0", borderColor: darkMode ? "#333" : "#eee" }} />
          <div>
            <strong>Relaterade produkter</strong>
            <div style={relatedProductsContainerStyle}>
              {relevant.length === 0 && (
                <div style={{ color: "#888" }}>Inga relaterade produkter</div>
              )}
              {relevant.map(rel => (
                <div
                  key={rel["Artikelnummer"]}
                  style={{
                    width: 78,
                    textAlign: "center",
                    cursor: "pointer",
                    outline: "none",
                    borderRadius: 6,
                    transition: "box-shadow 0.2s",
                    boxShadow: "none",
                  }}
                  onClick={() => {
                    const match = allProducts.find(p => p["Artikelnummer"] === rel["Artikelnummer"]);
                    if (onProductSelect) onProductSelect(match || rel);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Visa ${rel["Namn"]}`}
                >
                  {rel["Produktbild-URL"] && (
                    <img
                      src={rel["Produktbild-URL"]}
                      alt={rel["Namn"]}
                      style={{
                        width: 60,
                        height: 60,
                        objectFit: "contain",
                        borderRadius: 6,
                        background: darkMode ? "#18191a" : "#f8f8f8"
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontSize: 11,
                      color: "#555",
                      marginTop: 2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={rel["Namn"]}
                  >
                    {rel["Namn"]}
                  </div>
                  <div style={{ color: "#ff7e1b", fontSize: 11 }}>{rel["Artikelnummer"]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}