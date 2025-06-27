import React from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

function parseFile(file, setProducts) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === "csv") {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => setProducts(result.data.filter(Boolean)),
      error: () => alert("Misslyckades med att läsa CSV-fil."),
    });
  } else if (ext === "xlsx" || ext === "xls") {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target.result, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      setProducts(data);
    };
    reader.readAsBinaryString(file);
  } else {
    alert("Filtyp stöds ej. Vänligen ladda upp en .csv eller .xlsx-fil.");
  }
}

export default function FileUpload({ setProducts }) {
  return (
    <div className="mb-6">
      <label className="block text-lg font-medium mb-2">
        Ladda upp CSV/XLSX-export:
      </label>
      <input
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={e => e.target.files[0] && parseFile(e.target.files[0], setProducts)}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black file:cursor-pointer"
      />
    </div>
  );
}