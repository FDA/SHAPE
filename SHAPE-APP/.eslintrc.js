module.exports = {
    env: {
        "browser": true,
        "es2021": true,
        "node": true
    },
    ignorePatterns: [ // ignore tests
       "src/__tests__/*",
       "src/**/*.test.*"],
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": 2021,
        "sourceType": "module"
    },
    plugins: [
        "react",
        "@typescript-eslint"
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",  // allow @ts-ignore 
      "@typescript-eslint/no-unused-vars": "warn",  // warn of unused variable declartions
      "@typescript-eslint/no-explicit-any": "off", // allow type :any
      "@typescript-eslint/explicit-module-boundary-types": "off", // allow return type :any
      "@typescript-eslint/ban-types": "off", // allow types :Function and :Object
      "@typescript-eslint/no-non-null-assertion": "off",   // allow non-null assertion (example: participant!.name!)
      "@typescript-eslint/no-empty-interface": "off", // allow empty interfaces to be declared and passed into component propss
      "react/no-unescaped-entities": "off", // allow apostrofies in render()
      "no-prototype-builtins": "off",  // allow hasOwnProperty()
      "prefer-const": "warn",
    },
    settings: {
      "react": {
        "version": "detect"
      }
    },
};
