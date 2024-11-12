import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // path to the Next.js app to load next.config.js and .env files in test environment
  dir: './',
})

// custom jest config
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // include all files in src directory for coverage, excluding specific folders if needed
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}", // adjust if files are elsewhere
    "!**/node_modules/**",       // exclude node_modules
    "!**/*.d.ts",                // exclude type definition files
    "!**/excluded-folder/**",    // add any other exclusions here if necessary
  ],
  coverageDirectory: "coverage", // optional: specify output directory for coverage reports
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // uncomment if setup file is needed
}

export default createJestConfig(config)
