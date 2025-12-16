/* eslint-disable no-undef */
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Polyfill for jsdom
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Ensure a URL constructor is present for packages that require WHATWG URL
if (typeof global.URL === 'undefined') {
  try {
    // Prefer node's built-in URL
    const { URL } = require('url');
    global.URL = URL;
  } catch (err) {
    // fallback: try whatwg-url if available
    try {
      // eslint-disable-next-line global-require
      const { URL } = require('whatwg-url');
      global.URL = URL;
    } catch (e) {
      // last resort: ignore — tests that need URL will fail clearly
    }
  }
}

expect.extend(matchers);

afterEach(() => {
  cleanup();
});