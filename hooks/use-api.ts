import axios, { AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const useApi = () => {
  const get = async <T>(endpoint: string, config?: AxiosRequestConfig) => {
    try {
      return await api.get<T>(endpoint, config);
    } catch (error) {
      throw error;
    }
  };

  const post = async <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    try {
      return await api.post<T>(endpoint, data, config);
    } catch (error) {
      throw error;
    }
  };

  const put = async <T>(endpoint: string, data?: any, config?: AxiosRequestConfig) => {
    try {
      return await api.put<T>(endpoint, data, config);
    } catch (error) {
      throw error;
    }
  };

  const del = async <T>(endpoint: string, config?: AxiosRequestConfig) => {
    try {
      return await api.delete<T>(endpoint, config);
    } catch (error) {
      throw error;
    }
  };

  return {
    get,
    post,
    put,
    delete: del,
  };
};

export default useApi;
