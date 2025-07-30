class JobMatcher {
  static calculateMatchScore(resume, job) {
    let score = 0;
    let totalPossibleScore = 0;
    const matchedKeywords = [];

    const weights = {
      keywords: 0.4,
      skills: 0.3,
      textSimilarity: 0.2,
      experienceLevel: 0.1
    };

    const keywordScore = this.calculateKeywordMatch(
      resume.keywords || [],
      job.keywords || [],
      matchedKeywords
    );
    score += keywordScore * weights.keywords;
    totalPossibleScore += 100 * weights.keywords;

    const skillsScore = this.calculateSkillsMatch(
      resume.skills || [],
      [...(job.requiredSkills || []), ...(job.preferredSkills || [])],
      matchedKeywords
    );
    score += skillsScore * weights.skills;
    totalPossibleScore += 100 * weights.skills;

    const textScore = this.calculateTextSimilarity(
      resume.extractedText || '',
      job.description + ' ' + job.requirements
    );
    score += textScore * weights.textSimilarity;
    totalPossibleScore += 100 * weights.textSimilarity;

    const expScore = this.calculateExperienceMatch(resume, job);
    score += expScore * weights.experienceLevel;
    totalPossibleScore += 100 * weights.experienceLevel;

    const finalScore = totalPossibleScore > 0 ? (score / totalPossibleScore) * 100 : 0;

    return {
      score: Math.round(finalScore * 100) / 100,
      matchedKeywords: [...new Set(matchedKeywords)],
      breakdown: {
        keywords: Math.round(keywordScore * 100) / 100,
        skills: Math.round(skillsScore * 100) / 100,
        textSimilarity: Math.round(textScore * 100) / 100,
        experienceLevel: Math.round(expScore * 100) / 100
      }
    };
  }

  static calculateKeywordMatch(resumeKeywords, jobKeywords, matchedKeywords) {
    if (!jobKeywords.length) return 0;

    let matches = 0;
    jobKeywords.forEach(jobKeyword => {
      if (resumeKeywords.some(resumeKeyword => 
        resumeKeyword.toLowerCase().includes(jobKeyword.toLowerCase()) ||
        jobKeyword.toLowerCase().includes(resumeKeyword.toLowerCase())
      )) {
        matches++;
        matchedKeywords.push(jobKeyword);
      }
    });

    return (matches / jobKeywords.length) * 100;
  }

  static calculateSkillsMatch(resumeSkills, jobSkills, matchedKeywords) {
    if (!jobSkills.length) return 0;

    let matches = 0;
    jobSkills.forEach(jobSkill => {
      if (resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(resumeSkill.toLowerCase())
      )) {
        matches++;
        matchedKeywords.push(jobSkill);
      }
    });

    return (matches / jobSkills.length) * 100;
  }

  static calculateTextSimilarity(resumeText, jobText) {
    const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const jobWords = new Set(jobText.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    
    const intersection = new Set([...resumeWords].filter(w => jobWords.has(w)));
    const union = new Set([...resumeWords, ...jobWords]);
    
    return union.size > 0 ? (intersection.size / union.size) * 100 : 0;
  }

  static calculateExperienceMatch(resume, job) {
    const experienceText = (resume.experience || '').toLowerCase();
    const yearsMatch = experienceText.match(/(\d+)\s*years?/);
    
    if (!yearsMatch) return 50;
    
    const years = parseInt(yearsMatch[1]);
    const jobLevel = job.experienceLevel || 'mid';
    
    const levelRanges = {
      'entry': [0, 2],
      'mid': [2, 5],
      'senior': [5, 10],
      'lead': [8, 15],
      'executive': [10, 30]
    };
    
    const [min, max] = levelRanges[jobLevel] || [0, 30];
    
    if (years >= min && years <= max) return 100;
    if (years < min) return Math.max(0, 100 - (min - years) * 20);
    if (years > max) return Math.max(0, 100 - (years - max) * 10);
    
    return 50;
  }

  static async findMatchingJobs(resumeId, limit = 10) {
    const Resume = require('../models/Resume');
    const Job = require('../models/Job');

    try {
      const resume = await Resume.findById(resumeId);
      if (!resume) {
        throw new Error('Resume not found');
      }

      const activeJobs = await Job.find({ isActive: true }).limit(50);
      const matches = [];

      activeJobs.forEach(job => {
        const matchResult = this.calculateMatchScore(resume, job);
        matches.push({
          job,
          score: matchResult.score,
          matchedKeywords: matchResult.matchedKeywords,
          breakdown: matchResult.breakdown
        });
      });

      return matches
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error finding matching jobs:', error);
      throw error;
    }
  }
}

module.exports = JobMatcher;
