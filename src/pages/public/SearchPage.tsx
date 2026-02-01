import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  FileText,
  ArrowRight,
  X,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchNotes } from '@/services/firestore';
import type { Note, Subject } from '@/types';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setNotes([]);
      setSubjects([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = await searchNotes(searchTerm);
      setNotes(results.notes);
      setSubjects(results.subjects);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      setSearchQuery(query.trim());
      performSearch(query.trim());
    }
  };

  const clearSearch = () => {
    setQuery('');
    setSearchQuery('');
    setNotes([]);
    setSubjects([]);
    setHasSearched(false);
    setSearchParams({});
  };

  const totalResults = notes.length + subjects.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
            Search Notes
          </h1>
          <p className="text-blue-100 text-center mb-8">
            Find notes by subject name, topic, or keywords
          </p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for subjects, topics, or notes..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 pr-12 py-6 text-lg bg-white text-gray-900 border-0 shadow-xl rounded-xl"
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <Button 
              type="submit" 
              className="mt-4 w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!hasSearched ? (
          // Initial State
          <div className="text-center py-16">
            <Search className="h-20 w-20 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Start Your Search
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a subject name, topic, or keyword above to find relevant notes for your studies.
            </p>
            
            {/* Popular Suggestions */}
            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Data Structures', 'Algorithms', 'Database', 'Networks', 'Operating Systems'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setQuery(term);
                      setSearchParams({ q: term });
                      setSearchQuery(term);
                      performSearch(term);
                    }}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : isLoading ? (
          // Loading State
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          </div>
        ) : totalResults === 0 ? (
          // No Results
          <div className="text-center py-16">
            <BookOpen className="h-20 w-20 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              No results found
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              We couldn't find any notes matching "{searchQuery}". 
              Try different keywords or check your spelling.
            </p>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={clearSearch}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          // Results Found
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Search Results
              </h2>
              <p className="text-gray-500">
                {totalResults} {totalResults === 1 ? 'result' : 'results'} for "{searchQuery}"
              </p>
            </div>

            {/* Subjects Results */}
            {subjects.length > 0 && (
              <div className="mb-10">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                  Subjects ({subjects.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map((subject) => (
                    <Link key={subject.id} to={`/subject/${subject.id}/notes`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {subject.name}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  Year {subject.year}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  Sem {subject.semester}
                                </Badge>
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Results */}
            {notes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Notes ({notes.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.map((note) => (
                    <Link key={note.id} to={`/subject/${note.subjectId}/notes`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {note.title}
                              </h4>
                              {note.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                  {note.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                {note.unit && (
                                  <Badge variant="secondary" className="text-xs">
                                    Unit {note.unit}
                                  </Badge>
                                )}
                                <span>{note.downloads} downloads</span>
                              </div>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center ml-3 group-hover:bg-blue-600 transition-colors">
                              <ArrowRight className="h-5 w-5 text-blue-600 group-hover:text-white transition-colors" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchPage;
