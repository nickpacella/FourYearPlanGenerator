import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

// custom jest config
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  collectCoverage: true,
  collectCoverageFrom: [
    "src/app/compareSchedules/page.tsx",
    "src/app/components/ClientPlan.tsx",
    "src/app/components/ElectivesDropdown.tsx",
    "src/app/components/MajorDropdown.tsx",
    "src/app/components/MinorsDropdown.tsx",
    "src/app/home/page.tsx",
    "src/app/schedule/new/page.tsx",
    "src/app/[[...index]]/page.tsx"
  ],
  coverageDirectory: "coverage",
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
