import axios from 'axios';

const API_BASE = '/api';

export const getOptionsData = async (symbol: string) => {
  const response = await axios.get(`${API_BASE}/options/${symbol}`);
  return response.data;
};

export const getMarketPulse = async () => {
  const response = await axios.get(`${API_BASE}/market/pulse`);
  return response.data;
};

export const getScanStatus = async () => {
  const response = await axios.get(`${API_BASE}/scan/status`);
  return response.data;
};
