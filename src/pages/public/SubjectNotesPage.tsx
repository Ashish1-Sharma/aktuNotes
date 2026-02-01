import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Download, 
  Eye, 
  FileText,
  Calendar,
  BookOpen
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  getSubjectById, 
  getNotesBySubject,
  getBranchById,
  incrementNoteViews,
  incrementNoteDownloads
} from '@/services/firestore';
import type { Subject, Note, Branch } from '@/types';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';


const SubjectNotesPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewNote, setPreviewNote] = useState<Note | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!subjectId) return;
      
      try {
        const subjectData = await getSubjectById(subjectId);
        
        if (!subjectData) {
          navigate('/');
          return;
        }
        
        setSubject(subjectData);
        
        // Fetch branch and notes in parallel
        const [branchData, notesData] = await Promise.all([
          getBranchById(subjectData.branch),
          getNotesBySubject(subjectId)
        ]);
        
        setBranch(branchData);
        setNotes(notesData);
      } catch (error) {
        console.error('Error fetching subject data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subjectId, navigate]);

  const handlePreview = async (note: Note) => {
    setPreviewNote(note);
    setIsPreviewOpen(true);
    
    // Increment views
    try {
      await incrementNoteViews(note.id);
      // Update local state
      setNotes(prev => prev.map(n => 
        n.id === note.id ? { ...n, views: n.views + 1 } : n
      ));
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleDownload = async (note: Note) => {
    // Increment downloads
    try {
      await incrementNoteDownloads(note.id);
      // Update local state
      setNotes(prev => prev.map(n => 
        n.id === note.id ? { ...n, downloads: n.downloads + 1 } : n
      ));
    } catch (error) {
      console.error('Error incrementing downloads:', error);
    }
    
    // Open download in new tab
    window.open(note.pdfUrl, '_blank');
  };

  const getYearName = (year: number) => {
    const names: Record<number, string> = {
      1: 'First Year',
      2: 'Second Year',
      3: 'Third Year',
      4: 'Fourth Year'
    };
    return names[year] || `Year ${year}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Subject not found</h2>
          <Link to="/">
            <Button className="mt-4">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            to={`/branch/${subject.branch}/year/${subject.year}`} 
            className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {getYearName(subject.year)}
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{subject.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                {branch && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {branch.name}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  {getYearName(subject.year)}
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  Semester {subject.semester}
                </Badge>
                {subject.code && (
                  <Badge variant="secondary" className="bg-white/20 text-white border-0">
                    {subject.code}
                  </Badge>
                )}
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-blue-100">
              <p className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                {notes.length} {notes.length === 1 ? 'Note' : 'Notes'} Available
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {notes.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No notes available yet</h3>
            <p className="text-gray-500 mt-2">Notes for this subject will be added soon!</p>
            <Link to={`/branch/${subject.branch}/year/${subject.year}`}>
              <Button className="mt-6" variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Subjects
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <Card key={note.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      <FileText className="h-5 w-5" />
                    </div>
                    {note.unit && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        Unit {note.unit}
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {note.title}
                  </h3>
                  
                  {note.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {note.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {note.views}
                    </span>
                    <span className="flex items-center">
                      <Download className="h-4 w-4 mr-1" />
                      {note.downloads}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {note.createdAt 
                        ? new Date(note.createdAt).toLocaleDateString()
                        : 'Recently'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handlePreview(note)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleDownload(note)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl h-[90vh] p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                {previewNote?.title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                {previewNote && (
                  <Button 
                    size="sm" 
                    onClick={() => handleDownload(previewNote)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 h-[calc(90vh-80px)] bg-gray-100">
            {previewNote?.pdfUrl ? (
              <iframe
                src={`${previewNote.pdfUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full"
                title={previewNote.title}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Unable to load preview</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SubjectNotesPage;
