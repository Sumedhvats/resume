import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api, type Resume } from '@/lib/api';
import { 
  FileText, 
  Search, 
  Trash2, 
  Eye, 
  Zap, 
  Calendar,
  Mail,
  Phone,
  User
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export const ResumeList = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    loadResumes(currentPage);
  }, [currentPage]);

  const loadResumes = async (page: number) => {
    setLoading(true);
    try {
      const data = await api.getResumes(page, 10);
      setResumes(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast({
        title: 'Error loading resumes',
        description: error instanceof Error ? error.message : 'Failed to load resumes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, filename: string) => {
    if (!confirm(`Delete resume "${filename}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteResume(id);
      toast({
        title: 'Resume deleted',
        description: 'Resume has been successfully deleted',
      });
      loadResumes(currentPage);
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete resume',
        variant: 'destructive',
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality when backend supports it
    toast({
      title: 'Search coming soon',
      description: 'Resume search functionality will be available soon',
    });
  };

  const goToPage = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const filteredResumes = resumes.filter((resume) =>
    resume.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.contactInfo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.contactInfo.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    resume.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumes</h1>
          <p className="text-muted-foreground">
            Manage uploaded resumes and view match histories
          </p>
        </div>
        <Button asChild>
          <Link to="/upload">
            <FileText className="mr-2 h-4 w-4" />
            Upload Resume
          </Link>
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search resumes by name, email, skills, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Resumes</span>
            </div>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">With Matches</span>
            </div>
            <div className="text-2xl font-bold">
              {resumes.filter(r => r.matchHistory && r.matchHistory.length > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtered Results</span>
            </div>
            <div className="text-2xl font-bold">{filteredResumes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Resume List */}
      <div className="grid gap-4">
        {filteredResumes.length > 0 ? (
          filteredResumes.map((resume) => (
            <Card key={resume._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{resume.originalName}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          {resume.contactInfo.name && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{resume.contactInfo.name}</span>
                            </div>
                          )}
                          {resume.contactInfo.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{resume.contactInfo.email}</span>
                            </div>
                          )}
                          {resume.contactInfo.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-3 w-3" />
                              <span>{resume.contactInfo.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(resume.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Keywords and Skills */}
                    <div className="space-y-2">
                      {resume.keywords.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Keywords: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {resume.keywords.slice(0, 5).map((keyword) => (
                              <Badge key={keyword} variant="secondary" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                            {resume.keywords.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{resume.keywords.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {resume.skills.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-muted-foreground">Skills: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {resume.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {resume.skills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{resume.skills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Match History */}
                    {resume.matchHistory && resume.matchHistory.length > 0 && (
                      <div className="pt-2 border-t">
                        <span className="text-sm font-medium text-muted-foreground">
                          Latest Matches: 
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {resume.matchHistory.slice(0, 2).map((match) => (
                            <div key={match.jobId._id} className="text-xs bg-success/10 text-success px-2 py-1 rounded">
                              {match.jobId.title} ({match.score}% match)
                            </div>
                          ))}
                          {resume.matchHistory.length > 2 && (
                            <div className="text-xs text-muted-foreground px-2 py-1">
                              +{resume.matchHistory.length - 2} more matches
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/resumes/${resume._id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(resume._id, resume.originalName)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No resumes found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Upload your first resume to get started'}
                </p>
                {!searchTerm && (
                  <Button className="mt-4" asChild>
                    <Link to="/upload">Upload Resume</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'ghost'}
                size="sm"
                onClick={() => goToPage(page)}
                className={cn(
                  page === currentPage && 'bg-primary text-primary-foreground'
                )}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === pagination.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};