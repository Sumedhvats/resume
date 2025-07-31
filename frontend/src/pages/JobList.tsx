import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api, type Job } from '@/lib/api';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Eye, 
  Edit,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  Users,
  Filter
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';


// Remove empty string from options — placeholders handled by SelectValue
const jobTypeOptions = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

const experienceLevelOptions = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior Level' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
];

export const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    experienceLevel: '',
    location: '',
    company: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    // Load filters from URL params
    const urlFilters = {
      search: searchParams.get('search') || '',
      jobType: searchParams.get('jobType') || '',
      experienceLevel: searchParams.get('experienceLevel') || '',
      location: searchParams.get('location') || '',
      company: searchParams.get('company') || '',
    };
    setFilters(urlFilters);
    loadJobs(currentPage, urlFilters);
  }, [currentPage]);

  const loadJobs = async (page: number, currentFilters = filters) => {
    setLoading(true);
    try {
      // Remove empty strings before API call to avoid invalid filters
      const cleanedFilters = Object.fromEntries(
        Object.entries(currentFilters).filter(([_, v]) => v !== '')
      );

      const data = await api.getJobs(page, pagination.limit, cleanedFilters);
      setJobs(data.data);
      setPagination(data.pagination);
    } catch (error) {
      toast({
        title: 'Error loading jobs',
        description: error instanceof Error ? error.message : 'Failed to load jobs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    // Allow empty string to clear filter
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL query params for bookmark/share
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) newSearchParams.set(k, v);
    });
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
    
    // Reload jobs starting from page 1
    loadJobs(1, newFilters);
  };

  const clearFilters = () => {
    const newFilters = {
      search: '',
      jobType: '',
      experienceLevel: '',
      location: '',
      company: '',
    };
    setFilters(newFilters);
    setSearchParams({ page: '1' });
    loadJobs(1, newFilters);
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.pages) return;
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    setSearchParams(newSearchParams);
  };

  const formatSalary = (salaryRange?: { min: number; max: number }) => {
    if (!salaryRange) return null;
    const formatAmount = (amount: number) => {
      if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
      if (amount >= 1000) return `${Math.round(amount / 1000)}k`;
      return amount.toString();
    };
    return `$${formatAmount(salaryRange.min)} - $${formatAmount(salaryRange.max)}`;
  };

  const getJobTypeColor = (jobType: string) => {
    const colors = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-green-100 text-green-800',
      'contract': 'bg-purple-100 text-purple-800',
      'internship': 'bg-orange-100 text-orange-800',
      'freelance': 'bg-pink-100 text-pink-800',
    };
    return colors[jobType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Title and Post Job Button */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">Browse and manage job postings</p>
        </div>
        <Button asChild>
          <Link to="/jobs/new">
            <Plus className="mr-2 h-4 w-4" />
            Post Job
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter Jobs</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search jobs..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              value={filters.jobType || ''}
              onValueChange={(value) => handleFilterChange('jobType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                {jobTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.experienceLevel || ''}
              onValueChange={(value) => handleFilterChange('experienceLevel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Experience Level" />
              </SelectTrigger>
              <SelectContent>
                {experienceLevelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Input
              placeholder="Company"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              className="max-w-xs"
            />

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Total Jobs</span>
            </div>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Full-time</span>
            </div>
            <div className="text-2xl font-bold">
              {jobs.filter(job => job.jobType === 'full-time').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Companies</span>
            </div>
            <div className="text-2xl font-bold">
              {new Set(jobs.map(job => job.company)).size}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtered</span>
            </div>
            <div className="text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Job List */}
      <div className="grid gap-4">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link 
                          to={`/jobs/${job._id}`}
                          className="text-xl font-semibold hover:text-primary transition-colors"
                        >
                          {job.title}
                        </Link>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <Building className="h-3 w-3" />
                            <span>{job.company}</span>
                          </div>
                          {job.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{job.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(job.postedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getJobTypeColor(job.jobType)}>
                          {job.jobType}
                        </Badge>
                        <Badge variant="outline">
                          {job.experienceLevel}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        {job.salaryRange && (
                          <div className="flex items-center space-x-1 text-sm">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{formatSalary(job.salaryRange)}</span>
                          </div>
                        )}
                        
                        {job.requiredSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {job.requiredSkills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.requiredSkills.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{job.requiredSkills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/jobs/${job._id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/jobs/${job._id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No jobs found</h3>
                <p className="text-muted-foreground">
                  {hasActiveFilters ? 'Try adjusting your filters' : 'Post your first job to get started'}
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/jobs/new">Post Job</Link>
                </Button>
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
            {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
              let page: number;
              if (pagination.pages > 5) {
                if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= pagination.pages - 2) {
                  page = pagination.pages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
              } else {
                page = i + 1;
              }
              return page;
            }).map((page) => (
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
