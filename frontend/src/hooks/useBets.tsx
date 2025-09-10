import { useState, useEffect } from 'react';
import type { Bet, CreateBetDto } from '../types';
import BetsService from '../services/bets.service';

export const useBets = () => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await BetsService.getUserBets();
      setBets(data);
    } catch (err) {
      setError('Failed to fetch bets');
      console.error('Error fetching bets:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBet = async (betData: CreateBetDto): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const newBet = await BetsService.createBet(betData);
      setBets(prev => [newBet, ...prev]);
      return true;
    } catch (err) {
      setError('Failed to create bet');
      console.error('Error creating bet:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getBet = async (id: number): Promise<Bet | null> => {
    try {
      setLoading(true);
      setError(null);
      return await BetsService.getBet(id);
    } catch (err) {
      setError('Failed to fetch bet');
      console.error('Error fetching bet:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  return {
    bets,
    loading,
    error,
    fetchBets,
    createBet,
    getBet,
  };
};