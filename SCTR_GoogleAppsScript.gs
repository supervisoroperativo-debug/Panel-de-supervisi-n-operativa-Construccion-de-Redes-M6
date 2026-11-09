/**
 * ============================================================================
 * SERVIDOR DE SINCRONIZACIÓN SCTR EN LA NUBE - REDES M&D
 * ============================================================================
 * Este script de Google Apps Script se conecta a Google Drive y Google Sheets
 * para permitir la sincronización automática y la descarga de PDFs de SCTR
 * desde cualquier dispositivo (celulares, laptops, computadoras).
 *
 * INSTRUCCIONES DE INSTALACIÓN (Se realiza una sola vez - 2 minutos):
 * 1. Entra a https://script.google.com e inicia sesión con tu cuenta de Google.
 * 2. Haz clic en "Nuevo proyecto".
 * 3. Borra todo el código que aparezca y pega TODO este archivo.
 * 4. Haz clic en el botón azul "Implementar" (arriba a la derecha) > "Nueva implementación".
 * 5. En "Seleccionar tipo", haz clic en el engranaje ⚙️ y elige "Aplicación web".
 * 6. Configura:
 *    - Descripción: "API SCTR Redes M&D"
 *    - Ejecutar como: "Yo" (tu correo)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone)
 * 7. Haz clic en "Implementar", autoriza los permisos de Google Drive.
 * 8. Copia la "URL de la aplicación web" (termina en /exec) y pégala en el panel
 *    de Administración de la página consulta-sctr.html.
 * ============================================================================
 */

const FOLDER_NAME = "SCTR_Polizas_RedesMD";
const DB_FILE_NAME = "sctr_database.json";
const SHEET_NAME = "Base_Datos_SCTR_RedesMD";

// OBTENER BASE DE DATOS (MÉTODO GET - Para consultar desde cualquier celular o PC)
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "get";
    
    if (action === "stats") {
      const db = loadDatabaseFromDrive();
      return createJsonResponse({
        success: true,
        total: db.length,
        timestamp: new Date().toISOString()
      });
    }

    // Acción por defecto: devolver la nómina de técnicos y pólizas
    const workers = loadDatabaseFromDrive();
    return createJsonResponse({
      success: true,
      workers: workers,
      count: workers.length,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

// GUARDAR PÓLIZAS Y ACTUALIZAR NÓMINA (MÉTODO POST - Subida desde Celular o PC)
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({ success: false, error: "Sin datos en la petición" });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action || "save";

    // 1. VACIAR BASE DE DATOS (Limpieza mensual)
    if (action === "clear") {
      saveDatabaseToDrive([]);
      clearGoogleSheet();
      return createJsonResponse({
        success: true,
        message: "Nómina SCTR vaciada con éxito en la nube",
        workers: []
      });
    }

    // 2. ELIMINAR UN TÉCNICO ESPECÍFICO
    if (action === "delete_worker" && payload.dni) {
      let currentDb = loadDatabaseFromDrive();
      currentDb = currentDb.filter(w => String(w.dni) !== String(payload.dni));
      saveDatabaseToDrive(currentDb);
      syncToGoogleSheet(currentDb);
      return createJsonResponse({
        success: true,
        message: "Técnico eliminado de la nube",
        workers: currentDb
      });
    }

    // 3. GUARDAR PÓLIZAS Y TÉCNICOS
    if (action === "save") {
      const incomingWorkers = payload.workers || [];
      const incomingFiles = payload.files || [];

      // Obtener o crear carpeta en Google Drive
      const folder = getOrCreateFolder(FOLDER_NAME);

      // Guardar archivos PDF en Google Drive y obtener sus enlaces de descarga
      const uploadedFileMap = {}; // Id o Nombre -> { downloadUrl, viewUrl, driveId }

      incomingFiles.forEach(fileObj => {
        if (!fileObj.b64 || !fileObj.name) return;
        try {
          // Limpiar prefijo data:application/pdf;base64 si viene presente
          let pureBase64 = fileObj.b64;
          if (pureBase64.indexOf("base64,") !== -1) {
            pureBase64 = pureBase64.split("base64,")[1];
          }

          const decodedBytes = Utilities.base64Decode(pureBase64);
          const blob = Utilities.newBlob(decodedBytes, "application/pdf", fileObj.name);
          const driveFile = folder.createFile(blob);
          
          // Dar permisos públicos de lectura para descarga directa
          driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          
          const fileId = driveFile.getId();
          // URL de descarga directa de Google Drive
          const downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
          const viewUrl = driveFile.getUrl();

          const info = {
            id: fileObj.id || fileId,
            driveId: fileId,
            name: fileObj.name,
            downloadUrl: downloadUrl,
            viewUrl: viewUrl,
            policy: fileObj.policy,
            insurer: fileObj.insurer
          };

          uploadedFileMap[fileObj.name] = info;
          if (fileObj.id) uploadedFileMap[fileObj.id] = info;
        } catch (uploadErr) {
          console.error("Error guardando archivo: " + fileObj.name, uploadErr);
        }
      });

      // Vincular los enlaces de descarga de Drive a los técnicos
      const updatedWorkers = incomingWorkers.map(w => {
        const copy = Object.assign({}, w);

        if (copy.documents && Array.isArray(copy.documents)) {
          copy.documents = copy.documents.map(doc => {
            const fileMatch = uploadedFileMap[doc.name] || uploadedFileMap[doc.id];
            if (fileMatch) {
              return Object.assign({}, doc, {
                downloadUrl: fileMatch.downloadUrl,
                viewUrl: fileMatch.viewUrl,
                driveId: fileMatch.driveId
              });
            }
            return doc;
          });
        }

        // Si el técnico tiene un pdfFileName o pdfId directo
        const directMatch = uploadedFileMap[copy.pdfFileName] || uploadedFileMap[copy.pdfId];
        if (directMatch) {
          copy.downloadUrl = directMatch.downloadUrl;
          copy.viewUrl = directMatch.viewUrl;
          copy.driveId = directMatch.driveId;
        }

        return copy;
      });

      // Guardar base de datos consolidada en Google Drive (JSON)
      saveDatabaseToDrive(updatedWorkers);

      // Sincronizar también con hoja de cálculo de Google Sheets para respaldo visual
      syncToGoogleSheet(updatedWorkers);

      return createJsonResponse({
        success: true,
        message: "Nómina y archivos SCTR sincronizados correctamente",
        count: updatedWorkers.length,
        workers: updatedWorkers
      });
    }

    return createJsonResponse({ success: false, error: "Acción no reconocida" });

  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

// UTILIDADES DE CARPETA Y ARCHIVOS EN GOOGLE DRIVE
function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    const f = folders.next();
    f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return f;
  }
  const newFolder = DriveApp.createFolder(folderName);
  newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return newFolder;
}

