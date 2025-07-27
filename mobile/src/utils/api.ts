import axios, { AxiosInstance } from 'axios';
import { useAuth } from '@clerk/clerk-expo';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const createApiClient = (getToken: () => Promise<string | null>): AxiosInstance => {
  const api = axios.create({ baseURL: API_BASE_URL });

  api.interceptors.request.use(async (config) => {
    try {
      const token = await getToken();
      // console.log('Token being sent:', token);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Failed to get token', error);
      return config;
    }
  });
  return api;
};

export const useApiClient = (): AxiosInstance => {
  const { getToken } = useAuth();

  return createApiClient(getToken);
};

export const userApi = {
  syncUser: (api: AxiosInstance) => api.post('/users/sync'),
  getCurrentUser: (api: AxiosInstance) => api.get('/users/me'),
  updateProfile: (api: AxiosInstance, data: any) => api.put('/users/profile', data),
};

export const postApi = {
  createPost: (api: AxiosInstance, data: { content: string; image?: string }) =>
    api.post('/posts', data),
  getPosts: (api: AxiosInstance) => api.get('/posts'),
  getUserPosts: (api: AxiosInstance, username: string) => api.get(`/posts/user/${username}`),
  likePost: (api: AxiosInstance, postId: string) => api.post(`/posts/${postId}/like`),
  deletePost: (api: AxiosInstance, postId: string) => api.delete(`/posts/${postId}`),
};

export const commentApi = {
  createComment: (api: AxiosInstance, postId: string, content: string) =>
    api.post(`/comments/post/${postId}`, { content }),

  likeComment: (api: AxiosInstance, commentId: string) => api.post(`/comments/${commentId}/like`),
};
