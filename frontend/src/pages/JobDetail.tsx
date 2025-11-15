import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building, MapPin, DollarSign, ArrowLeft, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
const BACKEND_URL="https://resume-dl1w.onrender.com/api"
export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadJob = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await axios.get(BACKEND_URL+`/jobs/${id}`);
      setJob(response.data);
    } catch (error) {
      toast({
        title: "Error loading job",
        description: error instanceof Error ? error.message : "Failed to load job details",
        variant: "destructive",
      });
      navigate("/jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [id]);


const formatSalary = (salaryRange?: { min?: number; max?: number }) => {
  if (!salaryRange || (salaryRange.min == null && salaryRange.max == null)) {
    return "Not specified";
  }
  const formatAmount = (amount?: number) => {
    if (amount == null || isNaN(amount)) return "N/A";
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${Math.round(amount / 1_000)}k`;
    return amount.toString();
  };

  const min = formatAmount(salaryRange.min);
  const max = formatAmount(salaryRange.max);

  if (salaryRange.min != null && salaryRange.max != null) {
    return `$${min} - $${max}`;
  }
  return salaryRange.min != null ? `$${min}` : `$${max}`;
};

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-2">Job not found</h2>
        <Button asChild>
          <Link to="/jobs">Back to Jobs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/jobs" className="inline-flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Jobs</span>
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{job.title}</CardTitle>
          <CardDescription>{job.company}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {job.location && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}

          {job.postedAt && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
            </div>
          )}

          {job.jobType && (
            <Badge variant="outline" className="uppercase">
              {job.jobType}
            </Badge>
          )}

          {job.experienceLevel && (
            <Badge variant="secondary" className="capitalize">
              {job.experienceLevel} level
            </Badge>
          )}

          {job.salaryRange && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{formatSalary(job.salaryRange)}</span>
            </div>
          )}

          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="whitespace-pre-wrap">{job.description}</p>
          </div>

          <div>
            <h3 className="font-semibold">Requirements</h3>
            <p className="whitespace-pre-wrap">{job.requirements}</p>
          </div>

          {(job.keywords?.length || 0) > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {job.keywords.map((keyword) => (
                  <Badge key={keyword} variant="default">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(job.requiredSkills?.length || 0) > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(job.preferredSkills?.length || 0) > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Preferred Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.preferredSkills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {job.applicationUrl && (
            <div>
              <a
                href={job.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-primary underline"
              >
                Apply Here <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          {job.contactEmail && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>Contact: {job.contactEmail}</span>
            </div>
          )}
        </CardContent>

        <div className="p-4 flex justify-end space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/jobs/${id}/edit`}>Edit Job</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
