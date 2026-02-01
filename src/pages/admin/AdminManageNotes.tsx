import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Eye, 
  Download, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  getAllNotes, 
  getSubjectById,
  updateNote,
  deleteNote,
  toggleNotePublish
} from '@/services/firestore';
import type { Note, Subject } from '@/types';

interface NoteWithSubject extends Note {
  subject?: Subject;
}

const AdminManageNotes = () => {
  const [notes, setNotes] = useState<NoteWithSubject[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteWithSubject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<NoteWithSubject | null>(null);
  const [deletingNote, setDeletingNote] = useState<NoteWithSubject | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUnit, setEditUnit] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.subject?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const notesData = await getAllNotes();
      
      // Fetch subject details for each note
      const notesWithSubjects: NoteWithSubject[] = await Promise.all(
        notesData.map(async (note) => {
          const subject = await getSubjectById(note.subjectId);
          return { ...note, subject: subject || undefined };
        })
      );
      
      setNotes(notesWithSubjects);
      setFilteredNotes(notesWithSubjects);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (note: NoteWithSubject) => {
    setEditingNote(note);
    setEditTitle(note.title);
    setEditDescription(note.description || '');
    setEditUnit(note.unit || '');
  };

  const handleSaveEdit = async () => {
    if (!editingNote) return;

    setIsSaving(true);
    try {
      await updateNote(editingNote.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        unit: editUnit.trim() || undefined
      });

      toast.success('Note updated successfully');
      setEditingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingNote) return;

    try {
      await deleteNote(deletingNote.id);
      toast.success('Note deleted successfully');
      setDeletingNote(null);
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleTogglePublish = async (note: NoteWithSubject) => {
    try {
      await toggleNotePublish(note.id, !note.isPublished);
      toast.success(`Note ${note.isPublished ? 'unpublished' : 'published'} successfully`);
      fetchNotes();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Notes</h1>
          <p className="text-gray-500 mt-1">View, edit, and manage all uploaded notes</p>
        </div>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">
            {notes.filter(n => n.isPublished).length} Published
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span className="text-gray-600">
            {notes.filter(n => !n.isPublished).length} Drafts
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            {notes.reduce((sum, n) => sum + (n.views || 0), 0).toLocaleString()} Total Views
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            {notes.reduce((sum, n) => sum + (n.downloads || 0), 0).toLocaleString()} Total Downloads
          </span>
        </div>
      </div>

      {/* Notes List */}
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">
            {searchQuery ? 'No notes found' : 'No notes uploaded yet'}
          </h3>
          <p className="text-gray-500 mt-2">
            {searchQuery 
              ? 'Try a different search term' 
              : 'Upload your first note to get started'}
          </p>
          {!searchQuery && (
            <Link to="/admin/upload-notes">
              <Button className="mt-6">
                Upload Notes
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Note Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{note.title}</h3>
                        {note.subject && (
                          <p className="text-sm text-gray-500 mt-1">
                            {note.subject.name} • Year {note.subject.year} • Sem {note.subject.semester}
                          </p>
                        )}
                        {note.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {note.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {note.unit && (
                            <Badge variant="secondary" className="text-xs">
                              {note.unit}
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500 flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {note.views || 0} views
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            {note.downloads || 0} downloads
                          </span>
                          <span className="text-xs text-gray-500">
                            {note.createdAt 
                              ? new Date(note.createdAt).toLocaleDateString()
                              : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Publish Toggle */}
                    <div className="flex items-center gap-2 mr-4">
                      <span className="text-sm text-gray-500">
                        {note.isPublished ? 'Published' : 'Draft'}
                      </span>
                      <Switch
                        checked={note.isPublished}
                        onCheckedChange={() => handleTogglePublish(note)}
                      />
                    </div>

                    {/* View Button */}
                    <a
                      href={note.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>

                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(note)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => setDeletingNote(note)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={() => setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Note title"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Unit (Optional)</label>
              <Input
                value={editUnit}
                onChange={(e) => setEditUnit(e.target.value)}
                placeholder="e.g., Unit 1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Brief description..."
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingNote(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={isSaving || !editTitle.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingNote} onOpenChange={() => setDeletingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Delete Note
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingNote?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeletingNote(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManageNotes;
