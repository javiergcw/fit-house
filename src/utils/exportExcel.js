import * as XLSX from 'xlsx';

/**
 * Exporta un array de objetos a un archivo Excel (.xlsx).
 * Las claves del primer objeto se usan como cabeceras.
 * @param {Object[]} data - Array de objetos (claves = columnas)
 * @param {string} filename - Nombre del archivo sin extensión
 * @param {string} [sheetName='Datos'] - Nombre de la hoja
 */
export function exportToExcel(data, filename, sheetName = 'Datos') {
  if (!data || data.length === 0) {
    return;
  }
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Exporta varias hojas a un mismo archivo Excel.
 * @param {Array<{ name: string, data: Object[] }>} sheets - Array de { name, data }
 * @param {string} filename - Nombre del archivo sin extensión
 */
export function exportToExcelMultiSheet(sheets, filename) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    if (data && data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31)); // Excel limita 31 caracteres por hoja
    }
  });
  if (wb.SheetNames.length > 0) {
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
}
