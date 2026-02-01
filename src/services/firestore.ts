import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Branch, Subject, Note } from '@/types';

// Collection References
const branchesRef = collection(db, 'branches');
const subjectsRef = collection(db, 'subjects');
const notesRef = collection(db, 'notes');
const noteStatsRef = collection(db, 'noteStats');
const searchLogsRef = collection(db, 'searchLogs');

// ==================== BRANCH SERVICES ====================

export const getAllBranches = async (): Promise<Branch[]> => {
  const q = query(branchesRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Branch));
};

export const getBranchesWithNotes = async (): Promise<Branch[]> => {
  // Get all subjects to find which branches have notes
  const subjectsSnapshot = await getDocs(subjectsRef);
  const branchIdsWithNotes = new Set(subjectsSnapshot.docs.map(doc => doc.data().branch));
  
  if (branchIdsWithNotes.size === 0) return [];
  
  const q = query(branchesRef, where('__name__', 'in', Array.from(branchIdsWithNotes)));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Branch));
};

export const getBranchById = async (id: string): Promise<Branch | null> => {
  const docRef = doc(branchesRef, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Branch;
};

export const addBranch = async (branch: Omit<Branch, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(branchesRef, {
    ...branch,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateBranch = async (id: string, data: Partial<Branch>): Promise<void> => {
  const docRef = doc(branchesRef, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteBranch = async (id: string): Promise<void> => {
  await deleteDoc(doc(branchesRef, id));
};

// ==================== SUBJECT SERVICES ====================

export const getAllSubjects = async (): Promise<Subject[]> => {
  const q = query(subjectsRef, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Subject));
};

export const getSubjectsByBranch = async (branchId: string): Promise<Subject[]> => {
  const q = query(subjectsRef, where('branch', '==', branchId), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Subject));
};

export const getSubjectsByBranchAndYear = async (branchId: string, year: number): Promise<Subject[]> => {
  const q = query(
    subjectsRef,
    where('branch', '==', branchId),
    where('year', '==', year),
    orderBy('semester'),
    orderBy('name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Subject));
};

export const getSubjectsByBranchYearSemester = async (
  branchId: string,
  year: number,
  semester: number
): Promise<Subject[]> => {
  const q = query(
    subjectsRef,
    where('branch', '==', branchId),
    where('year', '==', year),
    where('semester', '==', semester),
    orderBy('name')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Subject));
};

export const getSubjectsWithNotes = async (): Promise<Subject[]> => {
  // Get all notes to find which subjects have notes
  const notesSnapshot = await getDocs(notesRef);
  const subjectIdsWithNotes = new Set(notesSnapshot.docs.map(doc => doc.data().subjectId));
  
  if (subjectIdsWithNotes.size === 0) return [];
  
  const subjects: Subject[] = [];
  const batchSize = 10;
  const subjectIdsArray = Array.from(subjectIdsWithNotes);
  
  for (let i = 0; i < subjectIdsArray.length; i += batchSize) {
    const batch = subjectIdsArray.slice(i, i + batchSize);
    const q = query(subjectsRef, where('__name__', 'in', batch));
    const snapshot = await getDocs(q);
    subjects.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
  }
  
  return subjects.sort((a, b) => a.name.localeCompare(b.name));
};

export const getSubjectById = async (id: string): Promise<Subject | null> => {
  const docRef = doc(subjectsRef, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Subject;
};

export const addSubject = async (subject: Omit<Subject, 'id' | 'createdAt'>): Promise<string> => {
  const docRef = await addDoc(subjectsRef, {
    ...subject,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const updateSubject = async (id: string, data: Partial<Subject>): Promise<void> => {
  const docRef = doc(subjectsRef, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteSubject = async (id: string): Promise<void> => {
  await deleteDoc(doc(subjectsRef, id));
};

// ==================== NOTE SERVICES ====================

export const getAllNotes = async (): Promise<Note[]> => {
  const q = query(notesRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Note));
};

export const getNotesBySubject = async (subjectId: string): Promise<Note[]> => {
  const q = query(
    notesRef,
    where('subjectId', '==', subjectId),
    where('isPublished', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Note));
};

export const getNoteById = async (id: string): Promise<Note | null> => {
  const docRef = doc(notesRef, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Note;
};

export const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'views' | 'downloads'>): Promise<string> => {
  const docRef = await addDoc(notesRef, {
    ...note,
    views: 0,
    downloads: 0,
    createdAt: serverTimestamp()
  });
  
  // Initialize note stats
  await addDoc(noteStatsRef, {
    noteId: docRef.id,
    views: 0,
    downloads: 0,
    createdAt: serverTimestamp()
  });
  
  return docRef.id;
};

export const updateNote = async (id: string, data: Partial<Note>): Promise<void> => {
  const docRef = doc(notesRef, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteNote = async (id: string): Promise<void> => {
  await deleteDoc(doc(notesRef, id));
  // Also delete associated stats
  const statsQuery = query(noteStatsRef, where('noteId', '==', id));
  const statsSnapshot = await getDocs(statsQuery);
  statsSnapshot.docs.forEach(async (statDoc) => {
    await deleteDoc(statDoc.ref);
  });
};

export const toggleNotePublish = async (id: string, isPublished: boolean): Promise<void> => {
  const docRef = doc(notesRef, id);
  await updateDoc(docRef, {
    isPublished,
    updatedAt: serverTimestamp()
  });
};

// ==================== ANALYTICS SERVICES ====================

export const incrementNoteViews = async (noteId: string): Promise<void> => {
  const docRef = doc(notesRef, noteId);
  await updateDoc(docRef, {
    views: increment(1)
  });
  
  // Update note stats
  const statsQuery = query(noteStatsRef, where('noteId', '==', noteId));
  const statsSnapshot = await getDocs(statsQuery);
  
  if (!statsSnapshot.empty) {
    const statDoc = statsSnapshot.docs[0];
    await updateDoc(statDoc.ref, {
      views: increment(1),
      lastViewed: serverTimestamp()
    });
  }
};

export const incrementNoteDownloads = async (noteId: string): Promise<void> => {
  const docRef = doc(notesRef, noteId);
  await updateDoc(docRef, {
    downloads: increment(1)
  });
  
  // Update note stats
  const statsQuery = query(noteStatsRef, where('noteId', '==', noteId));
  const statsSnapshot = await getDocs(statsQuery);
  
  if (!statsSnapshot.empty) {
    const statDoc = statsSnapshot.docs[0];
    await updateDoc(statDoc.ref, {
      downloads: increment(1),
      lastDownloaded: serverTimestamp()
    });
  }
};

export const logSearchQuery = async (query: string, resultsCount: number): Promise<void> => {
  await addDoc(searchLogsRef, {
    query: query.toLowerCase().trim(),
    timestamp: serverTimestamp(),
    resultsCount,
    userAgent: navigator.userAgent
  });
};

export const getTrendingNotes = async (limit: number = 5): Promise<Note[]> => {
  const q = query(
    notesRef,
    where('isPublished', '==', true),
    orderBy('downloads', 'desc'),
    orderBy('views', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.slice(0, limit).map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Note));
};

export const getDashboardStats = async () => {
  const [branchesSnap, subjectsSnap, notesSnap] = await Promise.all([
    getDocs(branchesRef),
    getDocs(subjectsRef),
    getDocs(notesRef)
  ]);
  
  const notes = notesSnap.docs.map(doc => doc.data() as Note);
  const totalViews = notes.reduce((sum, note) => sum + (note.views || 0), 0);
  const totalDownloads = notes.reduce((sum, note) => sum + (note.downloads || 0), 0);
  
  const trendingNotes = await getTrendingNotes(5);
  
  return {
    totalBranches: branchesSnap.size,
    totalSubjects: subjectsSnap.size,
    totalNotes: notesSnap.size,
    totalViews,
    totalDownloads,
    trendingNotes
  };
};

// ==================== SEARCH SERVICES ====================

export const searchNotes = async (searchQuery: string): Promise<{ notes: Note[]; subjects: Subject[] }> => {
  const query_lower = searchQuery.toLowerCase().trim();
  
  // Get all subjects and filter by name
  const allSubjects = await getAllSubjects();
  const matchingSubjects = allSubjects.filter(subject =>
    subject.name.toLowerCase().includes(query_lower) ||
    subject.code?.toLowerCase().includes(query_lower)
  );
  
  // Get all notes and filter by title
  const allNotes = await getAllNotes();
  const matchingNotes = allNotes.filter(note =>
    note.title.toLowerCase().includes(query_lower) ||
    note.description?.toLowerCase().includes(query_lower) ||
    note.unit?.toLowerCase().includes(query_lower)
  );
  
  // Log search
  await logSearchQuery(query_lower, matchingNotes.length + matchingSubjects.length);
  
  return {
    notes: matchingNotes,
    subjects: matchingSubjects
  };
};

// ==================== UTILITY SERVICES ====================

export const getAvailableYearsForBranch = async (branchId: string): Promise<number[]> => {
  const subjects = await getSubjectsByBranch(branchId);
  const years = new Set(subjects.map(s => s.year));
  return Array.from(years).sort((a, b) => a - b);
};

export const getAvailableSemestersForBranchYear = async (branchId: string, year: number): Promise<number[]> => {
  const subjects = await getSubjectsByBranchAndYear(branchId, year);
  const semesters = new Set(subjects.map(s => s.semester));
  return Array.from(semesters).sort((a, b) => a - b);
};
