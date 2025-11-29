/**
 * API de Turtle Conver
 * Define las funciones que el backend debe exponer. Tú implementas estas rutas en tu API.
 * Todas retornan JSON con la forma { ok: boolean, url?: string, data?: any, message?: string }
 * Donde `url` es un enlace temporal de descarga del archivo resultante (si aplica).
 *
 * Configura `API_BASE` al dominio/puerto de tu servidor.
 * Usa `multipart/form-data` para cargas de archivos.
 *
 * Ejemplo de implementación backend esperada para `compressPDF`:
 *   POST /api/pdf/compress
 *   FormData: { file: <pdf>, quality?: 'high'|'medium'|'low' }
 */

export const API_BASE = 'http://localhost:3000'; // Cambia esto a tu servidor

/**
 * Ejecuta una petición fetch con soporte para archivos.
 * @param {string} path - Ruta relativa del endpoint (e.g. '/api/pdf/compress')
 * @param {FormData} formData - Datos a enviar (incluye archivos y opciones)
 * @returns {Promise<any>} JSON de respuesta
 */
async function postForm(path, formData){
  const res = await fetch(API_BASE + path, { method: 'POST', body: formData });
  if(!res.ok){
    const text = await res.text().catch(()=> '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const Api = {
  /**
   * Login
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ok:boolean, token?:string, user?:{id:number,username:string,role:string}}>} 
   */
  async login(username, password){
    const res = await fetch(API_BASE + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if(!res.ok) throw new Error(await res.text());
    return res.json();
  },

  /** Usuarios CRUD (requiere Bearer token) */
  users: {
    async list(token){
      const r = await fetch(API_BASE + '/api/users', { headers: { Authorization: 'Bearer ' + token } });
      if(!r.ok) throw new Error(await r.text());
      return r.json();
    },
    async create(token, body){
      const r = await fetch(API_BASE + '/api/users', { method:'POST', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(body) });
      if(!r.ok) throw new Error(await r.text());
      return r.json();
    },
    async update(token, id, body){
      const r = await fetch(API_BASE + '/api/users/' + id, { method:'PUT', headers: { 'Content-Type':'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(body) });
      if(!r.ok) throw new Error(await r.text());
      return r.json();
    },
    async remove(token, id){
      const r = await fetch(API_BASE + '/api/users/' + id, { method:'DELETE', headers: { Authorization: 'Bearer ' + token } });
      if(!r.ok) throw new Error(await r.text());
      return r.json();
    },
  },
  /**
   * Comprimir PDF
   * @param {File} file - PDF de entrada
   * @param {'high'|'medium'|'low'} [quality='medium']
   */
  async compressPDF(file, quality='medium'){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('quality', quality);
    return postForm('/api/pdf/compress', fd);
  },

  /** Unir PDFs */
  async mergePDF(files){
    const fd = new FormData();
    (files||[]).forEach(f => fd.append('files', f));
    return postForm('/api/pdf/merge', fd);
  },

  /** Dividir PDF en rangos */
  async splitPDF(file, ranges){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('ranges', ranges); // Ej: "1-3,5,8-10"
    return postForm('/api/pdf/split', fd);
  },

  /** Girar páginas */
  async rotatePDF(file, degrees=90, pages='all'){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('degrees', String(degrees));
    fd.append('pages', pages); // 'all' o "1,2,5"
    return postForm('/api/pdf/rotate', fd);
  },

  /** Eliminar páginas */
  async deletePages(file, pages){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('pages', pages); // "2,4,7"
    return postForm('/api/pdf/delete-pages', fd);
  },

  /** Editar PDF (texto simple) */
  async editPDF(file, instructions){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('instructions', instructions);
    return postForm('/api/pdf/edit', fd);
  },

  /** Anotar PDF */
  async annotatePDF(file, annotationsJson){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('annotations', annotationsJson); // JSON con anotaciones
    return postForm('/api/pdf/annotate', fd);
  },

  /** Lector de PDF (puede devolver una URL para visualizar) */
  async viewPDF(file){
    const fd = new FormData();
    fd.append('file', file);
    return postForm('/api/pdf/view', fd);
  },

  /** PDF a Word */
  async pdfToWord(file){
    const fd = new FormData();
    fd.append('file', file);
    return postForm('/api/convert/pdf-to-word', fd);
  },

  /** PDF a Imágenes */
  async pdfToImages(file, format='jpg'){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('format', format); // 'jpg' | 'png'
    return postForm('/api/convert/pdf-to-images', fd);
  },

  /** Word a PDF */
  async wordToPDF(file){
    const fd = new FormData();
    fd.append('file', file);
    return postForm('/api/convert/word-to-pdf', fd);
  },

  /** Imágenes a PDF */
  async imagesToPDF(files){
    const fd = new FormData();
    (files||[]).forEach(f => fd.append('files', f));
    return postForm('/api/convert/images-to-pdf', fd);
  },

  /** Firmar PDF */
  async signPDF(file, signatureJson){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('signature', signatureJson); // datos de firma (posicion, pagina, etc)
    return postForm('/api/pdf/sign', fd);
  },

  /** Solicitar firmas */
  async requestSignatures(file, recipientsJson){
    const fd = new FormData();
    fd.append('file', file);
    fd.append('recipients', recipientsJson); // emails, roles
    return postForm('/api/pdf/request-signatures', fd);
  },
};
