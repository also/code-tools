// we need to return a new object for each project because jest mutates them
// https://github.com/facebook/jest/issues/8293
module.exports = () =>
  /** @type {import('ts-jest').InitialOptionsTsJest} */
  ({
    preset: "ts-jest",
    roots: ["<rootDir>/src"],
    injectGlobals: false,
    testEnvironment: "jsdom",
    globals: {
      "ts-jest": {
        isolatedModules: true,
      },
    },
  });
