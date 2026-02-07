import { apiClient } from '@/lib/api';

export interface ChapterVersionResponse {
  versionId?: number;
  chapterVersionId?: number;
  chapterId?: number;
  versionNumber?: number;
  /** Nội dung truyện (story content) */
  rawContent?: string;
  uploadDate?: string;
  createdAt?: string;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface CreateChapterVersionPayload {
  chapterId: number;
  /** Nội dung truyện. Mặc định "Text here" khi tạo version mới */
  rawContent: string;
}

export interface GetChapterVersionsResponse {
  message: string;
  data: ChapterVersionResponse[];
}

/**
 * Lấy danh sách versions của chapter
 * GET /api/ChapterVersion/chapter/{chapterId}
 */
export const getChapterVersions = async (
  chapterId: string | number
): Promise<GetChapterVersionsResponse> => {
  return apiClient.get<GetChapterVersionsResponse>(
    `/api/ChapterVersion/chapter/${chapterId}`
  );
};

export const createChapterVersion = async (
  payload: CreateChapterVersionPayload
): Promise<{ message: string; data: ChapterVersionResponse }> => {
  return apiClient.post<{ message: string; data: ChapterVersionResponse }>(
    '/api/ChapterVersion',
    {
      chapterId: payload.chapterId,
      rawContent: payload.rawContent,
    }
  );
};

export const updateChapterVersion = async (
  id: string | number,
  rawContent: string
): Promise<{ message: string; data: ChapterVersionResponse }> => {
  return apiClient.put<{ message: string; data: ChapterVersionResponse }>(
    `/api/ChapterVersion/${id}`,
    { rawContent }
  );
};

export const deleteChapterVersion = async (
  id: string | number
): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/api/ChapterVersion/${id}`);
};
