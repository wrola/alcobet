import api from './api';
import type { Bet, CreateBetDto, TrustmanResponseData } from '../types';

export class BetsService {
  static async createBet(bet: CreateBetDto): Promise<Bet> {
    const response = await api.post('/bets', bet);
    return response.data;
  }

  static async getUserBets(): Promise<Bet[]> {
    const response = await api.get('/bets');
    return response.data;
  }

  static async getBet(id: number): Promise<Bet> {
    const response = await api.get(`/bets/${id}`);
    return response.data;
  }

  // Trustman-related methods
  static async getTrustmanResponse(token: string): Promise<TrustmanResponseData> {
    const response = await api.get(`/trustman/response/${token}`);
    return response.data;
  }

  static async submitTrustmanResponse(token: string, response: 'clean' | 'drank'): Promise<{ success: boolean; message: string }> {
    const apiResponse = await api.post(`/trustman/response/${token}`, { response });
    return apiResponse.data;
  }
}

export default BetsService;