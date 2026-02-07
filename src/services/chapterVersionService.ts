import { apiClient } from '@/lib/api';

export interface ChapterVersionResponse {
  chapterVersionId?: number;
  chapterId?: number;
  rawContent?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface CreateChapterVersionPayload {
  chapterId: number;
  rawContent: string;
}

/**
 * Tạo version mới cho chapter
 * POST /api/ChapterVersion
 * Mỗi chapter có nhiều chapter version
 */
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
