import path from 'path';
const config = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        '**/*.(t|j)s',
        '!**/*.module.ts',
        '!**/main.ts',
    ],
    coverageDirectory: '../coverage',
    testEnvironment: 'node',
    testTimeout: 30000,
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1',
        '^@shared/(.*)$': path.resolve(__dirname, '../../packages/shared/src') + '/$1',
    },
};
export default config;
//# sourceMappingURL=jest.config.js.map