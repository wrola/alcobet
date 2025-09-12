import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDateShort, formatDate } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1000.50)).toBe('$1,000.50');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });
  });

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const date = '2024-01-15';
      const result = formatDateShort(date);
      expect(result).toBe('Jan 15, 2024');
    });

    it('should handle different date formats', () => {
      const isoDate = new Date('2024-01-15').toISOString();
      const result = formatDateShort(isoDate);
      expect(result).toBe('Jan 15, 2024');
    });
  });

  describe('formatDate', () => {
    it('should format date in long format', () => {
      const date = '2024-01-15';
      const result = formatDate(date);
      expect(result).toBe('January 15, 2024');
    });
  });
});