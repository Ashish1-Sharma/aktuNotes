import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Calendar, 
  BookOpen,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getBranchById, getAvailableYearsForBranch } from '@/services/firestore';
import type { Branch } from '@/types';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

// Year display names
const yearNames: Record<number, { name: string; subtitle: string }> = {
  1: { name: 'First Year', subtitle: 'Foundation & Basics' },
  2: { name: 'Second Year', subtitle: 'Core Subjects' },
  3: { name: 'Third Year', subtitle: 'Advanced Topics' },
  4: { name: 'Fourth Year', subtitle: 'Specialization' }
};

// Year colors
const yearColors: Record<number, string> = {
  1: 'from-green-500 to-emerald-600',
  2: 'from-blue-500 to-cyan-600',
  3: 'from-purple-500 to-violet-600',
  4: 'from-orange-500 to-red-600'
};

const BranchPage = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!branchId) return;
      
      try {
        const [branchData, availableYears] = await Promise.all([
          getBranchById(branchId),
          getAvailableYearsForBranch(branchId)
        ]);
        
        if (!branchData) {
          navigate('/');
          return;
        }
        
        setBranch(branchData);
        setYears(availableYears.sort((a, b) => a - b));
      } catch (error) {
        console.error('Error fetching branch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [branchId, navigate]);

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
          <Link to="/" className="inline-flex items-center text-blue-100 hover:text-white mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Branches
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{branch.name}</h1>
          <p className="text-blue-100 mt-2 text-lg">Select your year to browse notes</p>
        </div>
      </div>

      {/* Years Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {years.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No years available</h3>
            <p className="text-gray-500 mt-2">Notes for this branch will be added soon!</p>
            <Link to="/">
              <Button className="mt-6" variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {years.map((year) => {
              const yearInfo = yearNames[year] || { name: `Year ${year}`, subtitle: '' };
              const gradient = yearColors[year] || 'from-gray-500 to-slate-600';
              
              return (
                <Link key={year} to={`/branch/${branchId}/year/${year}`}>
                  <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-md overflow-hidden h-full">
                    <div className={`h-24 bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <GraduationCap className="h-12 w-12 text-white/80" />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {yearInfo.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {yearInfo.subtitle}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          Semesters available
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BranchPage;
