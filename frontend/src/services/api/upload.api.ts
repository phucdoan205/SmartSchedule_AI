import { apiClient } from './client';

export type UploadCategory =
  | 'services'
  | 'branches'
  | 'doctors'
  | 'patients'
  | 'xrays'
  | 'equipments'
  | 'payments'
  | 'prescriptions'
  | 'staff'
  | 'banners';

export interface CloudinaryFolder {
  id: string;
  name: string;
  description: string;
  path: string;
}

export const uploadApi = {
  getFolders: async (): Promise<CloudinaryFolder[]> => {
    const res = await apiClient.get('/upload/folders');
    return res.data.data;
  },
  uploadImage: async (
    file: File,
    category: UploadCategory | string = 'services',
  ): Promise<{ url: string; public_id: string; folder: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const res = await apiClient.post(`/upload/image?category=${category}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },
};
