import { apiClient } from '@/lib/api';

export const deleteProject = async (
  id: string | number
): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/api/Project/${id}`);
};
