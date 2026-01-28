# StoryNest - Tổng Quan Dự Án

## 📋 Tổng Quan

**StoryNest** là một nền tảng AI/RAG-powered để phân tích và quản lý bản thảo truyện cho các tác giả. Hệ thống hỗ trợ tác giả upload, chỉnh sửa, quản lý version, và nhận phân tích AI về nhịp độ, cảm xúc, nhân vật của tác phẩm.

## 🎯 Mục Đích

- **Quản lý bản thảo**: Upload, chỉnh sửa, và quản lý nhiều version của từng chapter
- **Phân tích AI**: Phân tích nhịp độ (pacing), cảm xúc (emotion), nhân vật (characters) của từng chapter/version
- **AI Chatbot**: Tương tác với AI để đặt câu hỏi về bản thảo và nhận gợi ý
- **Version Control**: Quản lý nhiều version của từng chapter với khả năng so sánh và đặt version chính (main)

## 🛠️ Tech Stack

### Frontend Framework
- **React 18.3.1** - UI framework
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool và dev server
- **React Router DOM 6.30.1** - Routing

### UI Libraries
- **Shadcn UI** - Component library (Radix UI primitives)
- **Tailwind CSS 3.4.17** - Styling
- **Framer Motion 12.24.7** - Animations
- **Lucide React 0.462.0** - Icons
- **Recharts 2.15.4** - Charts và data visualization

### State Management & Data
- **TanStack React Query 5.83.0** - Server state management
- **LocalStorage** - Client-side data persistence
- **React Hooks** - useState, useEffect, useMemo, useRef

### File Processing
- **Mammoth.js 1.11.0** - Convert Word (.docx) files to HTML

### Form Handling
- **React Hook Form 7.61.1** - Form management
- **Zod 3.25.76** - Schema validation

## 🏗️ Kiến Trúc

### Role-Based Access Control (RBAC)
Hệ thống có 3 vai trò chính:
- **Author**: Upload, chỉnh sửa, phân tích bản thảo
- **Staff**: Review và đánh giá bản thảo
- **Admin**: Quản lý users, cấu hình hệ thống

### Data Flow
1. **Upload**: Author upload file Word → Parse chapters → Tạo Story với Chapters và Versions
2. **Storage**: Lưu vào LocalStorage với key `storynest_stories`
3. **Analysis**: Chọn Story/Chapter/Version → Request AI Analysis → Hiển thị kết quả
4. **Chatbot**: Chọn Story/Chapter/Version → Chat với AI về nội dung

## 📁 Cấu Trúc Thư Mục

```
src/
├── components/
│   ├── layout/           # Layout components (Header, Sidebar, DefaultLayout)
│   ├── ui/              # Shadcn UI components (Button, Card, Select, etc.)
│   └── NavLink.tsx      # Navigation link component
├── pages/
│   ├── author/          # Author pages
│   │   ├── Dashboard.tsx    # Dashboard với stats và recent manuscripts
│   │   ├── Upload.tsx       # Upload, edit, version management
│   │   ├── Analysis.tsx     # AI analysis results
│   │   └── Chatbot.tsx      # AI chatbot interface
│   ├── staff/
│   │   └── Review.tsx       # Staff review page
│   ├── admin/           # Admin pages
│   │   ├── Dashboard.tsx
│   │   ├── Config.tsx
│   │   └── Users.tsx
│   ├── Home.tsx         # Landing page
│   ├── Login.tsx        # Login page
│   ├── Register.tsx     # Registration page
│   └── NotFound.tsx     # 404 page
├── utils/
│   └── mockData.ts      # Mock data và interfaces
├── hooks/               # Custom React hooks
├── lib/
│   └── utils.ts        # Utility functions
└── App.tsx             # Main app với routing
```

## 📊 Data Models

### Story (Bộ truyện)
```typescript
interface Story {
  id: string;
  title: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}
```

### Chapter (Chương)
```typescript
interface Chapter {
  id: string;
  title: string;
  order: number;
  versions: Version[];
}
```

### Version (Phiên bản)
```typescript
interface Version {
  id: string;
  version: number;        // Số thứ tự version (1, 2, 3...)
  label: string;           // "Draft", "Revised", "Final"
  content: string;         // HTML content
  createdAt: string;
  isMain: boolean;         // Version chính
}
```

### Analysis Result
```typescript
interface AnalysisResult {
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
  // ...
}
```

## 🎨 Tính Năng Chính

### 1. Upload Page (`/author/upload`)
- **Upload Word files**: Drag & drop hoặc click để upload
- **Auto chapter detection**: Tự động phát hiện chapters từ Word file
- **Rich text editor**: Chỉnh sửa nội dung với formatting (bold, italic, headings)
- **Version management**:
  - Tạo version mới khi save với thay đổi
  - So sánh giữa các versions
  - Đặt version chính (main)
  - Xem lịch sử versions
