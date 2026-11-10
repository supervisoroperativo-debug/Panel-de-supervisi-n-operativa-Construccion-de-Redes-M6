/**
 * ============================================================================
 * SCRIPT PARA GOOGLE SHEETS - LECTURA DE CARPETA SCTR EN GOOGLE DRIVE
 * ============================================================================
 * Si deseas que tu Google Sheet liste automáticamente los archivos PDF que
 * subas a tu carpeta compartida de Google Drive:
 * https://drive.google.com/drive/folders/15BQ-LzbGeEMR9TBD3lrPGuAB7g-uiDeh
 *
 * INSTRUCCIONES:
 * 1. En tu Google Sheet, haz clic en "Extensiones" > "Apps Script".
 * 2. Pega este código y guarda el proyecto.
 * 3. Al recargar tu Google Sheet, aparecerá un menú llamado "📋 SCTR Redes M&D".
 * 4. Haz clic en "🔄 Leer Archivos de la Carpeta Drive" y el script colocará
 *    los nombres de las pólizas y sus enlaces de descarga directa.
 * ============================================================================
 */

const SCTR_FOLDER_ID = "15BQ-LzbGeEMR9TBD3lrPGuAB7g-uiDeh";

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("📋 SCTR Redes M&D")
    .addItem("🔄 Leer Archivos de la Carpeta Drive", "listarPdfsDeCarpetaDrive")
    .addToUi();
}

function listarPdfsDeCarpetaDrive() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const folder = DriveApp.getFolderById(SCTR_FOLDER_ID);
  const files = folder.getFiles();

  // Asegurar encabezados si está vacía
  if (sheet.getLastRow() === 0) {
    const headers = [
      "DNI / CE",
      "Nombres y Apellidos",
      "Empresa / Sede",
      "Cargo / Especialidad",
      "Aseguradora",
      "N° Póliza",
      "Vigencia Desde",
      "Vigencia Hasta",
      "Enlace Descarga PDF"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#0284c7").setFontColor("#ffffff").setFontWeight("bold");
  }

  const existingFiles = [];
  while (files.hasNext()) {
    const file = files.next();
    if (file.getMimeType() === "application/pdf" || file.getName().toLowerCase().endsWith(".pdf")) {
      const downloadUrl = "https://drive.google.com/uc?export=download&id=" + file.getId();
      existingFiles.push({
        name: file.getName(),
        url: file.getUrl(),
        downloadUrl: downloadUrl
      });
    }
  }

  SpreadsheetApp.getActiveSpreadsheet().toast(
    `Se encontraron ${existingFiles.length} archivos PDF en tu carpeta de Google Drive.`,
    "Carpeta SCTR",
    5
  );
}
