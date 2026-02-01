import { useEffect, useState } from 'react';
import { 
  Upload, 
  FileText, 
  Plus,
  X,
  Loader2,
  FolderPlus,
  BookPlus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  getAllBranches, 
  getSubjectsByBranchAndYear,
  addBranch,
  addSubject,
  addNote
} from '@/services/firestore';
import { uploadPDFToCloudinary, validatePDFFile } from '@/services/cloudinary';
import type { Branch, Subject } from '@/types';

const YEARS = [1, 2, 3, 4];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const AdminUpload = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Form States
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteUnit, setNoteUnit] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Dialog States
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');

  // Fetch branches on mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getAllBranches();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast.error('Failed to load branches');
      }
    };
    fetchBranches();
  }, []);

  // Fetch subjects when branch/year changes
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedBranch || !selectedYear) {
        setSubjects([]);
        return;
      }
      try {
        const data = await getSubjectsByBranchAndYear(selectedBranch, parseInt(selectedYear));
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, [selectedBranch, selectedYear]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validatePDFFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAddBranch = async () => {
    if (!newBranchName.trim() || !newBranchCode.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const id = await addBranch({
        name: newBranchName.trim(),
        code: newBranchCode.trim().toLowerCase(),
        description: ''
      });
      
      const newBranch: Branch = {
        id,
        name: newBranchName.trim(),
        code: newBranchCode.trim().toLowerCase()
      };
      
      setBranches([...branches, newBranch]);
      setSelectedBranch(id);
      setNewBranchName('');
      setNewBranchCode('');
      setIsAddBranchOpen(false);
      toast.success('Branch added successfully');
    } catch (error) {
      console.error('Error adding branch:', error);
      toast.error('Failed to add branch');
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !selectedBranch || !selectedYear || !selectedSemester) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const id = await addSubject({
        name: newSubjectName.trim(),
        code: newSubjectCode.trim() || undefined,
        branch: selectedBranch,
        year: parseInt(selectedYear),
        semester: parseInt(selectedSemester)
      });
      
      const newSubject: Subject = {
        id,
        name: newSubjectName.trim(),
        code: newSubjectCode.trim() || undefined,
        branch: selectedBranch,
        year: parseInt(selectedYear),
        semester: parseInt(selectedSemester)
      };
      
      setSubjects([...subjects, newSubject]);
      setSelectedSubject(id);
      setNewSubjectName('');
      setNewSubjectCode('');
      setIsAddSubjectOpen(false);
      toast.success('Subject added successfully');
    } catch (error) {
      console.error('Error adding subject:', error);
      toast.error('Failed to add subject');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBranch || !selectedYear || !selectedSemester || !selectedSubject) {
      toast.error('Please select branch, year, semester, and subject');
      return;
    }

    if (!noteTitle.trim()) {
      toast.error('Please enter a note title');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a PDF file');
      return;
    }

    setIsUploading(true);

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadPDFToCloudinary(selectedFile, 'notes');
      
      // Add note to Firestore
      await addNote({
        subjectId: selectedSubject,
        title: noteTitle.trim(),
        description: noteDescription.trim() || undefined,
        unit: noteUnit.trim() || undefined,
        pdfUrl: uploadResult.secure_url,
        isPublished: true
      });

      toast.success('Note uploaded successfully!');
      
      // Reset form
      setNoteTitle('');
      setNoteDescription('');
      setNoteUnit('');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('pdf-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error uploading note:', error);
      toast.error('Failed to upload note. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload Notes</h1>
        <p className="text-gray-500 mt-1">Add new notes to the platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branch Selection */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <FolderPlus className="h-5 w-5 mr-2 text-blue-600" />
                1. Select Branch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="branch">Branch</Label>
                <select
                  id="branch"
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setSelectedSubject('');
                  }}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name} ({branch.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <Dialog open={isAddBranchOpen} onOpenChange={setIsAddBranchOpen}>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Branch
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Branch</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="new-branch-name">Branch Name</Label>
                      <Input
                        id="new-branch-name"
                        placeholder="e.g., Computer Science"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-branch-code">Branch Code</Label>
                      <Input
                        id="new-branch-code"
                        placeholder="e.g., cse"
                        value={newBranchCode}
                        onChange={(e) => setNewBranchCode(e.target.value)}
                      />
                    </div>
                    <Button type="button" onClick={handleAddBranch} className="w-full">
                      Add Branch
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Year & Semester Selection */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <BookPlus className="h-5 w-5 mr-2 text-purple-600" />
                2. Select Year & Semester
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="year">Year</Label>
                  <select
                    id="year"
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(e.target.value);
                      setSelectedSubject('');
                    }}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!selectedBranch}
                  >
                    <option value="">Select year</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <select
                    id="semester"
                    value={selectedSemester}
                    onChange={(e) => {
                      setSelectedSemester(e.target.value);
                      setSelectedSubject('');
                    }}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!selectedYear}
                  >
                    <option value="">Select semester</option>
                    {SEMESTERS.map((sem) => (
                      <option key={sem} value={sem}>
                        Semester {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject Selection */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <BookPlus className="h-5 w-5 mr-2 text-green-600" />
              3. Select Subject
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!selectedSemester}
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name} {subject.code && `(${subject.code})`}
                  </option>
                ))}
              </select>
            </div>

            <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
              <DialogTrigger asChild>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  disabled={!selectedBranch || !selectedYear || !selectedSemester}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="new-subject-name">Subject Name</Label>
                    <Input
                      id="new-subject-name"
                      placeholder="e.g., Data Structures"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-subject-code">Subject Code (Optional)</Label>
                    <Input
                      id="new-subject-code"
                      placeholder="e.g., CS201"
                      value={newSubjectCode}
                      onChange={(e) => setNewSubjectCode(e.target.value)}
                    />
                  </div>
                  <Button type="button" onClick={handleAddSubject} className="w-full">
                    Add Subject
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Note Details */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <FileText className="h-5 w-5 mr-2 text-orange-600" />
              4. Note Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Note Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Unit 1 - Introduction to Data Structures"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit (Optional)</Label>
                <Input
                  id="unit"
                  placeholder="e.g., Unit 1"
                  value={noteUnit}
                  onChange={(e) => setNoteUnit(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Brief description of the notes..."
                value={noteDescription}
                onChange={(e) => setNoteDescription(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Upload className="h-5 w-5 mr-2 text-red-600" />
              5. Upload PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                id="pdf-file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="pdf-file" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  {selectedFile ? selectedFile.name : 'Click to upload PDF'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Maximum file size: 50MB
                </p>
              </label>
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setSelectedFile(null);
                    const input = document.getElementById('pdf-file') as HTMLInputElement;
                    if (input) input.value = '';
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove file
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload Note
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminUpload;
