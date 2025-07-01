/**
 * Test setup file for Vitest
 * This file is loaded before all tests are run
 */

// Setup global test environment
(globalThis as any).TextEncoder = TextEncoder;
(globalThis as any).TextDecoder = TextDecoder;

// Mock console to reduce noise in tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress Three.js WebGL context warnings in tests
  if (args[0]?.includes?.('WebGL')) return;
  originalConsoleError(...args);
};
