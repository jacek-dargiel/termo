import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";

export default tseslint.config(
  {
    ignores: ["projects/**/*", "dist/**/*", "node_modules/**/*", "coverage/**/*"]
  },
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/component-selector": [
        "error",
        {
          prefix: "termo",
          style: "kebab-case",
          type: "element"
        }
      ],
      "@angular-eslint/directive-selector": [
        "error",
        {
          prefix: "termo",
          style: "camelCase",
          type: "attribute"
        }
      ]
    }
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
    ],
    rules: {}
  }
);
