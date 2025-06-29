import React from "react";
import * as XLSX from "xlsx";

// Canonical Table.se product fields (order matters for export)
const PRODUCT_FIELDS = [
  "Namn",
  "Artikelnummer",
  "Färg",
  "Material",
  "Serie",
  "Pris exkl. moms (värde)",
  "Pris exkl. moms (enhet)",
  "Pris inkl. moms (värde)",
  "Pris inkl. moms (enhet)",
  "Längd (värde)", "Längd (enhet)",
  "Bredd (värde)", "Bredd (enhet)",
  "Höjd (värde)", "Höjd (enhet)",
  "Djup (värde)", "Djup (enhet)",
  "Diameter (värde)", "Diameter (enhet)",
  "Kapacitet (värde)", "Kapacitet (enhet)",
  "Volym (värde)", "Volym (enhet)",
  "Vikt (värde)", "Vikt (enhet)",
  "Data (text)",
  "Kategori (parent)",
  "Kategori (sub)",
  "Produktbild-URL",
  "Produkt-URL",
  "Beskrivning",
  "Extra data",
];

// Field normalization for robust mapping, e.g. "Färg" <-> "farg"
const FIELD_ALIASES = PRODUCT_FIELDS.reduce((acc, field) => {
  acc[field.toLowerCase()] = field;
  acc[field.replace(/[\s\-\(\)]/g, "").toLowerCase()] = field;
  return acc;
}, {});

// Try to map columns to canonical field names
function mapFields(uploadedFields) {
  const mapping = {};
  uploadedFields.forEach((f) => {
    const norm = f.trim().toLowerCase();
    if (FIELD_ALIASES[norm]) {
      mapping[f] = FIELD_ALIASES[norm];
    } else if (FIELD_ALIASES[norm.replace(/[\s\-\(\)]/g, "")]) {
      mapping[f] = FIELD_ALIASES[norm.replace(/[\s\-\(\)]/g, "")];
    } else {
      mapping[f] = f; // unmapped, will be flagged as extra/ignored
    }
  });
  return mapping;
}

// Validate columns: returns { missing: [], extra: [] }
function validateColumns(mappedFields) {
  const present = Object.values(mappedFields);
  const missing = PRODUCT_FIELDS.filter((f) => !present.includes(f));
  const extra = Object.keys(mappedFields).filter(
    (f) => !PRODUCT_FIELDS.includes(mappedFields[f])
  );
  return { missing, extra };
}

export default function CsvImport({
  onData,
  onAllRequiredColumnsPresent,
  setWarningMessage,
  setErrorMessage,
  onUploadStart,
}) {
  const fileInputRef = React.useRef();
  const [validation, setValidation] = React.useState(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (onUploadStart) onUploadStart();

    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        let workbook;
        if (ext === "csv") {
          // --- CRITICAL: Use string mode for UTF-8 CSVs! ---
          workbook = XLSX.read(evt.target.result, { type: "string", codepage: 65001 });
        } else {
          workbook = XLSX.read(evt.target.result, { type: "binary" });
        }
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        if (!rows.length) throw new Error("Filen innehåller inga rader.");
        const uploadedFields = Object.keys(rows[0]);
        const fieldMap = mapFields(uploadedFields);
        const val = validateColumns(fieldMap);
        setValidation(val);

        // Message logic for parent
        if (setWarningMessage) setWarningMessage("");
        if (setErrorMessage) setErrorMessage("");
        if (val.missing.length === 0) {
          if (onAllRequiredColumnsPresent) onAllRequiredColumnsPresent();
        } else if (val.missing.length > 0 && setWarningMessage) {
          setWarningMessage("Varning: Saknade fält i filen: " + val.missing.join(", "));
        }

        // Map fields for each row, only canonical fields, fill missing as ""
        const cleanRows = rows.map((row) => {
          const result = {};
          PRODUCT_FIELDS.forEach((canon) => {
            // Find uploaded field mapped to this canonical field
            const uploaded = Object.keys(fieldMap).find((uf) => fieldMap[uf] === canon);
            result[canon] = uploaded ? row[uploaded] : "";
          });
          return result;
        });
        onData(cleanRows);
      } catch (err) {
        if (setErrorMessage) setErrorMessage("Kunde inte läsa filen: " + err.message);
        alert("Kunde inte läsa filen: " + err.message);
      }
    };

    if (ext === "csv") {
      reader.readAsText(file, "utf-8"); // This fixes all Swedish/UTF-8 issues!
    } else {
      reader.readAsBinaryString(file);
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        ref={fileInputRef}
        id="csv-input"
        style={{ display: "none" }}
        onChange={handleFile}
      />
      
      {validation && (
        <div style={{ marginTop: 12, fontSize: 14 }}>
          {validation.missing.length > 0 && (
            <div style={{ color: "orange", marginBottom: 6 }}>
              <strong>Varning:</strong> Saknade fält i filen:
              <ul>
                {validation.missing.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {validation.extra.length > 0 && (
            <div style={{ color: "#888", marginBottom: 6 }}>
              <strong>Övriga kolumner (ignoreras):</strong>{" "}
              {validation.extra.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}