import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  BookOpen, 
  FolderOpen,
  ArrowRight,
  Layers
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  getBranchById, 
  getSubjectsByBranchAndYear,
  getAvailableSemestersForBranchYear 
} from '@/services/firestore';
import type { Branch, Subject } from '@/types';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

// Subject icon mapping (can be extended)
const subjectIcons: Record<string, React.ElementType> = {
  default: BookOpen
};

// Subject color mapping
const subjectColors = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-violet-500',
  'from-teal-500 to-cyan-500'
];

const YearPage = () => {
  const { branchId, year } = useParams<{ branchId: string; year: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [semesters, setSemesters] = useState<number[]>([]);
  const [activeSemester, setActiveSemester] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const yearNum = parseInt(year || '1', 10);

  useEffect(() => {
    const fetchData = async () => {
      if (!branchId || !year) return;
      
      try {
        const [branchData, allSubjects, availableSemesters] = await Promise.all([
          getBranchById(branchId),
          getSubjectsByBranchAndYear(branchId, yearNum),
          getAvailableSemestersForBranchYear(branchId, yearNum)
        ]);
        
        if (!branchData) {
          navigate('/');
          return;
        }
        
        setBranch(branchData);
        setSubjects(allSubjects);
        setSemesters(availableSemesters.sort((a: number, b: number) => a - b));
        
        // Set default active semester
        if (availableSemesters.length > 0) {
          setActiveSemester(availableSemesters[0].toString());
        }
      } catch (error) {
        console.error('Error fetching year data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [branchId, year, yearNum, navigate]);

  const getFilteredSubjects = (semester: string) => {
    if (semester === 'all') return subjects;
    return subjects.filter(s => s.semester === parseInt(semester, 10));
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

  if (!branch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Branch not found</h2>
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
            to={`/branch/${branchId}`} 
            className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {branch.name}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{getYearName(yearNum)}</h1>
          <p className="text-blue-100 mt-2 text-lg">
            {branch.name} - Select a subject to view notes
          </p>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {subjects.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No subjects available</h3>
            <p className="text-gray-500 mt-2">Notes for this year will be added soon!</p>
            <Link to={`/branch/${branchId}`}>
              <Button className="mt-6" variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Years
              </Button>
            </Link>
          </div>
        ) : (
          <Tabs value={activeSemester} onValueChange={setActiveSemester} className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                Available Subjects
              </h2>
              <TabsList className="bg-white border shadow-sm">
                {semesters.map((sem) => (
                  <TabsTrigger 
                    key={sem} 
                    value={sem.toString()}
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    Sem {sem}
                  </TabsTrigger>
                ))}
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  All
                </TabsTrigger>
              </TabsList>
            </div>

            {semesters.map((semester) => (
              <TabsContent key={semester} value={semester.toString()} className="mt-0">
                <SubjectsGrid 
                  subjects={getFilteredSubjects(semester.toString())} 
                  semester={semester}
                />
              </TabsContent>
            ))}

            <TabsContent value="all" className="mt-0">
              <SubjectsGrid subjects={subjects} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
};

// Subjects Grid Component
interface SubjectsGridProps {
  subjects: Subject[];
  semester?: number;
}

const SubjectsGrid = ({ subjects }: SubjectsGridProps) => {
  if (subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">No subjects available for this semester</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {subjects.map((subject, index) => {
        const Icon = subjectIcons.default;
        const gradient = subjectColors[index % subjectColors.length];
        
        return (
          <Link key={subject.id} to={`/subject/${subject.id}/notes`}>
            <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md overflow-hidden h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {subject.name}
                </h3>
                
                {subject.code && (
                  <p className="text-sm text-gray-500 mt-1 uppercase tracking-wide">
                    {subject.code}
                  </p>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm text-gray-500 flex items-center">
                    <Layers className="h-4 w-4 mr-1" />
                    Sem {subject.semester}
                  </span>
                  <span className="text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    View Notes
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};

export default YearPage;
