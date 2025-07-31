module.exports = {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Diretórios de teste
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // Diretórios a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'backend/**/*.js',
    'frontend/js/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/*.test.js',
    '!**/*.spec.js'
  ],
  
  // Configurações de setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Configurações de transformação
  transform: {},
  
  // Configurações de módulos
  moduleFileExtensions: ['js', 'json'],
  
  // Configurações de ambiente
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Configurações de verbose
  verbose: true,
  
  // Configurações de watch
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Configurações de globals
  globals: {
    'NODE_ENV': 'test'
  }
}; 