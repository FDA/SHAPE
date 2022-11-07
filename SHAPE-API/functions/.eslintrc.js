module.exports = {
   root: true,
   env: {
      es6: true,
      node: true,
   },
   ignorePatterns: ["**/*.js"], //  <- ignore js files (tests, compiled js and configs)
   parser: "@typescript-eslint/parser",
   parserOptions: {
      project: "tsconfig.json",
      tsconfigRootDir: __dirname,
      sourceType: "module",
   },
   extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
      "plugin:import/typescript",
   ],
   plugins: [
      "@typescript-eslint",
      "import",
   ],
   rules: {
      "@typescript-eslint/no-explicit-any": "off", // allows use of any type
      "@typescript-eslint/no-non-null-assertion": "off", // allows non-null assertion (example: data!.org)
      "@typescript-eslint/explicit-module-boundary-types": "off", // allows use of any type
      "@typescript-eslint/ban-ts-comment": "off",  // allows @ts-ignore 
      "@typescript-eslint/adjacent-overload-signatures": "error",
      "@typescript-eslint/no-empty-function": "error",
      "@typescript-eslint/no-empty-interface": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-namespace": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/prefer-for-of": "warn",
      "@typescript-eslint/triple-slash-reference": "error",
      "@typescript-eslint/unified-signatures": "warn",
      "import/no-deprecated": "warn",
      "import/no-extraneous-dependencies": "error",
      "import/no-unassigned-import": "warn",
      "import/no-unresolved": [    // ignoring errors related to firebase-admin package import
         "error",
         { 
            "ignore": ["firebase-admin"] 
         },
      ],
      "constructor-super": "error",
      "eqeqeq": ["warn", "always"],
      "no-cond-assign": "error",
      "no-duplicate-case": "error",
      "no-duplicate-imports": "error",
      "no-empty": [
         "error",
         {
            "allowEmptyCatch": true,
         },
      ],
      "no-invalid-this": "error",
      "no-new-wrappers": "error",
      "no-param-reassign": "error",
      "no-redeclare": "error",
      "no-sequences": "error",
      "no-shadow": [
         "error",
         {
            "hoist": "all",
         },
      ],
      "no-throw-literal": "error",
      "no-unsafe-finally": "error",
      "no-unused-labels": "error",
      "no-var": "warn",
      "no-void": "error",
      "prefer-const": "warn",
   },
   settings: {
      "import/resolver": {
         node: {
            paths: ["src"],
         },
      },
   },
};
