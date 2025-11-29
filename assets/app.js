import { Api } from './api.js';

/**
 * App utilitario para páginas de herramientas.
 * Conecta formularios HTML con métodos del Api y maneja UI básica.
 */
export const App = {
  /**
   * Inicializa una página de herramienta.
   * Requiere un formulario con id="toolForm" y atributo data-action con el nombre del método en Api.
   * Ej: data-action="compressPDF"
   */
  init(){
    const form = document.getElementById('toolForm');
    if(!form) return;
    const action = form.dataset.action;
    const result = document.getElementById('result');
    const bar = document.getElementById('bar');

    const setProgress = (pct) => { if(bar) bar.style.width = pct + '%'; };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if(!Api[action]){ alert('Acción no soportada: ' + action); return; }

      // Recolectar inputs
      const fd = new FormData(form);
      const files = form.querySelector('[name="files"]')?.files;
      const file = form.querySelector('[name="file"]')?.files?.[0];

      try{
        setProgress(10);
        let resp;
        switch(action){
          case 'compressPDF':{
            resp = await Api.compressPDF(file, fd.get('quality')||'medium');
            break;
          }
          case 'mergePDF':{
            resp = await Api.mergePDF(files);
            break;
          }
          case 'splitPDF':{
            resp = await Api.splitPDF(file, fd.get('ranges'));
            break;
          }
          case 'rotatePDF':{
            resp = await Api.rotatePDF(file, Number(fd.get('degrees')||90), fd.get('pages')||'all');
            break;
          }
          case 'deletePages':{
            resp = await Api.deletePages(file, fd.get('pages'));
            break;
          }
          case 'editPDF':{
            resp = await Api.editPDF(file, fd.get('instructions')||'');
            break;
          }
          case 'annotatePDF':{
            resp = await Api.annotatePDF(file, fd.get('annotations')||'[]');
            break;
          }
          case 'viewPDF':{
            resp = await Api.viewPDF(file);
            break;
          }
          case 'pdfToWord':{
            resp = await Api.pdfToWord(file);
            break;
          }
          case 'pdfToImages':{
            resp = await Api.pdfToImages(file, fd.get('format')||'jpg');
            break;
          }
          case 'wordToPDF':{
            resp = await Api.wordToPDF(file);
            break;
          }
          case 'imagesToPDF':{
            resp = await Api.imagesToPDF(files);
            break;
          }
          case 'signPDF':{
            resp = await Api.signPDF(file, fd.get('signature')||'{}');
            break;
          }
          case 'requestSignatures':{
            resp = await Api.requestSignatures(file, fd.get('recipients')||'[]');
            break;
          }
          default:
            alert('Acción no implementada: ' + action);
            return;
        }
        setProgress(90);
        App.renderResult(result, resp);
        setProgress(100);
      }catch(err){
        console.error(err);
        if(result){
          result.innerHTML = `<div class="alert">${err.message || 'Error'}</div>`;
        } else {
          alert(err.message || 'Error');
        }
        setProgress(0);
      }
    });
  },

  /** Renderiza la respuesta básica */
  renderResult(container, resp){
    if(!container) return;
    const parts = [];
    parts.push(`<pre style="white-space:pre-wrap">${App.escape(JSON.stringify(resp, null, 2))}</pre>`);
    if(resp?.url){
      parts.unshift(`<a class="btn" href="${resp.url}" target="_blank" rel="noopener">Descargar resultado</a>`);
    }
    container.innerHTML = parts.join('\n');
  },

  escape(s){
    return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
