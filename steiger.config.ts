import { defineConfig } from "steiger";
import fsd from "@feature-sliced/steiger-plugin";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // Single-page app: every widget and feature is used exactly once, by the one page.
      // Also, Next.js forces the FSD "pages" layer to be named "views" (a root-level
      // src/pages would be picked up as the Pages Router), and steiger does not count
      // references coming from that folder. Splitting the page into slices is still the
      // right call for readability, so this rule is disabled.
      "fsd/insignificant-slice": "off",
    },
  },
  {
    files: ["./src/entities/**"],
    rules: {
      // "criteria" is used as an uncountable noun (the user's set of criteria), matching
      // the course report's terminology ("tiêu chí"); it is not a plural of "criterion".
      "fsd/inconsistent-naming": "off",
    },
  },
]);
