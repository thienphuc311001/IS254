import JSZip from "jszip";
import { buildMeta } from "../model/build-meta";
import type { DatasetMeta, Diamond } from "../model/types";

export interface DiamondDataset {
  records: Diamond[];
  meta: DatasetMeta;
}

const SHEET_NAME = "data_ready";

/** Concatenate all <t> text nodes under an element (handles rich-text runs). */
function textOf(parent: Element): string {
  let text = "";
  for (const t of Array.from(parent.getElementsByTagName("t"))) text += t.textContent;
  return text;
}

const colLetter = (ref: string): string => (ref.match(/^[A-Z]+/) || [""])[0];
const colIndex = (letters: string): number =>
  letters.split("").reduce((a, c) => a * 26 + (c.charCodeAt(0) - 64), 0) - 1;

/** Read a cell's value using the shared-string table when needed. */
function cellValue(cell: Element, shared: string[]): string | null {
  const type = cell.getAttribute("t");
  const inline = cell.querySelector("is");
  const vEl = cell.querySelector("v");
  if (type === "inlineStr" && inline) return textOf(inline);
  if (type === "s" && vEl) return shared[+vEl.textContent!] ?? "";
  if (vEl) return vEl.textContent;
  return null;
}

/**
 * Parse the bytes of data_ready.xlsx into typed records.
 * Uses JSZip to unzip and DOMParser to read the sheet XML, so it runs in the browser
 * (and in jsdom for tests) without a heavyweight spreadsheet library.
 */
export async function parseDiamondXlsx(bytes: Uint8Array): Promise<DiamondDataset> {
  if (!(bytes && bytes.length > 0)) throw new Error("Dữ liệu xlsx rỗng hoặc không hợp lệ");
  const zip = await JSZip.loadAsync(bytes);
  const parser = new DOMParser();

  // ---- sharedStrings.xml ----
  const shared: string[] = [];
  const ssFile = zip.file("xl/sharedStrings.xml");
  if (ssFile) {
    const doc = parser.parseFromString(await ssFile.async("string"), "application/xml");
    for (const si of Array.from(doc.getElementsByTagName("si"))) shared.push(textOf(si));
  }

  // ---- locate the "data_ready" sheet via workbook.xml (fallback: first sheet) ----
  const wbFile = zip.file("xl/workbook.xml");
  if (!wbFile) throw new Error("Không tìm thấy xl/workbook.xml");
  const wbDoc = parser.parseFromString(await wbFile.async("string"), "application/xml");
  let targetIdx = -1;
  for (const sh of Array.from(wbDoc.getElementsByTagName("sheet"))) {
    if ((sh.getAttribute("name") || "").trim() === SHEET_NAME) {
      targetIdx = parseInt(sh.getAttribute("sheetId") || "1", 10) - 1;
      break;
    }
  }
  const sheetPath = "xl/worksheets/sheet" + (targetIdx >= 0 ? targetIdx + 1 : 1) + ".xml";
  const sheetFile = zip.file(sheetPath);
  if (!sheetFile) throw new Error("Không tìm thấy sheet dữ liệu: " + sheetPath);
  const doc = parser.parseFromString(await sheetFile.async("string"), "application/xml");

  const rowsXml = Array.from(doc.getElementsByTagName("row"));
  if (rowsXml.length < 2) return { records: [], meta: buildMeta([]) };

  // ---- header row → column index map ----
  const header = Array.from(rowsXml[0].getElementsByTagName("c")).map(
    (c) => cellValue(c, shared) ?? "",
  );
  const col: Record<string, number> = {};
  header.forEach((name, i) => (col[name] = i));

  const num = (v: string | null): number | null => (v == null ? null : Number(v));
  const str = (v: string | null): string => v || "";

  const records: Diamond[] = [];
  for (let ri = 1; ri < rowsXml.length; ri++) {
    const vals: (string | null)[] = new Array(header.length).fill(null);
    for (const c of Array.from(rowsXml[ri].getElementsByTagName("c"))) {
      const idx = colIndex(colLetter(c.getAttribute("r") || ""));
      if (idx < 0 || idx >= header.length) continue;
      vals[idx] = cellValue(c, shared);
    }
    const stt = vals[col["STT"]];
    if (stt == null || stt === "") continue;

    records.push({
      origin: num(vals[col["is_natural"]]) === 1 ? "natural" : "lgd",
      store: str(vals[col["store"]]),
      shape: str(vals[col["shape"]]),
      carat: num(vals[col["carat"]]) ?? 0,
      color: str(vals[col["color_raw"]]),
      clarity: str(vals[col["clarity_raw"]]),
      cut: str(vals[col["cut_raw"]]),
      cert: str(vals[col["cert_raw"]]),
      price: num(vals[col["price_vnd"]]) ?? 0,
      resale: num(vals[col["resale_rate"]]),
      link: str(vals[col["product_link"]]),
      colorCode: num(vals[col["color_code"]]),
      clarityCode: num(vals[col["clarity_code"]]),
      cutCode: num(vals[col["cut_code"]]),
      certCode: num(vals[col["cert_code"]]),
    });
  }

  return { records, meta: buildMeta(records) };
}

/** Fetch data_ready.xlsx from `url` (default: /public) and parse it. */
export async function loadDiamondData(url = "/data_ready.xlsx"): Promise<DiamondDataset> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Không đọc được " + url + " (HTTP " + res.status + ")");
  const buf = await res.arrayBuffer();
  return parseDiamondXlsx(new Uint8Array(buf));
}
