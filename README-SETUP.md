# Manual de Configuración - Medical Knowledge

## Problema: No se guarda nada en Google Sheets

El problema más común es que el Google Apps Script no está correctamente configurado o deployado. Sigue estos pasos:

---

## PASOS PARA CONFIGURAR GOOGLE APPS SCRIPT

### 1. Preparar Google Sheets
Crea una hoja de cálculo llamada **"Base de Datos"** con estas pestañas y encabezados EXACTOS:

**Pestaña: Eventos** (Fila 1, columna A a N)
```
id | title | dateFull | location | price | category | totalSeats | occupiedSeats | status | image | description | mapUrl | month | day
```

**Pestaña: Cursos** (Fila 1, columna A a H)
```
id | title | duration | modality | price | certification | status | image
```

**Pestaña: Carrusel** (Fila 1, columna A a F)
```
id | title | subtitle | buttonText | status | image
```

**Pestaña: Publicidad** (Fila 1, columna A a I)
```
id | title | position | btnText | link | bgColor | textColor | btnColor | status
```

### 2. Crear Google Apps Script
1. Ve a [script.google.com](https://script.google.com)
2. Crea un nuevo proyecto en blanco
3. Copia el contenido del archivo `backend/Code.gs` y pégalo en el editor
4. **IMPORTANTE**: El script usa `SpreadsheetApp.getActiveSpreadsheet()`, lo que significa que **debes abrir el Apps Script mientras tienes abierta la hoja de cálculo "Base de Datos"** en otra pestaña.

### 3. Deployar como Web App
1. En el editor de Apps Script, haz clic en **"Deployar"** (Deploy) > **"Nueva implementación"** (New deployment)
2. Selecciona **"Web app"** como tipo
3. Configura:
   - **Descripción**: Medical Knowledge API
   - **Executar como**: Yo
   - **Quién tiene acceso**: **Cualquier persona** (Anyone)
4. Haz clic en **"Deployar"** (Deploy)
5. Copia la **URL del Web App**

### 4. Actualizar el código
1. Abre `src/AdminPanel.jsx`
2. Busca la línea con `const SCRIPT_URL = "..."`
3. Reemplaza la URL con la que copiaste
4. Haz lo mismo en `src/App.jsx`

---

## PRUEBA DE CONEXIÓN

Para verificar que funciona, copia esta URL en tu navegador (reemplaza con tu URL):
```
https://script.google.com/macros/s/TU-ID-AQUI/exec?type=eventos
```

Debería mostrar un JSON con los eventos (o `[]` si está vacío).

---

## SOLUCIÓN DE PROBLEMAS

### Error: "Hoja no encontrada"
- Verifica que la hoja se llame exactamente **"Base de Datos"**
- Las pestañas deben llamarse: **Eventos**, **Cursos**, **Carrusel**, **Publicidad**

### Error: "Access denied"
- Verifica que el Web App tenga acceso a "Cualquier persona"
- Vuelve a deployar si es necesario

### No guarda nada
- Abre la consola del navegador (F12 > Console) para ver errores
- Verifica que la URL sea correcta
- Confirma que tienes datos en la primera fila (encabezados)

---

## NOTA SOBRE IMÁGENES

La subida de imágenes a Google Drive requiere configuración adicional. Por ahora, puedes:
1. Usar URLs de imágenes externas (imgur, unsplash, etc.)
2. O configurar la subida a Drive modificando el código del Apps Script