- **Story sidebar**: Tree view của stories → chapters → versions
- **Auto-save**: Tự động tạo version đầu tiên "Draft" nếu chưa có

### 2. Analysis Page (`/author/analysis`)
- **Scope selection**: 
  - "This Chapter" - Phân tích 1 chapter/version cụ thể
  - "Whole Story" - Phân tích toàn bộ truyện
- **Chapter/Version picker**: Folder tree UI với expandable chapters
- **Analysis tabs**:
  - **Chapter Overview**: Metrics tổng quan (scenes, words, characters)
  - **Scenes & Emotions**: Chi tiết từng scene với emotion và pacing
  - **Characters**: Tần suất xuất hiện và relationships
  - **Chapter History**: Lịch sử các version của chapter
- **Visualizations**: Charts cho emotion flow, character frequency

### 3. Chatbot Page (`/author/chatbot`)
- **AI Chat interface**: Chat với AI về bản thảo
- **Context selection**: Chọn Story/Chapter/Version hoặc "Whole Story"
- **Suggested questions**: Gợi ý câu hỏi dựa trên context
- **Message history**: Lưu lịch sử chat
- **Scope-aware responses**: AI trả lời dựa trên scope đã chọn

### 4. Dashboard (`/author/dashboard`)
- **Statistics**: Total manuscripts, analyzed, words, avg chapter length
- **Recent manuscripts**: Danh sách manuscripts gần đây
- **Quick actions**: Link đến Upload, Chatbot
- **Writing tips**: Tips cho tác giả
- **Featured characters**: Quick access đến characters

## 🔄 Workflow

### Upload & Edit Workflow
1. Author upload Word file
2. System parse và detect chapters
3. Author xem preview và confirm
4. System tạo Story với Chapters
5. Author chọn chapter để edit
6. Editor tự động tạo version "Draft" đầu tiên
7. Author chỉnh sửa và save → Tạo version mới với label
8. Author có thể so sánh, set main version

### Analysis Workflow
1. Author chọn Story
2. Chọn scope: "This Chapter" hoặc "Whole Story"
3. Nếu "This Chapter": Chọn Chapter và Version cụ thể
4. Click "Request AI Analysis"
5. System hiển thị kết quả trong các tabs

### Chatbot Workflow
1. Author chọn Story (optional: Chapter/Version)
2. Nếu không chọn Chapter → Default "Whole Story"
3. Author đặt câu hỏi hoặc chọn suggested question
4. AI trả lời dựa trên context đã chọn
5. Conversation history được lưu

## 🎯 UI/UX Features

### Folder Tree UI
- Chapters hiển thị như folders với icon `Folder`
- Versions hiển thị như files với icon `FileText`
- Expandable/collapsible chapters
- "None (Whole story)" option để chọn phân tích toàn bộ

### Conditional Rendering
- Ẩn Chapter/Version selectors khi chọn "Whole Story"
- Auto-select main version khi chọn chapter
- Dynamic UI dựa trên scope selection

### Responsive Design
- Mobile-friendly với Tailwind responsive classes
- Grid layouts adapt theo screen size

## 💾 Data Persistence

### LocalStorage
- Key: `storynest_stories`
- Format: JSON array of `Story[]`
- Auto-load khi component mount
- Auto-save khi có thay đổi

### Mock Data
- `mockManuscripts`: Sample manuscripts cho development
- `mockChapterContents`: Sample chapter content
- `mockAnalysisResult`: Sample analysis results
- `mockChatMessages`: Sample chat history

## 🔐 Authentication & Authorization

### Routes Protection
- Role-based routing trong `App.tsx`
- Separate routes cho Author, Staff, Admin

### User Roles
- **Author**: `/author/*` routes
- **Staff**: `/staff/*` routes  
- **Admin**: `/admin/*` routes

## 🚀 Development

### Scripts
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Key Dependencies
- React 18 với Hooks
- TypeScript cho type safety
- Vite cho fast HMR
- Shadcn UI cho consistent design system
- Framer Motion cho smooth animations

## 📝 Notes

### Version Control Philosophy
- **Chỉ version ở chapter level**, không có version ở story level
- Mỗi chapter có thể có nhiều versions
- Version đầu tiên tự động là "Draft"
- Author có thể đặt một version làm "main"

### Analysis Scope
- **"This Chapter"**: Phân tích metrics cụ thể của 1 chapter/version
- **"Whole Story"**: Phân tích tổng hợp toàn bộ truyện
- Không có "All Versions" option trong Analysis (chỉ phân tích 1 version cụ thể)

### AI Integration (Planned)
- RAG (Retrieval-Augmented Generation) cho context-aware responses
- Real-time analysis với backend API
- Character relationship mapping
- Emotion detection và pacing analysis

## 🔮 Future Enhancements

- Backend API integration
- Real-time collaboration
- Export/Import features
- Advanced diffing algorithm
- AI-powered suggestions for edits
- Version merging capabilities
- Team management cho co-authors
