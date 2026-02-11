import { describe, it, expect } from 'vitest';
import { moduleConfig } from './config';

describe('Whiteboard moduleConfig', () => {
  it('has required id property', () => {
    expect(moduleConfig.id).toBe('whiteboard');
  });

  it('has label property', () => {
    expect(moduleConfig.label).toBe('Whiteboard');
  });

  it('has icon property', () => {
    expect(moduleConfig.icon).toBe('pen');
  });

  it('has helpItems array', () => {
    expect(Array.isArray(moduleConfig.helpItems)).toBe(true);
    expect(moduleConfig.helpItems.length).toBeGreaterThan(0);
  });

  it('helpItems contains expected instructions', () => {
    const items = moduleConfig.helpItems;

    // Check for key help items
    expect(items.some((item) => item.toLowerCase().includes('draw'))).toBe(true);
    expect(items.some((item) => item.toLowerCase().includes('pan'))).toBe(true);
    expect(items.some((item) => item.toLowerCase().includes('zoom'))).toBe(true);
  });

  it('all helpItems are non-empty strings', () => {
    moduleConfig.helpItems.forEach((item) => {
      expect(typeof item).toBe('string');
      expect(item.length).toBeGreaterThan(0);
    });
  });
});
