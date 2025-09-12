export default {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
    transformIgnorePatterns: [
        '/node_modules/(?!flat)/',
    ],
    moduleNameMapper: {
        '^environments/(.*)$': '<rootDir>/src/environments/$1'
    }
};


