const API_BASE_URL = 'https://resume-dl1w.onrender.com/api';

export interface Resume {
  _id: string;
  originalName: string;
  filename: string;
  keywords: string[];
  skills: string[];
  contactInfo: {
    email?: string;
    phone?: string;
    name?: string;
  };
  extractedText?: string;
  experience?: string;
  education?: string;
  matchHistory?: MatchHistoryItem[];
  uploadedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  location?: string;
  salaryRange?: {
    min: number;
    max: number;
  };
  keywords: string[];
  requiredSkills: string[];
  preferredSkills?: string[];
  isActive: boolean;
  postedAt: string;
}

export interface MatchHistoryItem {
  jobId: {
    _id: string;
    title: string;
    company: string;
  };
  score: number;
  matchedKeywords: string[];
  matchedAt: string;
}

export interface JobMatch {
  job: Job;
  score: number;
  matchedKeywords: string[];
  breakdown: {
    keywords: number;
    skills: number;
    textSimilarity: number;
    experienceLevel: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface JobStats {
  totalJobs: number;
  jobTypes: Record<string, number>;
  experienceLevels: Record<string, number>;
  averageSalary: {
    min: number;
    max: number;
  };
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Resume endpoints
  async uploadResume(file: File): Promise<{ message: string; resume: Resume }> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async getResumes(page = 1, limit = 10): Promise<PaginatedResponse<Resume>> {
    const data = await this.request<any>(`/resumes?page=${page}&limit=${limit}`);
    return {
      data: data.resumes,
      pagination: data.pagination,
    };
  }

  async getResume(id: string): Promise<Resume> {
    return this.request<Resume>(`/resumes/${id}`);
  }

  async deleteResume(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/resumes/${id}`, {
      method: 'DELETE',
    });
  }

  async matchResume(id: string, limit = 10): Promise<{
    resumeId: string;
    matches: JobMatch[];
  }> {
    return this.request<{
      resumeId: string;
      matches: JobMatch[];
    }>(`/resumes/${id}/match?limit=${limit}`, {
      method: 'POST',
    });
  }

  // Job endpoints
  async createJob(job: Omit<Job, '_id' | 'isActive' | 'postedAt'>): Promise<{
    message: string;
    job: Job;
  }> {
    return this.request<{ message: string; job: Job }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  async getJobs(
    page = 1,
    limit = 20,
    filters: {
      search?: string;
      jobType?: string;
      experienceLevel?: string;
      location?: string;
      company?: string;
    } = {}
  ): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value)
      ),
    });

    const data = await this.request<any>(`/jobs?${params}`);
    return {
      data: data.jobs,
      pagination: data.pagination,
    };
  }

  async getJob(id: string): Promise<Job> {
    return this.request<Job>(`/jobs/${id}`);
  }

  async updateJob(id: string, job: Partial<Job>): Promise<{
    message: string;
    job: Job;
  }> {
    return this.request<{ message: string; job: Job }>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(job),
    });
  }

  async deleteJob(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  async getJobStats(): Promise<JobStats> {
    return this.request<JobStats>('/jobs/stats');
  }

  async healthCheck(): Promise<{
    status: string;
    message: string;
    timestamp: string;
  }> {
    return this.request<{
      status: string;
      message: string;
      timestamp: string;
    }>('/health');
  }
}

export const api = new ApiClient();