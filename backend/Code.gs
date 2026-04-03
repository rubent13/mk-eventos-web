// ============================================
// GOOGLE APPS SCRIPT - MEDICAL KNOWLEDGE
// ============================================
// Usa este código en tu proyecto de Google Apps Script
// SPREADSHEET_ID ya está configurado

const SPREADSHEET_ID = '1YOOB26JcPsc9MHjsgTCjDD8zCPNvcoDPiusSOra75y8';

// Función para procesar solicitudes GET (Leer datos)
function doGet(e) {
  const type = e.parameter.type || 'eventos';
  const action = e.parameter.action;
  const id = e.parameter.id;
  
  let sheetName = 'Eventos';
  if (type === 'cursos') sheetName = 'Cursos';
  if (type === 'carrusel') sheetName = 'Carrusel';
  if (type === 'publicidad') sheetName = 'Publicidad';

  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(sheetName);
    
    if (!sheet) {
      return jsonResponse([]);
    }

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

// Función para procesar solicitudes POST (Guardar, Editar, Borrar, Cambiar Status)
function doPost(e) {
  const type = e.parameter.type || 'Entiendo el problema. Tu script de Google Apps Script no maneja todas las acciones que el admin necesita. Voy a actualizar el script para que funcione correctamente:

<create_file>
<absolute_path>
c:/Users/Admin/medical-knowledge/backend/Code.gs
</absolute_path>
<content>
// --- CÓDIGO ACTUALIZADO PARA GOOGLE APPS SCRIPT ---
// Copia este código en tu proyecto de Apps Script

const SPREADSHEET_ID = '1YOOB26JcPsc9MHjsgTCjDD8zCPNvcoDPiusSOra75y8';

// Función para procesar solicitudes GET (Leer datos)
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

    // Si es acción de eliminar
    if (action === 'delete' && id) {
      deleteRowById(sheet, id);
      return jsonResponse({ success: true, message: "Eliminado" });
    }
    
    // Si es acción de cambiar status
    if (action === 'status' && id) {
      const data = JSON.parse(e.postData.contents);
      updateStatusById(sheet, id, data.status);
      return jsonResponse({ success: true, message: "Status actualizado" });
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
    
    // Si es una acción de borrar
    if (action === 'delete' && idToModify) {
      deleteRowById(sheet, idToModify);
      return jsonResponse({ success: true, message: "Eliminado" });
    }
    
    // Si es acción de cambiar status
    if (action === 'status' && idToModify) {
      const data = JSON.parse(e.postData.contents);
      updateStatusById(sheet, idToModify, data.status);
      return jsonResponse({ success: true, message: "Status actualizado" });
    }
    
    // Leer el contenido enviado
    const postData = JSON.parse(e.postData.contents);
    const id = postData.id || Date.now().toString();

    // Guardar según el tipo
    if (type === 'eventos' || type === 'Eventos') {
      sheet.appendRow([
        id, postData.title, postData.dateFull, postData.location, postData.price, 
        postData.category, postData.totalSeats || 100, postData.occupiedSeats || 0, postData.status || 'Activo', 
        postData.image || '', postData.description || '', postData.mapUrl || '', postData.month || '', postData.day || ''
      ]);
    } 
    else if (type === 'cursos') {
      sheet.appendRow([
        id, postData.title, postData.duration || '', postData.modality || '', postData.price || '', 
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

// Función auxiliar para responder en JSON
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Función para eliminar una fila por ID
function deleteRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString() === id.toString()) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// Función para actualizar el status por ID
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
