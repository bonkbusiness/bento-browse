import React, { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlass,
  UploadSimple,
  Sun,
  Moon
} from "phosphor-react";

const HEADER_HEIGHT = 56;
const ICON_SIZE = 22;

export default function YouTubeHeader({
  darkMode,
  searchValue,
  setSearchValue,
  onSearch,
  onUpload,
  onToggleDarkMode,
}) {
  const [showSearch, setShowSearch] = useState(window.innerWidth > 560);
  const inputRef = useRef(null);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 560) {
        setShowSearch(true);
      } else {
        setShowSearch(false);
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (showSearch && inputRef.current) inputRef.current.focus();
  }, [showSearch]);

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
    cursor: "pointer",
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: HEADER_HEIGHT,
        background: darkMode ? "#18191a" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: darkMode ? "1px solid #232426" : "1px solid #e0e0e0",
        zIndex: 1100,
        padding: "0 8px",
      }}
    >
      <style>
        {`
          @media (max-width: 560px) {
            .header-form {
              max-width: 100vw !important;
              margin: 0 !important;
            }
            .header-input {
              width: 1px !important;
              min-width: 0 !important;
              flex: 1 1 0 !important;
            }
            .header-actions {
              gap: 10px !important;
              margin-left: 6px !important;
            }
            .header-search-icon {
              font-size: 22px !important;
              width: 40px !important;
              height: 40px !important;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 4px;
            }
          }
        `}
      </style>
      {window.innerWidth <= 560 && !showSearch && (
        <button
          className="header-search-icon"
          aria-label="Visa sökfält"
          style={{
            ...iconButtonStyle,
            color: darkMode ? "#f6f6f6" : "#18191a",
            marginRight: 10,
          }}
          onClick={() => setShowSearch(true)}
        >
          <MagnifyingGlass size={ICON_SIZE} weight="duotone" />
        </button>
      )}
      {(showSearch || window.innerWidth > 560) && (
        <form
          className="header-form"
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: 600,
          }}
          onSubmit={e => {
            e.preventDefault();
            onSearch && onSearch(searchValue);
            if (window.innerWidth <= 560) setShowSearch(false);
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              borderRadius: "20px",
              border: searchFocused
                ? `2px solid ${darkMode ? "#FFD600" : "#1976d2"}`
                : "1px solid #ccc",
              background: darkMode ? "#232426" : "#fff",
              boxShadow: searchFocused ? "0 0 0 2px #FFD60020" : undefined,
              transition: "border 0.15s, box-shadow 0.15s",
              width: "100%",
              maxWidth: 600,
              minHeight: 36,
              margin: 0,
              padding: 0,
              position: "relative",
            }}
          >
            <input
              className="header-input"
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Sök"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              style={{
                width: 400,
                minWidth: 0,
                padding: "7px 12px",
                border: "none",
                outline: "none",
                fontSize: 16,
                background: "transparent",
                color: darkMode ? "#f6f6f6" : "#18191a",
                transition: "background 0.2s,color 0.2s",
                flex: 1,
              }}
            />
            <button
              type="submit"
              style={{
                width: 44,
                height: 36,
                border: "none",
                borderRadius: "0 20px 20px 0",
                background: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: searchFocused
                  ? (darkMode ? "#FFD600" : "#1976d2")
                  : (darkMode ? "#aaa" : "#888"),
                marginRight: 2,
                transition: "color 0.15s"
              }}
              tabIndex={-1}
              aria-label="Sök"
            >
              <MagnifyingGlass
                size={18}
                weight="duotone"
              />
            </button>
          </div>
        </form>
      )}
      <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: 18, marginLeft: 18 }}>
        <span
          className="header-upload"
          style={iconButtonStyle}
          title="Upload"
          onClick={onUpload}
        >
          <UploadSimple size={ICON_SIZE} weight="duotone" />
        </span>
        <button
          className="header-dark"
          type="button"
          onClick={onToggleDarkMode}
          style={{
            ...iconButtonStyle,
            color: darkMode ? "#FFD600" : "#1a237e",
            background: "none",
            border: "none"
          }}
          title="Växla dag/natt"
        >
          {darkMode
            ? <Sun size={20} weight="duotone" />
            : <Moon size={20} weight="duotone" />
          }
        </button>
      </div>
    </header>
  );
}