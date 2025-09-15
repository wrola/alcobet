import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { useBets } from './useBets';
import BetsService from '../services/bets.service';

// Mock BetsService
vi.mock('../services/bets.service', () => ({
  default: {
    getUserBets: vi.fn(),
    createBet: vi.fn(),
    getBet: vi.fn(),
  },
}));

// Mock notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('useBets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    vi.mocked(BetsService.getUserBets).mockResolvedValue([]);
    
    const { result } = renderHook(() => useBets(), { wrapper: TestWrapper });

    expect(result.current.bets).toEqual([]);
    expect(result.current.loading).toBe(true); // Initially true because useEffect calls fetchBets
    expect(result.current.error).toBe(null);
    expect(typeof result.current.fetchBets).toBe('function');
    expect(typeof result.current.createBet).toBe('function');
  });

  it('should fetch bets successfully', async () => {
    const mockBets = [
      {
        id: 1,
        amount: 100,
        trustmanEmail: 'test@example.com',
        deadline: '2024-12-31',
        status: 'active',
        dailyChecks: [],
      },
    ];

    vi.mocked(BetsService.getUserBets).mockResolvedValue(mockBets);

    const { result } = renderHook(() => useBets(), { wrapper: TestWrapper });

    await act(async () => {
      await result.current.fetchBets();
    });

    expect(result.current.bets).toEqual(mockBets);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch error', async () => {
    const mockError = new Error('Network error');
    vi.mocked(BetsService.getUserBets).mockRejectedValue(mockError);

    const { result } = renderHook(() => useBets(), { wrapper: TestWrapper });

    await act(async () => {
      await result.current.fetchBets();
    });

    expect(result.current.bets).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to fetch bets');
  });

  it('should create bet successfully', async () => {
    const newBet = {
      trustmanEmail: 'trustman@example.com',
      amount: 200,
      deadline: '2024-12-31',
    };

    const createdBet = { ...newBet, id: 1, status: 'active', dailyChecks: [] };
    vi.mocked(BetsService.createBet).mockResolvedValue(createdBet);
    vi.mocked(BetsService.getUserBets).mockResolvedValue([createdBet]);

    const { result } = renderHook(() => useBets(), { wrapper: TestWrapper });

    let success: boolean;
    await act(async () => {
      success = await result.current.createBet(newBet);
    });

    expect(success!).toBe(true);
    expect(BetsService.createBet).toHaveBeenCalledWith(newBet);
  });
});