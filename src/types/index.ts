// Branch Types
export interface Branch {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt?: Date;
}

// Subject Types
export interface Subject {
  id: string;
  name: string;
  branch: string;
  year: number;
  semester: number;
  code?: string;
  description?: string;
  createdAt?: Date;
}

// Note Types
export interface Note {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  pdfUrl: string;
  unit?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt?: Date;
  views: number;
  downloads: number;
}

// Note Stats Types
export interface NoteStats {
  noteId: string;
  views: number;
  downloads: number;
  lastViewed?: Date;
  lastDownloaded?: Date;
}

// Search Log Types
export interface SearchLog {
  query: string;
  timestamp: Date;
  resultsCount: number;
  userAgent?: string;
}

// Daily Stats Types
export interface DailyStats {
  date: string;
  totalViews: number;
  totalDownloads: number;
  uniqueVisitors: number;
  topNotes: string[];
}

// Admin User Types
export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: 'admin';
  createdAt: Date;
}

// Dashboard Stats Types
export interface DashboardStats {
  totalBranches: number;
  totalSubjects: number;
  totalNotes: number;
  totalDownloads: number;
  totalViews: number;
  trendingNotes: Note[];
}

// Upload Form Data Types
export interface UploadNoteData {
  branchId: string;
  year: number;
  semester: number;
  subjectId: string;
  title: string;
  description?: string;
  unit?: string;
  pdfFile: File;
}

// Filter Types
export interface NotesFilter {
  branch?: string;
  year?: number;
  semester?: number;
  subject?: string;
  searchQuery?: string;
}
