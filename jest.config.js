module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/"
  ],
  coverageProvider: "babel",
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover"
  ],
  maxWorkers: "50%",
  moduleDirectories: [
    "node_modules"
  ],
  moduleFileExtensions: [
    "js",
    "ts",
  ],
  roots: [
    "."
  ],
  runner: "jest-runner",
  testMatch: [
    "**/?(*.)+(spec|test).ts"
  ],
};
