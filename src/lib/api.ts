import axios from 'axios';
import { StockData } from '../types/portfolio';

export const fetchPortfolio = async (): Promise<StockData[]> => {
  const res = await axios.get<StockData[]>('/api/portfolio');
  return res.data;
};
