import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    languageOptions: {
      parserOptions: {
        project: true,
      },
    },
    // ESLint
    rules: {},
    ignores: ["src/generated", "tsconfig.json"],
  },
  // TypeScript
  {
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
    },
  },
  // Stylistic
  {
    rules: {},
  },
);
