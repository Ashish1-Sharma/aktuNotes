import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Layers, 
  FileText, 
  TrendingUp, 
  Eye, 
  Download,
  ArrowUpRight,
  Plus,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDashboardStats } from '@/services/firestore';
import type { DashboardStats } from '@/types';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Branches',
      value: stats?.totalBranches || 0,
      icon: Layers,
      color: 'from-blue-500 to-cyan-500',
      link: '/admin/upload-notes'
    },
    {
      title: 'Total Subjects',
      value: stats?.totalSubjects || 0,
      icon: BookOpen,
      color: 'from-purple-500 to-pink-500',
      link: '/admin/upload-notes'
    },
    {
      title: 'Total Notes',
      value: stats?.totalNotes || 0,
      icon: FileText,
      color: 'from-green-500 to-emerald-500',
      link: '/admin/manage-notes'
    },
    {
      title: 'Total Downloads',
      value: stats?.totalDownloads || 0,
      icon: Download,
      color: 'from-orange-500 to-red-500',
      link: '/admin/manage-notes'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your notes platform</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/upload-notes">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Upload Notes
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} to={card.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border-0 shadow-md overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {isLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                        ) : (
                          card.value.toLocaleString()
                        )}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Notes */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Trending Notes
                </CardTitle>
              </div>
              <Link to="/admin/manage-notes">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : stats?.trendingNotes && stats.trendingNotes.length > 0 ? (
                <div className="space-y-4">
                  {stats.trendingNotes.slice(0, 5).map((note, index) => (
                    <div
                      key={note.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{note.title}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {note.views}
                            </span>
                            <span className="flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              {note.downloads}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link to={`/admin/manage-notes`}>
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No trending notes yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Upload notes to see them here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/admin/upload-notes">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload New Notes
                </Button>
              </Link>
              <Link to="/admin/manage-notes">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage All Notes
                </Button>
              </Link>
              <Link to="/" target="_blank">
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public Website
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card className="border-0 shadow-md mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Platform Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Views</span>
                <span className="font-semibold">
                  {isLoading ? '-' : (stats?.totalViews || 0).toLocaleString()}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Avg. Downloads/Note</span>
                <span className="font-semibold">
                  {isLoading || !stats || stats.totalNotes === 0
                    ? '-'
                    : Math.round(stats.totalDownloads / stats.totalNotes)}
                </span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Published Notes</span>
                <span className="font-semibold">
                  {isLoading ? '-' : (stats?.totalNotes || 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
