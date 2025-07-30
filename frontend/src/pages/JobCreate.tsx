import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
const BACKEND_URL="http://localhost:5000/api"
const jobTypeOptions = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

const experienceLevelOptions = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
];

export function JobCreate() {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    location: "",
    salaryMin: "",
    salaryMax: "",
    salaryCurrency: "USD",
    jobType: "full-time",
    experienceLevel: "mid",
    keywords: "",
    requiredSkills: "",
    preferredSkills: "",
    applicationUrl: "",
    contactEmail: "",
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare payload for API
    const payload = {
      title: formData.title.trim(),
      company: formData.company.trim(),
      description: formData.description.trim(),
      requirements: formData.requirements.trim(),
      location: formData.location.trim() || undefined,
      salaryRange: {
        min: formData.salaryMin ? Number(formData.salaryMin) : undefined,
        max: formData.salaryMax ? Number(formData.salaryMax) : undefined,
        currency: formData.salaryCurrency,
      },
      jobType: formData.jobType,
      experienceLevel: formData.experienceLevel,
      keywords: formData.keywords ? formData.keywords.split(",").map(k => k.trim().toLowerCase()).filter(Boolean) : [],
      requiredSkills: formData.requiredSkills ? formData.requiredSkills.split(",").map(k => k.trim().toLowerCase()).filter(Boolean) : [],
      preferredSkills: formData.preferredSkills ? formData.preferredSkills.split(",").map(k => k.trim().toLowerCase()).filter(Boolean) : [],
      applicationUrl: formData.applicationUrl.trim() || undefined,
      contactEmail: formData.contactEmail.trim() || undefined,
    };

    setLoading(true);
    try {
      await axios.post(BACKEND_URL+"/jobs", payload);
      toast({
        title: "Job created!",
        description: `Job "${formData.title}" has been created successfully.`,
      });
      navigate("/jobs");
    } catch (error) {
      const msg = axios.isAxiosError(error) ? error.response?.data?.error || error.message : "Failed to create job";
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create Job Posting</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Job Title"
          required
        />
        <Input
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company Name"
          required
        />
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Job Description"
          rows={5}
          required
        />
        <Textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          placeholder="Requirements"
          rows={4}
          required
        />
        <Input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location (optional)"
        />

        <div className="flex space-x-4">
          <Input
            name="salaryMin"
            type="number"
            min="0"
            value={formData.salaryMin}
            onChange={handleChange}
            placeholder="Salary Min"
          />
          <Input
            name="salaryMax"
            type="number"
            min="0"
            value={formData.salaryMax}
            onChange={handleChange}
            placeholder="Salary Max"
          />
          <Input
            name="salaryCurrency"
            value={formData.salaryCurrency}
            onChange={handleChange}
            placeholder="Currency"
            maxLength={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            value={formData.jobType}
            onValueChange={(v) => handleSelectChange(v, "jobType")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              {jobTypeOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={formData.experienceLevel}
            onValueChange={(v) => handleSelectChange(v, "experienceLevel")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Experience Level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevelOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input
          name="keywords"
          value={formData.keywords}
          onChange={handleChange}
          placeholder="Keywords (comma separated)"
        />

        <Input
          name="requiredSkills"
          value={formData.requiredSkills}
          onChange={handleChange}
          placeholder="Required Skills (comma separated)"
        />

        <Input
          name="preferredSkills"
          value={formData.preferredSkills}
          onChange={handleChange}
          placeholder="Preferred Skills (comma separated)"
        />

        <Input
          name="applicationUrl"
          value={formData.applicationUrl}
          onChange={handleChange}
          placeholder="Application URL"
          type="url"
        />

        <Input
          name="contactEmail"
          type="email"
          value={formData.contactEmail}
          onChange={handleChange}
          placeholder="Contact Email"
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Create Job"}
        </Button>
      </form>
    </div>
  );
}
