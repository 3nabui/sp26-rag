// Mock data for development
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'author' | 'admin' | 'staff';
  avatar?: string;
  createdAt: string;
}

export interface Manuscript {
  id: number;
  title: string;
  fileName: string;
  fileType: 'txt' | 'docx' | 'pdf';
  fileSize: number;
  uploadedAt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  chapters?: number;
  words?: number;
}

export interface AnalysisResult {
  manuscriptId: number;
  pacing: {
    slow: number[];
    medium: number[];
    fast: number[];
  };
  emotionFlow: Array<{
    chapter: number;
    emotion: string;
    intensity: number;
  }>;
  characters: Array<{
    name: string;
    appearances: number;
    role: string;
  }>;
  characterRelations: Array<{
    character1: string;
    character2: string;
    relationship: string;
    strength: number;
  }>;
  summary: {
    totalChapters: number;
    totalWords: number;
    averageWordsPerChapter: number;
    writingStyle: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const mockUsers: User[] = [
  { id: 1, name: 'Nguyễn Văn An', email: 'an.nguyen@email.com', role: 'author', createdAt: '2024-01-15' },
  { id: 2, name: 'Trần Thị Bình', email: 'binh.tran@email.com', role: 'admin', createdAt: '2024-01-10' },
  { id: 3, name: 'Lê Minh Châu', email: 'chau.le@email.com', role: 'staff', createdAt: '2024-02-01' },
];

export const mockManuscripts: Manuscript[] = [
  { 
    id: 1, 
    title: 'Bóng Tối Dưới Ánh Trăng', 
    fileName: 'bong-toi-duoi-anh-trang.docx',
    fileType: 'docx', 
    fileSize: 245000, 
    uploadedAt: '2024-12-15', 
    status: 'completed',
    chapters: 24,
    words: 85000
  },
  { 
    id: 2, 
    title: 'Những Ngày Mưa Phương Nam', 
    fileName: 'nhung-ngay-mua-phuong-nam.pdf',
    fileType: 'pdf', 
    fileSize: 180000, 
    uploadedAt: '2024-12-20', 
    status: 'processing',
    chapters: 18,
    words: 62000
  },
  { 
    id: 3, 
    title: 'Hành Trình Vô Tận', 
    fileName: 'hanh-trinh-vo-tan.txt',
    fileType: 'txt', 
    fileSize: 320000, 
    uploadedAt: '2024-12-25', 
    status: 'pending',
    chapters: 32,
    words: 120000
  },
];

export const mockAnalysisResult: AnalysisResult = {
  manuscriptId: 1,
  pacing: {
    slow: [1, 5, 12, 18],
    medium: [2, 3, 6, 7, 13, 14, 19, 20],
    fast: [4, 8, 9, 10, 11, 15, 16, 17, 21, 22, 23, 24],
  },
  emotionFlow: [
    { chapter: 1, emotion: 'Calm', intensity: 30 },
    { chapter: 2, emotion: 'Hopeful', intensity: 45 },
    { chapter: 3, emotion: 'Tense', intensity: 60 },
    { chapter: 4, emotion: 'Fearful', intensity: 85 },
    { chapter: 5, emotion: 'Sad', intensity: 70 },
    { chapter: 6, emotion: 'Calm', intensity: 40 },
    { chapter: 7, emotion: 'Happy', intensity: 55 },
    { chapter: 8, emotion: 'Excited', intensity: 75 },
    { chapter: 9, emotion: 'Tense', intensity: 90 },
    { chapter: 10, emotion: 'Fearful', intensity: 95 },
    { chapter: 11, emotion: 'Relieved', intensity: 50 },
    { chapter: 12, emotion: 'Calm', intensity: 35 },
  ],
  characters: [
    { name: 'Minh', appearances: 245, role: 'Protagonist' },
    { name: 'Linh', appearances: 180, role: 'Love Interest' },
    { name: 'Hùng', appearances: 120, role: 'Antagonist' },
    { name: 'Bà Tư', appearances: 65, role: 'Mentor' },
    { name: 'Đức', appearances: 50, role: 'Sidekick' },
  ],
  characterRelations: [
    { character1: 'Minh', character2: 'Linh', relationship: 'Romance', strength: 90 },
    { character1: 'Minh', character2: 'Hùng', relationship: 'Rivalry', strength: 85 },
    { character1: 'Minh', character2: 'Bà Tư', relationship: 'Mentorship', strength: 70 },
    { character1: 'Minh', character2: 'Đức', relationship: 'Friendship', strength: 75 },
    { character1: 'Linh', character2: 'Hùng', relationship: 'Conflict', strength: 60 },
  ],
  summary: {
    totalChapters: 24,
    totalWords: 85000,
    averageWordsPerChapter: 3542,
    writingStyle: 'Descriptive Literary Fiction',
  },
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Xin chào! Tôi là AI trợ lý phân tích truyện. Bạn muốn tôi giúp gì về bản thảo của bạn?',
    timestamp: '2024-12-25T10:00:00Z',
  },
  {
    id: '2',
    role: 'user',
    content: 'Hãy phân tích nhịp độ của chương 4 trong "Bóng Tối Dưới Ánh Trăng"',
    timestamp: '2024-12-25T10:01:00Z',
  },
  {
    id: '3',
    role: 'assistant',
    content: 'Chương 4 có nhịp độ **nhanh** với nhiều cảnh hành động liên tiếp. Điểm nổi bật:\n\n• **Mở đầu**: Chuyển động nhanh từ cảnh trước\n• **Cao trào**: Cuộc đối đầu giữa Minh và Hùng\n• **Kết thúc**: Cliffhanger tạo sự hồi hộp\n\nĐề xuất: Có thể thêm 1-2 đoạn nghỉ ngơi để cân bằng nhịp độ.',
    timestamp: '2024-12-25T10:02:00Z',
  },
];

export const mockWritingTips = [
  {
    id: 1,
    title: 'Cân bằng nhịp độ',
    content: 'Xen kẽ giữa các cảnh hành động và tĩnh lặng để giữ sự hấp dẫn.',
    category: 'Pacing',
  },
  {
    id: 2,
    title: 'Phát triển nhân vật',
    content: 'Cho nhân vật của bạn những khuyết điểm để làm họ trở nên thực hơn.',
    category: 'Character',
  },
  {
    id: 3,
    title: 'Đối thoại sống động',
    content: 'Mỗi nhân vật nên có cách nói riêng biệt, phản ánh tính cách của họ.',
    category: 'Dialogue',
  },
];

export const mockDashboardStats = {
  totalManuscripts: 12,
  analyzedManuscripts: 8,
  totalWords: 425000,
  avgChapterLength: 3500,
  weeklyChange: {
    manuscripts: 15,
    words: 8,
    analysis: 25,
  },
};

// Mock chapter content
export interface ChapterContent {
  manuscriptId: number;
  chapter: number;
  title: string;
  content: string;
  wordCount: number;
}

export const mockChapterContents: ChapterContent[] = [
  {
    manuscriptId: 1,
    chapter: 1,
    title: 'Khởi Đầu',
    content: `Ánh trăng lạnh lẽo chiếu xuống con đường làng vắng vẻ. Minh bước đi trong đêm tối, tiếng chân vang lên trên mặt đường đá. Không khí ẩm ướt của mùa thu khiến anh cảm thấy một nỗi buồn man mác.

"Tại sao mọi thứ lại trở nên như thế này?" - Minh tự hỏi trong lòng. Anh nhớ lại những ngày tháng tươi đẹp khi còn nhỏ, khi cuộc sống đơn giản và hạnh phúc.

Bỗng nhiên, một tiếng động lạ vang lên từ phía sau. Minh quay đầu lại nhưng không thấy gì. Có lẽ chỉ là gió thôi, anh tự trấn an mình. Nhưng cảm giác bất an vẫn cứ đeo bám.

Anh tiếp tục bước đi, hướng về ngôi nhà cũ nơi anh đã lớn lên. Ngôi nhà đó giờ đã hoang vắng, không còn ai ở đó nữa. Nhưng đó là nơi duy nhất anh có thể quay về.`,
    wordCount: 185
  },
  {
    manuscriptId: 1,
    chapter: 4,
    title: 'Cuộc Đối Đầu',
    content: `Minh chạy nhanh qua những con phố tối, tim đập thình thịch trong lồng ngực. Tiếng bước chân đuổi theo phía sau ngày càng gần. Anh biết mình không thể chạy mãi được.

"Đứng lại!" - Một giọng nói quen thuộc vang lên.

Minh quay đầu lại và thấy Hùng đang đứng đó, ánh mắt lạnh lùng nhìn chằm chằm vào anh. Không khí căng thẳng như sợi dây đàn sắp đứt.

"Anh muốn gì?" - Minh hỏi, cố gắng giữ bình tĩnh.

"Tôi muốn biết sự thật." - Hùng bước tới gần, nắm đấm siết chặt. "Tại sao anh lại làm vậy?"

Minh lùi lại một bước. Anh biết cuộc đối đầu này không thể tránh khỏi. Nhưng anh không muốn đánh nhau với người bạn cũ của mình.

"Tôi không có lựa chọn nào khác." - Minh nói, giọng run run.

"Luôn luôn có lựa chọn!" - Hùng hét lên và lao tới.

Hai người đàn ông va vào nhau trong đêm tối, những cú đấm vang lên như tiếng sấm. Minh cố gắng tự vệ nhưng Hùng mạnh hơn, hung dữ hơn. Mỗi cú đấm đều nhắm vào những điểm yếu.

Minh ngã xuống đất, máu chảy từ môi. Anh nhìn lên bầu trời đầy sao và tự hỏi liệu đây có phải là kết thúc không.`,
    wordCount: 245
  },
  {
    manuscriptId: 1,
    chapter: 8,
    title: 'Bước Ngoặt',
    content: `Sau cuộc đối đầu với Hùng, Minh nhận ra rằng mình cần phải thay đổi. Anh không thể tiếp tục sống trong sợ hãi và trốn tránh nữa.

Ngày hôm sau, anh quyết định đến gặp Linh. Cô ấy là người duy nhất có thể hiểu được anh lúc này. Khi nhìn thấy cô, trái tim anh như muốn nhảy ra khỏi lồng ngực.

"Linh, tôi cần nói chuyện với em." - Minh nói, giọng nghiêm túc.

Linh nhìn anh với đôi mắt lo lắng. "Chuyện gì vậy? Anh trông có vẻ mệt mỏi."

Minh kể cho cô nghe tất cả mọi thứ - về quá khứ, về những sai lầm, về nỗi sợ hãi đang đeo bám anh. Linh lắng nghe không ngắt lời, đôi mắt cô ánh lên sự thấu hiểu.

"Anh không cần phải đối mặt với tất cả một mình." - Linh nói, nắm lấy tay anh. "Em sẽ ở bên cạnh anh."

Trong khoảnh khắc đó, Minh cảm thấy một hy vọng mới. Có lẽ mọi thứ sẽ ổn thôi, miễn là anh không từ bỏ.`,
    wordCount: 198
  }
];