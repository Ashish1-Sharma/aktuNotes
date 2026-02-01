import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen,
  TrendingUp,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getBranchesWithNotes, getDashboardStats } from '@/services/firestore';
import type { Branch } from '@/types';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

const HomePage = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalSubjects: 0,
    totalDownloads: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesData, dashboardStats] = await Promise.all([
          getBranchesWithNotes(),
          getDashboardStats()
        ]);
        setBranches(branchesData);
        setStats({
          totalNotes: dashboardStats.totalNotes,
          totalSubjects: dashboardStats.totalSubjects,
          totalDownloads: dashboardStats.totalDownloads
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Your B.Tech Study Companion
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Access comprehensive notes organized by branch, year, and semester. 
              Everything you need to excel in your engineering journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="#branches">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Notes
                </Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="outline" className="border-white text-blue-700 hover:bg-white/10">
                  Search Notes
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-200" />
              <p className="text-3xl font-bold">{stats.totalNotes}+</p>
              <p className="text-blue-200">Notes Available</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-200" />
              <p className="text-3xl font-bold">{stats.totalDownloads}+</p>
              <p className="text-blue-200">Total Downloads</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-200" />
              <p className="text-3xl font-bold">{stats.totalSubjects}+</p>
              <p className="text-blue-200">Subjects Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section id="branches" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Select Your Branch
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your engineering branch to access notes organized by year and semester
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : branches.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600">No notes available yet</h3>
              <p className="text-gray-500 mt-2">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {branches.map((branch) => {
                return (
                  <Link key={branch.id} to={`/branch/${branch.id}`}>
                    <div className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 hover:border-blue-500">
                      <h3 className="text-center text-lg font-semibold text-gray-900">
                        {branch.name}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default HomePage;