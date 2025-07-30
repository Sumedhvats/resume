const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

class ResumeParser {
  static async parseFile(filePath, mimeType) {
    try {
      let extractedText = '';
      
      switch (mimeType) {
        case 'application/pdf':
          extractedText = await this.parsePDF(filePath);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          extractedText = await this.parseWord(filePath);
          break;
        case 'text/plain':
          extractedText = await this.parseText(filePath);
          break;
        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }

      const analysis = this.analyzeText(extractedText);
      
      return {
        extractedText,
        ...analysis
      };
    } catch (error) {
      console.error('Error parsing file:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  static async parsePDF(filePath) {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  }

  static async parseWord(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  static async parseText(filePath) {
    return await fs.readFile(filePath, 'utf8');
  }

  static analyzeText(text) {
    const lowercaseText = text.toLowerCase();
    
    const keywords = this.extractKeywords(lowercaseText);
    const skills = this.extractSkills(lowercaseText);
    const contactInfo = this.extractContactInfo(text);
    const experience = this.extractExperience(text);
    const education = this.extractEducation(text);

    return {
      keywords: [...new Set(keywords)],
      skills: [...new Set(skills)],
      contactInfo,
      experience,
      education
    };
  }

  static extractKeywords(text) {
    const commonKeywords = [
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
      'kotlin', 'scala', 'typescript', 'html', 'css', 'sql', 'r', 'matlab',
      'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
      'laravel', 'rails', 'jquery', 'bootstrap', 'tailwind',
      'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'cassandra',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'linux',
      'terraform', 'ansible', 'puppet', 'chef',
      'agile', 'scrum', 'kanban', 'ci/cd', 'tdd', 'bdd', 'microservices', 'api',
      'rest', 'graphql', 'machine learning', 'ai', 'data science', 'analytics',
      'project management', 'leadership', 'team lead', 'mentoring'
    ];

    const foundKeywords = [];
    commonKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        foundKeywords.push(keyword);
      }
    });

    return foundKeywords;
  }

  static extractSkills(text) {
    const technicalSkills = [
      'programming', 'development', 'software engineering', 'web development',
      'mobile development', 'database design', 'system administration',
      'network administration', 'cybersecurity', 'data analysis', 'testing',
      'debugging', 'problem solving', 'algorithm design', 'architecture'
    ];

    const foundSkills = [];
    technicalSkills.forEach(skill => {
      if (text.includes(skill)) {
        foundSkills.push(skill);
      }
    });

    return foundSkills;
  }

  static extractContactInfo(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/;
    const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;

    const email = text.match(emailRegex)?.[0] || null;
    const phone = text.match(phoneRegex)?.[0] || null;
    const name = text.match(nameRegex)?.[0] || null;

    return { email, phone, name };
  }

  static extractExperience(text) {
    const experienceSection = text.match(/experience[\s\S]*?(?=education|skills|$)/i);
    return experienceSection ? experienceSection[0].substring(0, 500) : null;
  }

  static extractEducation(text) {
    const educationSection = text.match(/education[\s\S]*?(?=experience|skills|$)/i);
    return educationSection ? educationSection[0].substring(0, 500) : null;
  }
}

module.exports = ResumeParser;
