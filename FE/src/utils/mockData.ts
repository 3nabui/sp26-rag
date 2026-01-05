import type { User, Manuscript, AnalysisResult, ChatMessage } from '../interfaces';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'author',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'staff',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    role: 'admin',
    createdAt: '2024-01-03T00:00:00Z',
  },
];

// Mock Manuscripts
export const mockManuscripts: Manuscript[] = [
  {
    id: 1,
    title: 'Truyện số 1',
    fileName: 'truyen-1.txt',
    fileType: 'txt',
    fileSize: 1024000,
    uploadedAt: '2024-01-15T10:30:00Z',
    status: 'completed',
    version: 1,
  },
  {
    id: 2,
    title: 'Truyện số 2',
    fileName: 'truyen-2.docx',
    fileType: 'docx',
    fileSize: 2048000,
    uploadedAt: '2024-01-14T15:20:00Z',
    status: 'processing',
    version: 1,
  },
  {
    id: 3,
    title: 'Truyện số 3',
    fileName: 'truyen-3.pdf',
    fileType: 'pdf',
    fileSize: 3072000,
    uploadedAt: '2024-01-13T09:15:00Z',
    status: 'pending',
    version: 1,
  },
  {
    id: 4,
    title: 'Truyện số 4 - Phiên bản 2',
    fileName: 'truyen-4-v2.txt',
    fileType: 'txt',
    fileSize: 1536000,
    uploadedAt: '2024-01-12T14:45:00Z',
    status: 'completed',
    version: 2,
  },
];

// Mock Analysis Result
export const mockAnalysisResult: AnalysisResult = {
  manuscriptId: 1,
  pacing: {
    slow: [1, 5, 10, 15],
    medium: [2, 3, 4, 6, 7, 8, 9, 11, 12],
    fast: [13, 14, 16, 17, 18],
  },
  emotionFlow: [
    { chapter: 1, emotion: 'vui', intensity: 7 },
    { chapter: 2, emotion: 'buồn', intensity: 5 },
    { chapter: 3, emotion: 'căng thẳng', intensity: 8 },
    { chapter: 4, emotion: 'hồi hộp', intensity: 9 },
    { chapter: 5, emotion: 'bình yên', intensity: 4 },
    { chapter: 6, emotion: 'vui', intensity: 6 },
    { chapter: 7, emotion: 'căng thẳng', intensity: 8 },
    { chapter: 8, emotion: 'buồn', intensity: 5 },
    { chapter: 9, emotion: 'hồi hộp', intensity: 9 },
    { chapter: 10, emotion: 'bình yên', intensity: 3 },
    { chapter: 11, emotion: 'vui', intensity: 7 },
    { chapter: 12, emotion: 'căng thẳng', intensity: 9 },
    { chapter: 13, emotion: 'hồi hộp', intensity: 10 },
    { chapter: 14, emotion: 'căng thẳng', intensity: 9 },
    { chapter: 15, emotion: 'vui', intensity: 8 },
  ],
  characters: [
    { name: 'Nhân vật A', appearances: 45, role: 'Nhân vật chính' },
    { name: 'Nhân vật B', appearances: 30, role: 'Nhân vật phụ' },
    { name: 'Nhân vật C', appearances: 20, role: 'Phản diện' },
    { name: 'Nhân vật D', appearances: 15, role: 'Bạn thân' },
    { name: 'Nhân vật E', appearances: 10, role: 'Người hướng dẫn' },
  ],
  characterRelations: [
    { character1: 'Nhân vật A', character2: 'Nhân vật B', relationship: 'Bạn bè', strength: 8 },
    { character1: 'Nhân vật A', character2: 'Nhân vật C', relationship: 'Đối thủ', strength: 9 },
    { character1: 'Nhân vật A', character2: 'Nhân vật D', relationship: 'Bạn thân', strength: 10 },
    { character1: 'Nhân vật B', character2: 'Nhân vật D', relationship: 'Đồng minh', strength: 7 },
    { character1: 'Nhân vật C', character2: 'Nhân vật E', relationship: 'Thầy trò', strength: 6 },
  ],
  summary: {
    totalChapters: 15,
    totalWords: 50000,
    averageWordsPerChapter: 3333,
    writingStyle: 'Mô tả chi tiết, nhịp độ vừa phải, tập trung vào phát triển nhân vật',
  },
};

