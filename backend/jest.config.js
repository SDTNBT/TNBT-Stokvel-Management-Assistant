module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  testEnvironment: "node",
  setupFilesAfterEnv: [
    "<rootDir>/tests/setup.js" 
  ],
};