const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const multer = require('multer'); // Para manejar subida de imágenes
const app = express();

app.use(cors());
app.use(express.json());

// 1. CONFIGURACIÓN DE GOOGLE SHEETS Y DRIVE
// Debes descargar tu archivo credentials.json desde Google Cloud Console
const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json', // Tu archivo de claves de Google
  scopes: [
    '[https://www.googleapis.com/auth/spreadsheets](https://www.googleapis.com/auth/spreadsheets)',
    '[https://www.googleapis.com/auth/drive.file](https://www.googleapis.com/auth/drive.file)'
  ],
});

const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });
const SPREADSHEET_ID = 'AQUI_PONES_EL_ID_DE_TU_GOOGLE_SHEET'; // El ID largo de la URL de tu Excel

// 2. RUTA PARA LEER EVENTOS (Usada por la Página Principal y Admin)
app.get('/api/eventos', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Eventos!A2:H', // Lee desde la fila 2 (evita los títulos)
    });
    
    const rows = response.data.values || [];
    // Convertimos las filas del Excel a objetos JSON para React
    const eventos = rows.map((row, index) => ({
      id: index,
      title: row[0],
      dateFull: row[1],
      location: row[2],
      price: row[3],
      category: row[4],
      totalSeats: row[5],
      occupiedSeats: row[6],
      image: row[7] // URL de la imagen en Google Drive
    }));
    
    res.json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Error leyendo Google Sheets' });
  }
});

// 3. RUTA PARA GUARDAR UN NUEVO EVENTO (Usada por el Panel Admin)
app.post('/api/eventos', async (req, res) => {
  try {
    const { title, dateFull, location, price, category, totalSeats, occupiedSeats, image } = req.body;
    
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Eventos!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[title, dateFull, location, price, category, totalSeats, occupiedSeats, image]],
      },
    });
    
    res.json({ success: true, message: 'Evento guardado en Google Sheets' });
  } catch (error) {
    res.status(500).json({ error: 'Error escribiendo en Google Sheets' });
  }
});

// Iniciar Servidor
app.listen(5000, () => console.log('Servidor BD conectado a Google en el puerto 5000'));
