// ============================================
// COPIA ESTE CÓDIGO EN TU GOOGLE APPS SCRIPT
// ============================================

const SPREADSHEET_ID = '1YOOB26JcPsc9MHjsgTCjDD8zCPNvcoDPiusSOra75y8';

// Función para procesar solicitudes GET
function doGet(e) {
  const type = e.parameter.type || 'eventos';
  const action = e.parameter.action;
  const id = e.parameter.id;
  
  let sheetName = 'Eventos';
  if (type === 'cursos') sheetName = 'Cursos';
  if (type === 'carrusel') sheetName = 'Carrusel';
  if (type === 'publicidad') sheetName = 'Publicidad';

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return jsonResponse([]);
    }

    // Acción de eliminar
    if (action === 'delete' && id) {
      deleteRowById(sheet, id);
      return jsonResponse({ success: true });
    }
    
    // Acción de cambiar status
    if (action === 'status' && id && e.postData) {
      const data = JSON.parse(e.postData.contents);
      updateStatusById(sheet, id, data.status);
      return jsonResponse({ success: true });
    }
    
    // Leer todos los datos
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return jsonResponse([]);
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const jsonArray = rows.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });
    
    return jsonResponse(jsonArray);
    
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

// Función para procesar solicitudes POST (Guardar datos)
function doPost(e) {
  const type = e.parameter.type || 'eventos';
  const action = e.parameter.action;
  const idToModify = e.parameter.id;
  
  let sheetName = 'Eventos';
  if (type === 'cursos') sheetName = 'Cursos';
  if (type === 'carrusel') sheetName = 'Carrusel';
  if (type === 'publicidad') sheetName = 'Publicidad';

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    
    // Eliminar
    if (action === 'delete' && idToModify) {
      deleteRowById(sheet, idToModify);
      return jsonResponse({ success: true });
    }
    
    // Cambiar status
    if (action === 'status' && idToModify && e.postData) {
      const data = JSON.parse(e.postData.contents);
      updateStatusById(sheet, idToModify, data.status);
      return jsonResponse({ success: true });
    }
    
    // Guardar nuevo registro
    const postData = JSON.parse(e.postData.contents);
    const id = postData.id || Date.now().toString();

    if (type === 'eventos') {
      sheet.appendRow([
        id, postData.title || '', postData.dateFull || '', postData.location || '', postData.price || '', 
        postData.category || 'Congreso', postData.totalSeats || 100, postData.occupiedSeats || 0, postData.status || 'Activo', 
        postData.image || '', postData.description || '', postData.mapUrl || '', postData.month || '', postData.day || ''
      ]);
    } 
    else if (type === 'cursos') {
      sheet.appendRow([
        id, postData.title || '', postData.duration || '', postData.modality || '', postData.price || '', 
        postData.certification || '', postData.status || 'Activo', postData.image || ''
      ]);
    }
    else if (type === 'carrusel') {
      sheet.appendRow([
        id, postData.title || '', postData.subtitle || '', postData.buttonText || '', postData.status || 'Activo', postData.image || ''
      ]);
    }
    else if (type === 'publicidad') {
      sheet.appendRow([
        id, postData.title || '', postData.position || 'Cintillo Superior', postData.btnText || '', 
        postData.link || '#', postData.bgColor || '#0f172a', postData.textColor || '#ffffff', 
        postData.btnColor || '#06b6d4', postData.status || 'Activo'
      ]);
    }
    
    return jsonResponse({ success: true, id: id });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() });
  }
}

// Función auxiliar para responder JSON
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Eliminar fila por ID
function deleteRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// Actualizar status por ID
function updateStatusById(sheet, id, newStatus) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const statusColIndex = headers.indexOf('status');
  
  if (statusColIndex === -1) return;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.getRange(i + 1, statusColIndex + 1).setValue(newStatus);
      return;
    }
  }
}
