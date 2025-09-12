import { defineConfig } from "eslint/config";
import angular from "@angular-eslint/eslint-plugin";
import angularTemplate from "@angular-eslint/eslint-plugin-template";
import angularTemplateParser from "@angular-eslint/template-parser";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default defineConfig([
  {
    ignores: ["projects/**/*", "dist/**/*", "node_modules/**/*", "coverage/**/*"]
  },
  {
    files: ["**/*.ts"],
    name: "angular-typescript",
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: ["./tsconfig.json", "./e2e/tsconfig.json"],
        createDefaultProgram: true,
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      "@angular-eslint": angular,
      "@typescript-eslint": tseslint
    },
    rules: {
      ...angular.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
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
    name: "angular-template",
    languageOptions: {
      parser: angularTemplateParser
    },
    plugins: {
      "@angular-eslint/template": angularTemplate
    },
    rules: {
      ...angularTemplate.configs.recommended.rules
    }
  }
]);


