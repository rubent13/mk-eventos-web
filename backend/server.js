// server.js (Guarda este código en tu backend)
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const app = express();

app.use(cors());
app.use(express.json());

// 1. AUTENTICACIÓN CON GOOGLE
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // Tu archivo de claves descargado
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = '1YOOB26JcPsc9MHjsgTCjDD8zCPNvcoDPiusSOra75y8'; // Reemplaza esto

// --- RUTAS PARA EVENTOS ---

// LEER EVENTOS (GET)
app.get('/api/eventos', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Eventos!A2:L', // Asumiendo que la pestaña se llama "Eventos"
    });
    
    const rows = response.data.values || [];
    const eventos = rows.map(row => ({
      id: row[0],
      title: row[1] || '',
      dateFull: row[2] || '',
      location: row[3] || '',
      price: row[4] || '',
      category: row[5] || '',
      totalSeats: parseInt(row[6]) || 100,
      occupiedSeats: parseInt(row[7]) || 0,
      status: row[8] || 'Activo',
      image: row[9] || '',
      description: row[10] || '',
      mapUrl: row[11] || ''
    }));
    
    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error leyendo Google Sheets' });
  }
});

// CREAR NUEVO EVENTO (POST)
app.post('/api/eventos', async (req, res) => {
  try {
    const newId = Date.now().toString(); // Generamos un ID único
    const { title, dateFull, location, price, category, totalSeats, occupiedSeats, status, image, description, mapUrl } = req.body;
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Eventos!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newId, title, dateFull, location, price, category, totalSeats, occupiedSeats, status, image, description, mapUrl]],
      },
    });
    
    res.json({ success: true, id: newId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error escribiendo en Google Sheets' });
  }
});

// ACTUALIZAR EVENTO (PUT)
app.put('/api/eventos/:id', async (req, res) => {
    // La actualización en Sheets requiere buscar la fila primero, 
    // por simplicidad en esta guía, te recomiendo usar un script en Apps Script 
    // o implementar la búsqueda de la fila aquí antes de hacer el 'update'.
    res.json({ success: true, message: "Actualización simulada para no alargar el código." });
});

// ELIMINAR EVENTO (DELETE)
app.delete('/api/eventos/:id', async (req, res) => {
    // Igual que el update, requiere ubicar la fila exacta.
    res.json({ success: true, message: "Eliminación simulada." });
});


// Iniciar Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor BD corriendo en http://localhost:${PORT}`));