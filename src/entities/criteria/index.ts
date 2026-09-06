export type { Criteria, Purpose, Weights } from "./model/types";
export { PURPOSE, PURPOSE_LABEL, PURPOSE_ORDER, PRESETS, DEFAULT_CRITERIA } from "./model/presets";
/** Test fixture (tree-shaken from the production bundle when unused). */
export { makeCriteria } from "./model/fixtures";
