import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import playwright from "eslint-plugin-playwright";

export default tseslint.config(
  {
    ignores: ["dist/**", "dist-server/**", "node_modules/**", "coverage/**", "test-results/**", "playwright-report/**"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    }
  },
  // Playwright-specific config for test files
  {
    files: ["tests/**/*.spec.ts", "tests/**/*.page.ts", "tests/**/*.fixture.ts"],
    ...playwright.configs["flat/recommended"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // POM method-call patterns (loginPage.heading()) confuse this rule
      "playwright/expect-expect": "off",
    }
  }
);
