const { createCjsPreset } = require('jest-preset-angular/presets');

/** @type {import('jest').Config} */
module.exports = {
  ...createCjsPreset({ tsconfig: '<rootDir>/tsconfig.spec.json' }),
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  // Ionic, Stencil e Ionicons se distribuyen solo como ESM: hay que transformarlos a CJS.
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$|@ionic|@stencil|ionicons)'],
  // ionicons@8 (dependencia de @ionic/angular) solo exporta components/* con la condición
  // "import"; Jest en modo CJS no la resuelve, así que se apunta al archivo directamente.
  moduleNameMapper: {
    '^ionicons/components/(.*)$': '<rootDir>/node_modules/@ionic/angular/node_modules/ionicons/components/$1',
  },
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.spec.ts',
    '!src/app/**/*.testing.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: { statements: 95, branches: 95, functions: 95, lines: 95 },
  },
};
