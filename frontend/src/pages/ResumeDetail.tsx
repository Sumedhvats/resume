import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { api, type Resume, type JobMatch } from '@/lib/api';
import { 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Zap,
  ArrowLeft,
  Download,
  Target,
  TrendingUp,
  Briefcase,
  Star
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export const ResumeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      loadResume(id);
    }
  }, [id]);

  const loadResume = async (resumeId: string) => {
    setLoading(true);
    try {
      const resumeData = await api.getResume(resumeId);
      setResume(resumeData);
    } catch (error) {
      toast({
        title: 'Error loading resume',
        description: error instanceof Error ? error.message : 'Failed to load resume',
        variant: 'destructive',
      });
      navigate('/resumes');
    } finally {
      setLoading(false);
    }
  };

  const runMatching = async () => {
    if (!resume) return;

    setMatchingLoading(true);
    try {
      const matchData = await api.matchResume(resume._id, 10);
      setMatches(matchData.matches);
      
      // Refresh resume to get updated match history
      await loadResume(resume._id);
      
      toast({
        title: 'Matching complete',
        description: `Found ${matchData.matches.length} potential job matches`,
      });
    } catch (error) {
      toast({
        title: 'Matching failed',
        description: error instanceof Error ? error.message : 'Failed to match resume with jobs',
        variant: 'destructive',
      });
    } finally {
      setMatchingLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'outline';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2">Resume not found</h2>
        <Button asChild>
          <Link to="/resumes">Back to Resumes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/resumes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resumes
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{resume.originalName}</h1>
            <p className="text-muted-foreground">
              Uploaded on {new Date(resume.uploadedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" disabled>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={runMatching} disabled={matchingLoading}>
            {matchingLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Matching...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Find Matches
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Resume Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resume.contactInfo.name && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{resume.contactInfo.name}</span>
                </div>
              )}
              {resume.contactInfo.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{resume.contactInfo.email}</span>
                </div>
              )}
              {resume.contactInfo.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{resume.contactInfo.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills and Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Keywords</CardTitle>
              <CardDescription>
                Extracted from resume content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resume.skills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {resume.skills.map((skill) => (
                      <Badge key={skill} variant="default">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {resume.keywords.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {resume.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Experience and Education */}
          {(resume.experience || resume.education) && (
            <Card>
              <CardHeader>
                <CardTitle>Experience & Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resume.experience && (
                  <div>
                    <h4 className="font-medium mb-2">Experience</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {resume.experience}
                    </p>
                  </div>
                )}
                {resume.education && (
                  <div>
                    <h4 className="font-medium mb-2">Education</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {resume.education}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Match History and Current Matches */}
        <div className="space-y-6">
          {/* Current Matches */}
          {matches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Latest Matches</span>
                </CardTitle>
                <CardDescription>
                  {matches.length} jobs found
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {matches.slice(0, 5).map((match) => (
                  <div key={match.job._id} className="space-y-2 p-3 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link 
                          to={`/jobs/${match.job._id}`}
                          className="font-medium hover:text-primary transition-colors"
                        >
                          {match.job.title}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {match.job.company}
                        </p>
                      </div>
                      <Badge variant={getScoreBadgeVariant(match.score)}>
                        {Math.round(match.score)}%
                      </Badge>
                    </div>
                    
                    {match.matchedKeywords.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Matched Keywords:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {match.matchedKeywords.slice(0, 3).map((keyword) => (
                            <Badge key={keyword} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {match.matchedKeywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{match.matchedKeywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Keywords:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(match.breakdown.keywords)}`}>
                          {Math.round(match.breakdown.keywords)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Skills:</span>
                        <span className={`ml-1 font-medium ${getScoreColor(match.breakdown.skills)}`}>
                          {Math.round(match.breakdown.skills)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {matches.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center pt-2">
                    +{matches.length - 5} more matches
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Match History */}
          {resume.matchHistory && resume.matchHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Match History</span>
                </CardTitle>
                <CardDescription>
                  Previous matching results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {resume.matchHistory.slice(0, 5).map((match) => (
                  <div key={`${match.jobId._id}-${match.matchedAt}`} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <Link 
                        to={`/jobs/${match.jobId._id}`}
                        className="text-sm font-medium hover:text-primary transition-colors"
                      >
                        {match.jobId.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {match.jobId.company} • {new Date(match.matchedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getScoreBadgeVariant(match.score)} className="text-xs">
                      {Math.round(match.score)}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Resume Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Keywords</span>
                <span className="font-medium">{resume.keywords.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Skills</span>
                <span className="font-medium">{resume.skills.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Match History</span>
                <span className="font-medium">{resume.matchHistory?.length || 0}</span>
              </div>
              {resume.matchHistory && resume.matchHistory.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Best Match</span>
                  <span className="font-medium">
                    {Math.max(...resume.matchHistory.map(m => m.score))}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};