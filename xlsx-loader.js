/* xlsx-loader.js — nạp data_ready.xlsx trực tiếp lúc chạy (không cần build lại).
 * Dùng JSZip để giải nén .xlsx và tự phân tích sheet "data_ready".
 * Chạy tốt qua file:// vì chỉ fetch file cục bộ trong cùng thư mục.
 */
async function loadDiamondData(xlsxPath) {
  const res = await fetch(xlsxPath);
  if (!res.ok) throw new Error('Không đọc được ' + xlsxPath + ' (HTTP ' + res.status + ')');
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (!(bytes && bytes.length > 0)) throw new Error('Dữ liệu xlsx rỗng hoặc không hợp lệ');
  const zip = await JSZip.loadAsync(bytes);

  // ---- Đọc sharedStrings.xml (chuỗi dùng chung) ----
  const shared = [];
  const ssFile = zip.file('xl/sharedStrings.xml');
  if (ssFile) {
    const xml = await ssFile.async('string');
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    for (const si of doc.getElementsByTagName('si')) {
      let text = '';
      for (const t of si.getElementsByTagName('t')) text += t.textContent;
      shared.push(text);
    }
  }

  // ---- Tìm đúng sheet tên "data_ready" qua workbook.xml ----
  const wbXml = await zip.file('xl/workbook.xml').async('string');
  const wbDoc = new DOMParser().parseFromString(wbXml, 'application/xml');
  let targetIdx = -1;
  for (const sh of wbDoc.getElementsByTagName('sheet')) {
    if ((sh.getAttribute('name') || '').trim() === 'data_ready') {
      targetIdx = parseInt(sh.getAttribute('sheetId'), 10) - 1;
      break;
    }
  }
  // fallback: sheet đầu tiên nếu không tìm thấy
  const sheetPath = 'xl/worksheets/sheet' + (targetIdx >= 0 ? targetIdx + 1 : 1) + '.xml';
  const sheetFile = zip.file(sheetPath);
  if (!sheetFile) throw new Error('Không tìm thấy sheet dữ liệu: ' + sheetPath);
  const sheetXml = await sheetFile.async('string');
  const doc = new DOMParser().parseFromString(sheetXml, 'application/xml');

  const colLetter = ref => (ref.match(/^[A-Z]+/) || [''])[0];
  const colIndex = letters => letters.split('').reduce((a,c)=>a*26 + (c.charCodeAt(0)-64), 0) - 1;

  const rowsXml = [...doc.getElementsByTagName('row')];
  if (rowsXml.length < 2) { DATA = []; META = {total:0, natural:0, lgd:0, stores:0}; return; }

  // Header
  const headerCells = [...rowsXml[0].getElementsByTagName('c')];
  const header = headerCells.map(c => {
    const t = c.getAttribute('t');
    const inline = c.querySelector('is');
    if (t === 'inlineStr' && inline) {
      let text = '';
      for (const tn of inline.getElementsByTagName('t')) text += tn.textContent;
      return text;
    }
    const vEl = c.querySelector('v');
    const raw = vEl ? vEl.textContent : '';
    return t === 's' ? shared[+raw] ?? '' : raw;
  });
  const col = {};
  header.forEach((name, i) => col[name] = i);

  const num = d => d == null ? null : Number(d);
  const records = [];
  for (let ri = 1; ri < rowsXml.length; ri++) {
    const cells = [...rowsXml[ri].getElementsByTagName('c')];
    const vals = new Array(header.length).fill(null);
    for (const c of cells) {
      const idx = colIndex(colLetter(c.getAttribute('r')));
      if (idx < 0 || idx >= header.length) continue;
      const type = c.getAttribute('t');
      const inline = c.querySelector('is');
      const vEl = c.querySelector('v');
      if (type === 'inlineStr' && inline) {
        let text=''; for (const t of inline.getElementsByTagName('t')) text += t.textContent;
        vals[idx] = text;
      } else if (type === 's' && vEl) {
        vals[idx] = shared[+vEl.textContent] ?? '';
      } else if (vEl) {
        vals[idx] = vEl.textContent;
      }
    }
    if (vals[col['STT']] == null || vals[col['STT']] === '') continue;
    records.push({
      origin: num(vals[col['is_natural']]) === 1 ? 'natural' : 'lgd',
      store: vals[col['store']] || '',
      shape: vals[col['shape']] || '',
      carat: num(vals[col['carat']]),
      color: vals[col['color_raw']] || '',
      clarity: vals[col['clarity_raw']] || '',
      cut: vals[col['cut_raw']] || '',
      cert: vals[col['cert_raw']] || '',
      price: num(vals[col['price_vnd']]),
      resale: num(vals[col['resale_rate']]),
      link: vals[col['product_link']] || '',
      colorCode: num(vals[col['color_code']]),
      clarityCode: num(vals[col['clarity_code']]),
      cutCode: num(vals[col['cut_code']]),
      certCode: num(vals[col['cert_code']]),
    });
  }

  DATA = records;
  META = {
    total: records.length,
    natural: records.filter(r => r.origin === 'natural').length,
    lgd: records.filter(r => r.origin === 'lgd').length,
    stores: new Set(records.map(r => r.store)).size,
  };
}

function updateMasthead() {
  if (typeof META === 'undefined') return;
  document.getElementById('statTotal').textContent = META.total;
  document.getElementById('statStores').textContent = META.stores;
  document.getElementById('statNatural').textContent = META.natural;
  document.getElementById('statLgd').textContent = META.lgd;
}
