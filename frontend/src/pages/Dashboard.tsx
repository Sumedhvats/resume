import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, type JobStats, type Resume, type Job } from '@/lib/api';
import { FileText, Briefcase, Upload, Plus, TrendingUp, Users, Building } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const Dashboard = () => {
  const [stats, setStats] = useState<JobStats | null>(null);
  const [recentResumes, setRecentResumes] = useState<Resume[]>([]);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, resumesData, jobsData] = await Promise.all([
          api.getJobStats(),
          api.getResumes(1, 5),
          api.getJobs(1, 5),
        ]);

        setStats(statsData);
        setRecentResumes(resumesData.data);
        setRecentJobs(jobsData.data);
      } catch (error) {
        toast({
          title: 'Error loading dashboard',
          description: error instanceof Error ? error.message : 'Failed to load data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [toast]);

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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage resumes, jobs, and track matching performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              Post Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">Active job postings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Full-time Jobs</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.jobTypes['full-time'] || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalJobs ? 
                `${Math.round(((stats.jobTypes['full-time'] || 0) / stats.totalJobs) * 100)}% of total` 
                : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentResumes.length}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded in last view
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Salary Range</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.averageSalary ? 
                `${Math.round(stats.averageSalary.min / 1000)}k-${Math.round(stats.averageSalary.max / 1000)}k` 
                : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Resumes</CardTitle>
            <CardDescription>
              Latest uploaded resumes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResumes.length > 0 ? (
                recentResumes.map((resume) => (
                  <div key={resume._id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{resume.originalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {resume.contactInfo.name || 'Unknown'} • {resume.keywords.length} keywords
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/resumes/${resume._id}`}>View</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No resumes uploaded yet</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/resumes">View All Resumes</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
            <CardDescription>
              Latest job postings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job._id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.company} • {job.jobType} • {job.experienceLevel}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/jobs/${job._id}`}>View</Link>
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No jobs posted yet</p>
              )}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link to="/jobs">View All Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};