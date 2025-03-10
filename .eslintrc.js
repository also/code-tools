module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
    "no-constant-condition": ["error", { checkLoops: false }],
  },
  overrides: [
    {
      files: ["jest.config*.js", ".eslintrc.js", "build*.mjs"],
      env: {
        node: true,
      },
    },
  ],
};
