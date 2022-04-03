/** @type {import('ts-jest').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testPathIgnorePatterns: ["/lib/"],
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};