// Mock Chat Messages
export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Xin chào! Tôi có thể giúp gì cho bạn về bản thảo của bạn?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Mock Flagged Manuscripts (for Staff)
export const mockFlaggedManuscripts: Manuscript[] = [
  {
    id: 5,
    title: 'Truyện cần xem xét',
    fileName: 'truyen-flagged-1.txt',
    fileType: 'txt',
    fileSize: 1024000,
    uploadedAt: '2024-01-10T10:30:00Z',
    status: 'pending',
    version: 1,
  },
  {
    id: 6,
    title: 'Truyện có vấn đề',
    fileName: 'truyen-flagged-2.docx',
    fileType: 'docx',
    fileSize: 2048000,
    uploadedAt: '2024-01-09T15:20:00Z',
    status: 'pending',
    version: 1,
  },
];

// Mock FAQ
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export const mockFAQs: FAQ[] = [
  {
    id: 1,
    question: 'Làm thế nào để tải lên bản thảo?',
    answer:
      'Bạn có thể tải lên bản thảo bằng cách vào mục "Tải lên bản thảo" và kéo thả file vào khu vực upload. Hệ thống hỗ trợ các định dạng TXT, DOCX, và PDF.',
    category: 'Hướng dẫn',
  },
  {
    id: 2,
    question: 'Thời gian phân tích mất bao lâu?',
    answer:
      'Thời gian phân tích phụ thuộc vào độ dài của bản thảo. Thông thường, một bản thảo 50.000 từ sẽ mất khoảng 5-10 phút để phân tích hoàn toàn.',
    category: 'Hướng dẫn',
  },
  {
    id: 3,
    question: 'Tôi có thể tải xuống báo cáo phân tích không?',
    answer:
      'Có, bạn có thể xuất báo cáo phân tích sang định dạng PDF bằng cách nhấn nút "Xuất PDF" trong trang Phân tích.',
    category: 'Tính năng',
  },
];

// Mock Writing Tips
export interface WritingTip {
  id: number;
  title: string;
  content: string;
  category: string;
}

export const mockWritingTips: WritingTip[] = [
  {
    id: 1,
    title: 'Cách tạo nhịp độ truyện tốt',
    content:
      'Nhịp độ truyện nên có sự thay đổi giữa các chương để tạo sự hấp dẫn. Kết hợp giữa các chương chậm (mô tả, phát triển nhân vật) và các chương nhanh (hành động, cao trào) để giữ người đọc luôn hứng thú.',
    category: 'Kỹ thuật viết',
  },
  {
    id: 2,
    title: 'Xây dựng nhân vật có chiều sâu',
    content:
      'Nhân vật nên có động cơ rõ ràng, điểm mạnh và điểm yếu. Hãy để nhân vật phát triển qua các chương, không chỉ là một chiều. Sử dụng đối thoại và hành động để thể hiện tính cách thay vì chỉ mô tả.',
    category: 'Xây dựng nhân vật',
  },
  {
    id: 3,
    title: 'Quản lý dòng chảy cảm xúc',
    content:
      'Dòng chảy cảm xúc nên có sự thay đổi tự nhiên. Tránh để cảm xúc quá đơn điệu hoặc thay đổi quá đột ngột. Sử dụng các sự kiện trong truyện để tạo ra sự chuyển đổi cảm xúc một cách hợp lý.',
    category: 'Kỹ thuật viết',
  },
];

// Helper function to generate pacing data
export const generatePacingData = (totalChapters: number, analysis: AnalysisResult) => {
  return Array.from({ length: totalChapters }, (_, i) => {
    const chapter = i + 1;
    if (analysis.pacing.slow.includes(chapter)) {
      return { chapter, pacing: 'Chậm' };
    }
    if (analysis.pacing.fast.includes(chapter)) {
      return { chapter, pacing: 'Nhanh' };
    }
    return { chapter, pacing: 'Vừa' };
  });
};

