module.exports = {
  collectCoverage: true,
  coverageDirectory: "coverage",
  testEnvironment: "jsdom", 
  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.js",  
    "<rootDir>/backend/tests/setup.js"      
  ],
};