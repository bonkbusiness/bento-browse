/**
 * ProductCard.jsx
 *
 * Table.se Product details popup card.
 *
 * Features:
 * - Two-column layout: left for prices, right for all other datapoints (excl. Artikelnummer).
 * - Units are shown as text after the value.
 * - "Beskrivning" is in its own section.
 * - "Pris" and "moms" are stripped from price labels.
 * - Clicking/tapping on the product image opens a full-size overlay with the highest available resolution (try srcset or replace _small/_thumb with _large), tap again to close.
 * - Related products: Clicking/tapping a related product updates the card (calls onProductSelect if provided).
 * - Related products are always centered with equal left/right padding for a unified look.
 * - Only valid Phosphor-react icons are used.
 */

import React, { useState } from "react";
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
  "Färg": <Palette size={18} />,
  "Material": <Sparkle size={18} />,
  "Serie": <ArchiveBox size={18} />,
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

// Exclude "Artikelnummer" from right column as it's shown under the product name.
const BASIC_FIELDS = [
  ["Färg", "Färg"],
  ["Material", "Material"],
  ["Serie", "Serie"],
  ["Kategori (parent)", "Kategori (parent)"],
  ["Kategori (sub)", "Kategori (sub)"],
  // "Beskrivning" gets its own space below
];

function stripPriceLabel(label) {
  // Removes 'Pris', 'moms', and trims
  return label.replace(/pris/gi, "").replace(/moms/gi, "").replace(/\(\s*\)/g, "").replace(/\s+/g, " ").trim() || label;
}

// Utility to try to get higher-res image URL if possible
function getHighResImage(url) {
  if (!url) return url;
  // Try common patterns: replace _small, _thumb, _medium, -150x150 with empty or _large
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
  onProductSelect // (product: object) => void, for related products
}) {
  const [imagePopup, setImagePopup] = useState(false);

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
    width: "95vw",
    padding: 28,
    boxShadow: "0 4px 32px #0003",
    position: "relative",
    color: darkMode ? "#f6f6f6" : "#18191a",
    border: darkMode ? "1px solid #444" : "1px solid #e0e0e0"
  };

  // Render a field row for the grid (unit as text)
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
          minWidth: 70,
          color: darkMode ? "#f6f6f6" : "#333",
          flexShrink: 0
        }}>{label}</span>
        <span style={{ fontWeight: 600, fontSize: 15, color: darkMode ? "#fff" : "#222", flexShrink: 0 }}>
          {value}
        </span>
        {enhet && (
          <span style={{ marginLeft: 3, color: darkMode ? "#FFD600" : "#1976d2", fontSize: 15 }}>
            {enhet}
          </span>
        )}
      </div>
    );
  }

  // Build grid columns for price (left) and all other datapoints (right)
  function buildColumns() {
    // Left column: Prices (with "pris"/"moms" removed)
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

    // Right column: Article info and measurements (skip Artikelnummer)
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

  return (
    <>
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
            onClick={() => setImagePopup(false)}
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
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
            {product["Produktbild-URL"] ? (
              <img
                src={product["Produktbild-URL"]}
                alt={product["Namn"]}
                style={{
                  width: 70,
                  height: 70,
                  objectFit: "contain",
                  borderRadius: 8,
                  background: darkMode ? "#18191a" : "#f8f8f8",
                  cursor: "zoom-in"
                }}
                onClick={() => setImagePopup(true)}
                tabIndex={0}
                role="button"
                aria-label="Visa större bild"
              />
            ) : (
              <ImageSquare size={58} color={darkMode ? "#FFD600" : "#888"} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 21, fontWeight: 700, marginBottom: 2, lineHeight: 1.15 }}>
                {product["Namn"]}
              </div>
              <div style={{ color: "#ff7e1b", fontWeight: 600, fontSize: 15 }}>
                {sku}
              </div>
            </div>
          </div>
          {/* Two-column grid for datapoints */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 26px",
            marginBottom: 12,
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>{leftColumn}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>{rightColumn}</div>
          </div>
          {/* Beskrivning in its own space */}
          {product["Beskrivning"] && (
            <div
              style={{
                margin: "16px 0 10px 0",
                padding: "12px 12px",
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
                marginBottom: 16
              }}
            >
              Visa på Table.se
            </a>
          )}
          <hr style={{ margin: "18px 0", borderColor: darkMode ? "#333" : "#eee" }} />
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
                    width: 90,
                    textAlign: "center",
                    cursor: "pointer",
                    outline: "none",
                    borderRadius: 6,
                    transition: "box-shadow 0.2s",
                    boxShadow: "none",
                  }}
                  onClick={() => onProductSelect && onProductSelect(rel)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Visa ${rel["Namn"]}`}
                >
                  {rel["Produktbild-URL"] && (
                    <img
                      src={rel["Produktbild-URL"]}
                      alt={rel["Namn"]}
                      style={{
                        width: 72,
                        height: 72,
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