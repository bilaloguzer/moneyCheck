/**
 * Test Setup
 * Configure test environment
 */

// Mock expo-sqlite for testing
jest.mock('expo-sqlite', () => {
  return jest.requireActual('./__mocks__/expo-sqlite');
});

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};