function loadDatabaseFromDrive() {
  try {
    const folder = getOrCreateFolder(FOLDER_NAME);
    const files = folder.getFilesByName(DB_FILE_NAME);
    if (files.hasNext()) {
      const file = files.next();
      const content = file.getBlob().getDataAsString();
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Error leyendo base de datos de Drive:", e);
  }
  return [];
}

function saveDatabaseToDrive(data) {
  const folder = getOrCreateFolder(FOLDER_NAME);
  const files = folder.getFilesByName(DB_FILE_NAME);
  const jsonContent = JSON.stringify(data, null, 2);

  if (files.hasNext()) {
    const file = files.next();
    file.setContent(jsonContent);
  } else {
    const newFile = folder.createFile(DB_FILE_NAME, jsonContent, MimeType.PLAIN_TEXT);
    newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
}

// SINCRONIZACIÓN CON GOOGLE SHEETS
function syncToGoogleSheet(workers) {
  try {
    const folder = getOrCreateFolder(FOLDER_NAME);
    const files = folder.getFilesByName(SHEET_NAME);
    let ss;
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create(SHEET_NAME);
      const sheetFile = DriveApp.getFileById(ss.getId());
      sheetFile.moveTo(folder);
      sheetFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    }

    let sheet = ss.getActiveSheet();
    sheet.clear();

    // Encabezados
    const headers = [
      "TIPO_DOC",
      "DOCUMENTO_DNI",
      "APELLIDOS_Y_NOMBRES",
      "CARGO_ESPECIALIDAD",
      "EMPRESA_SEDE",
      "ASEGURADORA",
      "POLIZA_SCTR",
      "VIGENCIA_DESDE",
      "VIGENCIA_HASTA",
      "ESTADO",
      "ENLACE_DESCARGA_PDF"
    ];

    const rows = [headers];
    const today = new Date().toISOString().split("T")[0];

    workers.forEach(w => {
      const isExpired = w.hasta && w.hasta < today;
      const estado = isExpired ? "VENCIDO" : "VIGENTE";
      let downloadLink = w.downloadUrl || "";
      if (!downloadLink && w.documents && w.documents.length > 0) {
        downloadLink = w.documents.map(d => d.downloadUrl || d.name).filter(Boolean).join(" | ");
      }

      rows.push([
        w.tipoDoc || (/^(?:00|\d{9,})/.test(w.dni) ? "CE" : "DNI"),
        w.dni || "",
        w.nombres || "",
        w.cargo || "TÉCNICO DE REDES",
        w.empresa || "M&D CONSTRUCCIÓN DE REDES S.A.C.",
        w.aseguradora || "",
        w.poliza || "",
        w.desde || "",
        w.hasta || "",
        estado,
        downloadLink
      ]);
    });

    if (rows.length > 0) {
      sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
      // Formato cabecera
      sheet.getRange(1, 1, 1, headers.length)
        .setBackground("#0284c7")
        .setFontColor("#ffffff")
        .setFontWeight("bold");
      sheet.autoResizeColumns(1, headers.length);
    }
  } catch (e) {
    console.warn("Error sincronizando a Google Sheet:", e);
  }
}

function clearGoogleSheet() {
  try {
    const folder = getOrCreateFolder(FOLDER_NAME);
    const files = folder.getFilesByName(SHEET_NAME);
    if (files.hasNext()) {
      const ss = SpreadsheetApp.open(files.next());
      ss.getActiveSheet().clear();
    }
  } catch (e) {}
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
