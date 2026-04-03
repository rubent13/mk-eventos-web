// --- UTILS ---
// Utilidad para formatear automáticamente URLs de Google Drive a enlaces de visualización directa
export const formatImageUrl = (url) => {
  if (!url) return '';
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      const directUrl = `https://drive.google.com/uc?id=${match[1]}`;
      console.log('Original URL:', url);
      console.log('Formatted URL:', directUrl);
      return directUrl;
    }
  }
  return url;
};