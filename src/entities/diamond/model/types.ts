export type DiamondOrigin = "natural" | "lgd";

/** One row of data_ready.xlsx after parsing. */
export interface Diamond {
  origin: DiamondOrigin;
  store: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  cert: string;
  price: number;
  /** Resale retention rate, e.g. 0.9 = keeps 90% of value. */
  resale: number | null;
  link: string;
  colorCode: number | null;
  clarityCode: number | null;
  cutCode: number | null;
  certCode: number | null;
}

/** A grade label (e.g. "F") together with its numeric code, sorted best → worst. */
export interface GradeOption {
  grade: string;
  code: number;
}

/** Statistics derived from the dataset. Nothing here is hard-coded. */
export interface DatasetMeta {
  total: number;
  natural: number;
  lgd: number;
  stores: number;
  storeList: string[];
  minPrice: number;
  maxPrice: number;
  minCarat: number;
  maxCarat: number;
  avgResale: Record<DiamondOrigin, number>;
  colorGrades: GradeOption[];
  clarityGrades: GradeOption[];
}
