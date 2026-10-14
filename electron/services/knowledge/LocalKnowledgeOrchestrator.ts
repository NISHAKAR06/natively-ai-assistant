import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { app } from 'electron';
import { extractSafeDocumentText } from '../SafeDocumentTextExtractor';
import { RoleInsightService } from './RoleInsightService';

export enum DocType {
  RESUME = 'resume',
  JD = 'jd',
}

interface ProfileIdentity {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  totalExperienceYears?: number;
  github?: string;
  linkedin?: string;
  website?: string;
}

interface ProfileExperience {
  role: string;
  company: string;
  duration?: string;
  highlights: string[];
}

interface ProfileProject {
  name: string;
  description: string;
  technologies: string[];
  highlights: string[];
}

interface ProfileEducation {
  degree: string;
  field: string;
  institution: string;
}

interface StructuredResume {
  identity: ProfileIdentity;
  experience: ProfileExperience[];
  skills: any;
  skillsFlat: string[];
  projects: ProfileProject[];
  education: ProfileEducation[];
  githubRepositories?: any[];
  githubSyncStatus?: { syncedAt?: string; repoCount: number };
  _extraction_mode?: 'heuristic' | 'llm';
}

interface StructuredJD {
  title: string;
  role: string;
  company: string;
  description_summary: string;
  requirements: string[];
  skills: string[];
}

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP',
  'Swift', 'Kotlin', 'SQL', 'HTML', 'CSS', 'React', 'React Native', 'Next.js', 'Vue', 'Angular',
  'Node.js', 'Express', 'NestJS', 'Django', 'FastAPI', 'Flask', 'Spring Boot', 'GraphQL',
  'REST APIs', 'Microservices', 'PostgreSQL', 'MySQL', 'SQLite', 'MongoDB', 'Redis',
  'Cassandra', 'DynamoDB', 'Elasticsearch', 'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'Terraform', 'CI/CD', 'Git', 'Linux', 'Kafka', 'RabbitMQ', 'PyTorch', 'TensorFlow',
  'Scikit-learn', 'Pandas', 'NumPy', 'Machine Learning', 'Deep Learning', 'LLMs', 'RAG',
  'System Design', 'Unit Testing', 'Tailwind', 'Redux', 'Electron'
];

export function cleanAndNormalizeSkills(input: any): { categories: Record<string, string[]>; skillsFlat: string[] } {
  const categories: Record<string, string[]> = {};
  const flatSet = new Set<string>();
  let currentCategory = 'Languages';

  let rawList: string[] = [];
  if (Array.isArray(input)) {
    rawList = input.map(String);
  } else if (typeof input === 'string') {
    rawList = input.split(/[\r\n,]+/);
  } else if (typeof input === 'object' && input !== null) {
    for (const [cat, list] of Object.entries(input)) {
      if (Array.isArray(list)) {
        for (const item of list) {
          rawList.push(`${cat}: ${item}`);
        }
      }
    }
  }

  const KNOWN_CATEGORIES: Record<string, string[]> = {
    'Languages': ['python', 'sql', 'typescript', 'javascript', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'c', 'html', 'css'],
    'ML & Deep Learning': ['pytorch', 'scikit-learn', 'tensorflow', 'xgboost', 'random forest', 'isolation forest', 'transformer', 'pandas', 'numpy', 'keras', 'opencv', 'cuda', 'bert', 'llm', 'deep learning', 'machine learning'],
    'GenAI & LLM Systems': ['rag', 'hybrid retrieval', 'langchain', 'langgraph', 'agentic ai', 'speech-to-text/tts', 'embeddings', 'vector search', 'prompt engineering', 'fastembed', 'groq', 'llamaindex', 'gemini'],
    'Backend & MLOps': ['fastapi', 'flask', 'django', 'django rest', 'websockets', 'jwt/rbac', 'alembic', 'pytest', 'docker', 'ci/cd', 'kubernetes', 'rest apis', 'microservices', 'git', 'linux', 'node.js', 'express'],
    'Database': ['postgresql', 'chromadb', 'mongodb', 'redis', 'mysql', 'sqlite', 'vector db', 'elasticsearch'],
    'Professional': ['problem solving', 'technical communication', 'customer support', 'cross-functional collaboration', 'system design', 'team leadership', 'agile']
  };

  for (const raw of rawList) {
    if (!raw || typeof raw !== 'string') continue;
    let text = raw.trim();
    if (!text) continue;

    let hasExplicitCat = false;
    const catMatch = text.match(/^([A-Za-z0-9\s&/_+-]+):\s*(.*)$/);
    if (catMatch) {
      currentCategory = catMatch[1].trim();
      text = catMatch[2].trim();
      hasExplicitCat = true;
    }

    const parts = text.split(/,\s*/);
    for (let part of parts) {
      part = part.trim()
        .replace(/^\s*[•\-*]\s*/, '')
        .replace(/\s*\([^)]*\)\s*$/, '')
        .trim();
      if (!part || part.length < 2) continue;

      flatSet.add(part);

      let targetCat = currentCategory;
      if (!hasExplicitCat || targetCat === 'Languages' || targetCat === 'General') {
        const lower = part.toLowerCase();
        for (const [catName, members] of Object.entries(KNOWN_CATEGORIES)) {
          for (const m of members) {
            if (lower === m || (m.length > 2 && lower.includes(m)) || (m.length <= 2 && lower === m)) {
              targetCat = catName;
              break;
            }
          }
        }
      }

      if (!categories[targetCat]) {
        categories[targetCat] = [];
      }
      if (!categories[targetCat].includes(part)) {
        categories[targetCat].push(part);
      }
    }
  }

  return { categories, skillsFlat: Array.from(flatSet) };
}

export class LocalKnowledgeOrchestrator {
  public activeResume: {
    id: number;
    file_path: string;
    file_name: string;
    raw_text: string;
    structured_data: StructuredResume;
  } | null = null;

  public activeJD: {
    id: number;
    file_path: string;
    file_name: string;
    raw_text: string;
    structured_data: StructuredJD;
  } | null = null;

  private knowledgeMode = true;
  private storagePath: string;
  private roleInsightService: RoleInsightService;

  constructor(private dbOrHandle?: any) {
    this.roleInsightService = new RoleInsightService(() => this);
    try {
      this.storagePath = path.join(app.getPath('userData'), 'profile_knowledge.json');
    } catch {
      const baseDir = process.env.APPDATA || process.env.HOME || os.tmpdir();
      this.storagePath = path.join(baseDir, 'natively', 'profile_knowledge.json');
    }
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.storagePath)) {
        const raw = fs.readFileSync(this.storagePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.activeResume) {
          this.activeResume = parsed.activeResume;
          if (
            (this.activeResume?.structured_data?.identity?.name === 'Page 1' ||
             !this.activeResume?.structured_data?.projects?.length) &&
            this.activeResume?.raw_text
          ) {
            console.log('[LocalKnowledgeOrchestrator] Upgrading resume cache with advanced parsing...');
            const fixed = this.parseResumeTextAdvanced(
              this.activeResume.raw_text,
              this.activeResume.file_name || 'Resume'
            );
            this.activeResume.structured_data = fixed;
            this.saveToDisk();
          }

          if (this.activeResume?.structured_data) {
            const sd = this.activeResume.structured_data;
            let needsSave = false;

            // Auto-clean messy or uncategorized skills
            const rawSkills = Array.isArray(sd.skills) ? sd.skills : (sd.skillsFlat || []);
            const hasMessySkills = rawSkills.some((s: string) => typeof s === 'string' && (s.includes(': ') || s.includes('(')));
            const hasUncategorizedSkills = Array.isArray(sd.skills);
            if (hasMessySkills || hasUncategorizedSkills) {
              console.log('[LocalKnowledgeOrchestrator] Cleaning and categorizing cached resume skills...');
              const cleaned = cleanAndNormalizeSkills(sd.skillsFlat && sd.skillsFlat.length > 0 ? sd.skillsFlat : sd.skills);
              sd.skills = cleaned.categories;
              sd.skillsFlat = cleaned.skillsFlat;
              needsSave = true;
            }

            // Ensure github repositories have selected flag initialized
            if (Array.isArray(sd.githubRepositories)) {
              const resumeLower = (this.activeResume.raw_text || '').toLowerCase().replace(/[-_]/g, '');
              for (const r of sd.githubRepositories) {
                if (typeof r.selected !== 'boolean') {
                  const norm = (r.name || '').toLowerCase().replace(/[-_]/g, '');
                  const matches = resumeLower.includes(norm) || ['threshold', 'healthforecast', 'intel', 'dealerdesk', 'voicefusion', 'mediquery'].some(k => norm.includes(k));
                  r.selected = matches || true;
                  needsSave = true;
                }
              }
            }

            if (needsSave) {
              this.saveToDisk();
            }
          }
        }
        if (parsed.activeJD) this.activeJD = parsed.activeJD;
        if (typeof parsed.knowledgeMode === 'boolean') this.knowledgeMode = parsed.knowledgeMode;
        console.log('[LocalKnowledgeOrchestrator] Loaded profile from disk:', {
          hasResume: Boolean(this.activeResume),
          hasJD: Boolean(this.activeJD),
        });
      }
    } catch (err) {
      console.warn('[LocalKnowledgeOrchestrator] Could not load profile cache:', err);
    }
  }

  private saveToDisk(): void {
    try {
      const data = {
        activeResume: this.activeResume,
        activeJD: this.activeJD,
        knowledgeMode: this.knowledgeMode,
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn('[LocalKnowledgeOrchestrator] Could not persist profile cache:', err);
    }
  }

  public async ingestDocument(
    filePath: string,
    docType: DocType | string
  ): Promise<{ success: boolean; document?: any; error?: string }> {
    try {
      console.log(`[LocalKnowledgeOrchestrator] Ingesting ${docType} from: ${filePath}`);
      const extracted = await extractSafeDocumentText(filePath);
      const content = extracted.content || '';
      const fileName = path.basename(filePath);

      if (!content.trim()) {
        return { success: false, error: 'Document appears to be empty or unreadable.' };
      }

      const isResume = String(docType).toLowerCase().includes('resume');

      if (isResume) {
        let structured: StructuredResume | null = null;
        try {
          structured = await this.parseWithOllama(content, true);
        } catch (e) {
          console.warn('[LocalKnowledgeOrchestrator] Ollama extraction error:', e);
        }
        if (!structured || !structured.identity?.name || structured.identity.name.toLowerCase() === 'page 1') {
          structured = this.parseResumeTextAdvanced(content, fileName);
        }
        this.activeResume = {
          id: 1,
          file_path: filePath,
          file_name: fileName,
          raw_text: content,
          structured_data: structured,
        };
        this.saveToDisk();
        this.indexIntoLocalRAG('resume', content, fileName);
        return { success: true, document: { id: 1, type: DocType.RESUME, name: fileName } };
      } else {
        let structured: StructuredJD | null = null;
        try {
          structured = await this.parseWithOllama(content, false);
        } catch (e) {
          console.warn('[LocalKnowledgeOrchestrator] Ollama JD extraction error:', e);
        }
        if (!structured || !structured.title) {
          structured = this.parseJdText(content, fileName);
        }
        this.activeJD = {
          id: 2,
          file_path: filePath,
          file_name: fileName,
          raw_text: content,
          structured_data: structured,
        };
        this.saveToDisk();
        this.indexIntoLocalRAG('jd', content, fileName);
        return { success: true, document: { id: 2, type: DocType.JD, name: fileName } };
      }
    } catch (error: any) {
      console.error('[LocalKnowledgeOrchestrator] Ingest failed:', error);
      return { success: false, error: error.message || 'Failed to parse document' };
    }
  }

  private async parseWithOllama(text: string, isResume: boolean): Promise<any | null> {
    try {
      const prompt = isResume
        ? `You are an expert resume parsing engine. Extract candidate details from this resume text into JSON strictly conforming to this schema:
{
  "identity": {
    "name": "Full Name",
    "role": "Current or Target Title",
    "email": "Email address",
    "phone": "Phone number",
    "location": "City, Country",
    "summary": "2-3 sentence executive professional summary of their expertise",
    "totalExperienceYears": number
  },
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "duration": "Duration (e.g. Aug 2026 - Present)",
      "highlights": ["bullet 1", "bullet 2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "Short project description",
      "technologies": ["tech 1", "tech 2"],
      "highlights": ["bullet 1", "bullet 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree (e.g. B.Tech in Artificial Intelligence and Machine Learning)",
      "field": "Field of Study",
      "institution": "University / College Name"
    }
  ],
  "skills": ["Skill 1", "Skill 2"]
}

Resume Text:
${text.slice(0, 8000)}`
        : `You are an expert job description parser. Extract job details from this job description text into JSON strictly conforming to this schema:
{
  "title": "Job Title",
  "role": "Role Title",
  "company": "Company Name",
  "description_summary": "Summary of role and mission",
  "requirements": ["requirement 1", "requirement 2"],
  "skills": ["Skill 1", "Skill 2"]
}

Job Description Text:
${text.slice(0, 8000)}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const res = await fetch('http://127.0.0.1:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: 'qwen2.5-coder:7b',
          prompt,
          format: 'json',
          stream: false,
          options: { temperature: 0.1, num_predict: 2048 }
        })
      });
      clearTimeout(timeout);

      if (!res.ok) return null;
      const body: any = await res.json();
      if (!body?.response) return null;
      const parsed = JSON.parse(body.response);
      if (isResume && parsed.identity?.name && parsed.identity.name.toLowerCase() !== 'page 1') {
        const cleaned = cleanAndNormalizeSkills(parsed.skills);
        parsed.skills = cleaned.categories;
        parsed.skillsFlat = cleaned.skillsFlat;
        parsed._extraction_mode = 'llm';
        return parsed;
      }
      if (!isResume && parsed.title) {
        return parsed;
      }
    } catch (err: any) {
      console.warn('[LocalKnowledgeOrchestrator] Ollama extraction skipped (fallback to rules):', err?.message || err);
    }
    return null;
  }

  private parseResumeTextAdvanced(text: string, fallbackFileName: string): StructuredResume {
    const cleanText = text.replace(/\[Page \d+\]/g, '').trim();
    const lines = cleanText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    // 1. Name: First line that is 2-40 chars, does not contain @, http, .com, +91, |, page, resume, curriculum
    let name = '';
    for (let i = 0; i < Math.min(8, lines.length); i++) {
      const line = lines[i];
      const lower = line.toLowerCase();
      if (
        line.length >= 2 &&
        line.length <= 45 &&
        !line.includes('@') &&
        !line.includes('http') &&
        !line.includes('.com') &&
        !line.includes('+') &&
        !line.includes('|') &&
        !lower.startsWith('page ') &&
        !lower.includes('curriculum') &&
        !lower.includes('resume') &&
        !lower.includes('summary') &&
        !lower.includes('experience')
      ) {
        name = line.replace(/[^\w\s.-]/g, '').trim();
        break;
      }
    }
    if (!name) {
      name = path.parse(fallbackFileName).name.replace(/[-_]/g, ' ');
    }

    // 2. Email, phone, location
    const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch ? emailMatch[0] : undefined;

    const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91\s*\d{10}/);
    const phone = phoneMatch ? phoneMatch[0] : undefined;

    const locationMatch = cleanText.match(/(?:^|\n|[|•])\s*([A-Za-z\s]+,\s*(?:India|USA|UK|Canada|Germany|Singapore|Australia|[A-Z]{2}))/);
    const location = locationMatch ? locationMatch[1].trim() : undefined;

    // 3. Section segmentation
    const sections: Record<string, string[]> = {};
    let curSection = 'header';
    const sectionKeywords = [
      'summary', 'objective', 'about', 'experience', 'work experience', 'employment',
      'projects', 'personal projects', 'skills', 'technical skills', 'education',
      'achievements', 'certifications', 'awards'
    ];

    for (const line of lines) {
      const lower = line.toLowerCase().replace(/[:—–-]/g, '').trim();
      const matchedSec = sectionKeywords.find((sk) => lower === sk);
      if (matchedSec) {
        curSection = matchedSec.includes('exp') ? 'experience'
          : matchedSec.includes('proj') ? 'projects'
          : matchedSec.includes('skill') ? 'skills'
          : matchedSec.includes('edu') ? 'education'
          : matchedSec.includes('summary') || matchedSec.includes('about') || matchedSec.includes('obj') ? 'summary'
          : matchedSec;
        sections[curSection] = [];
      } else {
        if (!sections[curSection]) sections[curSection] = [];
        sections[curSection].push(line);
      }
    }

    // 4. Summary extraction
    let summary = '';
    const summaryLines = sections['summary'] || [];
    if (summaryLines.length > 0) {
      summary = summaryLines.filter((l) => !l.includes('@') && !l.includes('http') && !l.includes('.com')).join(' ');
    }
    if (!summary) {
      for (const line of lines.slice(1, 10)) {
        if (line.length > 50 && !line.includes('@') && !line.includes('http') && !line.includes('.com') && !line.includes('|')) {
          summary = line;
          break;
        }
      }
    }

    // 5. Experience extraction
    const expLines = sections['experience'] || [];
    const expList: ProfileExperience[] = [];
    let curExp: ProfileExperience | null = null;
    for (const l of expLines) {
      if (l.startsWith('•') || l.startsWith('-') || l.startsWith('*')) {
        if (curExp) curExp.highlights.push(l);
      } else if (l.includes('—') || l.includes('–') || l.includes(' - ') || /\b(intern|engineer|developer|lead|analyst|consultant)\b/i.test(l)) {
        const parts = l.split(/[—–]|\s+-\s+/);
        const company = (parts[0] || 'Company').trim();
        const rawRole = (parts[1] || 'Software Professional').replace(/\(.*?\)/, '').trim();
        const role = rawRole.replace(/\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}).*/i, '').trim();
        const durationMatch = l.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})\s*[\d\s–—-]+(?:Present|\d{4})/i);
        curExp = {
          company,
          role,
          duration: durationMatch ? durationMatch[0].trim() : undefined,
          highlights: [],
        };
        expList.push(curExp);
      }
    }

    // 6. Projects extraction
    const projLines = sections['projects'] || [];
    const projList: ProfileProject[] = [];
    let curProj: ProfileProject | null = null;
    for (const l of projLines) {
      if (l.startsWith('•') || l.startsWith('-') || l.startsWith('*')) {
        if (curProj) curProj.highlights.push(l);
      } else if (l.includes('—') || l.includes('–') || l.includes('|') || l.includes(' - ')) {
        const parts = l.split(/[—–|]|\s+-\s+/);
        const pName = (parts[0] || 'Project').trim();
        const pDesc = (parts[1] || '').trim();
        const pTech = (parts[2] || '').split(/[,|]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 25);
        curProj = {
          name: pName,
          description: pDesc,
          technologies: pTech,
          highlights: [],
        };
        projList.push(curProj);
      }
    }

    // 7. Education extraction
    const eduLines = sections['education'] || [];
    const eduList: ProfileEducation[] = [];
    if (eduLines.length > 0) {
      const inst = eduLines[0] || 'University';
      const degLine = eduLines[1] || eduLines[0] || '';
      const degMatch = degLine.match(/(B\.Tech|B\.E|B\.S|Bachelor|M\.Tech|M\.S|Master|Ph\.D)[^—,\n]*/i);
      const degree = degMatch ? degMatch[0].trim() : 'Degree';
      const fieldMatch = degLine.match(/\bin\s+([^—,\n]+)/i);
      const field = fieldMatch ? fieldMatch[1].trim() : 'Engineering';
      eduList.push({
        institution: inst,
        degree,
        field,
      });
    }

    // 8. Skills extraction
    const foundSkills = new Set<string>();
    for (const skill of COMMON_SKILLS) {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(cleanText)) {
        foundSkills.add(skill);
      }
    }
    const skillsList = Array.from(foundSkills);

    // 9. Role heuristic
    let role = expList[0]?.role || '';
    if (!role || role === 'Software Professional') {
      const roleKeywords = [
        'AI/ML Engineer', 'AI & Data Science Intern', 'Machine Learning Engineer',
        'Senior Software Engineer', 'Full Stack Developer', 'Backend Engineer',
        'Frontend Engineer', 'Data Scientist', 'DevOps Engineer'
      ];
      for (const rk of roleKeywords) {
        if (new RegExp(`\\b${rk}\\b`, 'i').test(cleanText)) {
          role = rk;
          break;
        }
      }
    }
    if (!role) role = 'Software Professional';

    let totalExperienceYears = Math.max(1, expList.length);

    if (!summary) {
      summary = `${name} is a ${role} with strong background in ${skillsList.slice(0, 5).join(', ')}.`;
    }

      const cleaned = cleanAndNormalizeSkills(skillsList);
      return {
        identity: {
          name,
          role,
          email,
          phone,
          location,
          summary,
          totalExperienceYears,
        },
        experience: expList.length > 0 ? expList : [
          {
            role,
            company: 'Industry Experience',
            duration: `${totalExperienceYears} years`,
            highlights: lines.filter((l) => l.startsWith('•')).slice(0, 5),
          }
        ],
        skills: cleaned.categories,
        skillsFlat: cleaned.skillsFlat,
        projects: projList,
        education: eduList,
        _extraction_mode: 'heuristic',
      };
  }

  private parseJdText(text: string, fallbackFileName: string): StructuredJD {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    let title = 'Target Role';
    for (const line of lines.slice(0, 5)) {
      if (line.length > 3 && line.length < 60 && !line.includes('http')) {
        title = line;
        break;
      }
    }

    let company = 'Target Company';
    const companyMatch = text.match(/\b(?:at|for|with)\s+([A-Z][A-Za-z0-9&.\s]{2,25})\b/);
    if (companyMatch) {
      company = companyMatch[1].trim();
    } else {
      company = path.parse(fallbackFileName).name.replace(/[-_]/g, ' ');
    }

    const foundSkills = new Set<string>();
    for (const skill of COMMON_SKILLS) {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (pattern.test(text)) {
        foundSkills.add(skill);
      }
    }

    return {
      title,
      role: title,
      company,
      description_summary: text.slice(0, 400),
      requirements: lines.filter((l) => l.startsWith('•') || l.startsWith('-')).slice(0, 6),
      skills: Array.from(foundSkills),
    };
  }

  private indexIntoLocalRAG(kind: 'resume' | 'jd', content: string, fileName: string): void {
    try {
      const { DatabaseManager } = require('../../db/DatabaseManager');
      const db = DatabaseManager.getInstance().getDb();
      if (!db) return;

      const meetingId = `profile-knowledge-${kind}`;
      db.prepare(
        `INSERT OR REPLACE INTO meetings (id, title, start_time, duration_ms, created_at, summary_status)
         VALUES (?, ?, ?, 0, ?, 'complete')`
      ).run(meetingId, `Profile: ${fileName}`, new Date().toISOString(), new Date().toISOString());

      const chunks = content.split(/\n\s*\n/).map((s) => s.trim()).filter((s) => s.length > 30);
      for (let i = 0; i < Math.min(chunks.length, 10); i++) {
        const chunkText = chunks[i];
        const tokenEst = Math.ceil(chunkText.split(/\s+/).length * 1.3);
        const existing = db.prepare('SELECT id FROM chunks WHERE meeting_id = ? AND chunk_index = ?').get(meetingId, i);
        if (existing) {
          db.prepare('UPDATE chunks SET cleaned_text = ?, token_count = ? WHERE id = ?').run(chunkText, tokenEst, existing.id);
        } else {
          db.prepare(
            `INSERT INTO chunks (meeting_id, chunk_index, speaker, start_timestamp_ms, end_timestamp_ms, cleaned_text, token_count)
             VALUES (?, ?, 'profile', 0, 0, ?, ?)`
          ).run(meetingId, i, chunkText, tokenEst);
        }
      }
      console.log(`[LocalKnowledgeOrchestrator] Indexed ${chunks.length} ${kind} chunks into natively.db`);
    } catch (e) {
      console.warn('[LocalKnowledgeOrchestrator] RAG chunk index skipped (non-fatal):', e);
    }
  }

  public getStatus(): {
    hasResume: boolean;
    hasActiveJD: boolean;
    activeMode: boolean;
    resumeSummary: {
      name: string;
      role: string;
      totalExperienceYears: number;
    } | null;
  } {
    const hasResume = Boolean(this.activeResume?.structured_data);
    const hasActiveJD = Boolean(this.activeJD?.structured_data);
    const id = this.activeResume?.structured_data?.identity;

    return {
      hasResume,
      hasActiveJD,
      activeMode: this.knowledgeMode,
      resumeSummary: id
        ? {
            name: id.name || 'Candidate',
            role: id.role || 'Software Professional',
            totalExperienceYears: id.totalExperienceYears || 3,
          }
        : null,
    };
  }

  public getProfileData(): any {
    if (!this.activeResume && !this.activeJD) return null;
    const res = this.activeResume?.structured_data;
    const jd = this.activeJD?.structured_data;

    return {
      identity: res?.identity || null,
      experience: res?.experience || [],
      skillsFlat: res?.skillsFlat || [],
      skills: res?.skills || [],
      projects: res?.projects || [],
      education: res?.education || [],
      githubRepositories: res?.githubRepositories || [],
      githubSyncStatus: res?.githubSyncStatus || null,
      hasResume: Boolean(res),
      hasActiveJD: Boolean(jd),
      activeResume: res || null,
      activeJD: jd || null,
    };
  }

  public updateProfileData(updates: any): { success: boolean; profile: any } {
    if (!this.activeResume) {
      this.activeResume = {
        id: 1,
        file_path: 'Manual Entry',
        file_name: 'Profile',
        raw_text: '',
        structured_data: {
          identity: {
            name: updates.identity?.name || 'Candidate',
            role: updates.identity?.role || 'Software Engineer',
            totalExperienceYears: updates.identity?.totalExperienceYears || updates.totalExperienceYears || 1,
          },
          experience: [],
          skills: [],
          skillsFlat: [],
          projects: [],
          education: [],
        },
      };
    }

    const cur = this.activeResume.structured_data || ({} as any);
    if (updates.identity) {
      cur.identity = { ...cur.identity, ...updates.identity };
    }
    if (updates.totalExperienceYears !== undefined && cur.identity) {
      cur.identity.totalExperienceYears = Number(updates.totalExperienceYears);
    }
    if (Array.isArray(updates.experience)) cur.experience = updates.experience;
    if (Array.isArray(updates.projects)) cur.projects = updates.projects;
    if (Array.isArray(updates.education)) cur.education = updates.education;
    if (updates.skills !== undefined || updates.skillsFlat !== undefined) {
      const rawInput = updates.skills !== undefined ? updates.skills : updates.skillsFlat;
      const cleaned = cleanAndNormalizeSkills(rawInput);
      cur.skills = cleaned.categories;
      cur.skillsFlat = cleaned.skillsFlat;
    }
    if (updates.githubRepositories) cur.githubRepositories = updates.githubRepositories;

    this.activeResume.structured_data = cur;
    this.saveToDisk();

    const summaryText = `${cur.identity?.name} - ${cur.identity?.role}\n${cur.identity?.summary || ''}\nExperience: ${JSON.stringify(cur.experience || [])}\nProjects: ${JSON.stringify(cur.projects || [])}`;
    this.indexIntoLocalRAG('resume', summaryText, 'Updated Profile');

    console.log('[LocalKnowledgeOrchestrator] Successfully updated profile manually:', cur.identity);
    return { success: true, profile: this.getProfileData() };
  }

  public setSelectedGithubRepos(repoNames: string[]): { success: boolean; selectedCount: number } {
    if (!this.activeResume?.structured_data?.githubRepositories) {
      return { success: false, selectedCount: 0 };
    }
    const repos = this.activeResume.structured_data.githubRepositories;
    let count = 0;
    const nameSet = new Set(repoNames.map((n) => n.toLowerCase().trim()));
    for (const r of repos) {
      r.selected = nameSet.has((r.name || '').toLowerCase().trim());
      if (r.selected) count++;
    }
    this.saveToDisk();

    const selectedRepos = repos.filter((r: any) => r.selected);
    const repoDoc = selectedRepos
      .map((pr: any) => `Repository: ${pr.name} (${pr.language || 'Code'})\nDescription: ${pr.description}\nREADME Overview:\n${pr.readmeSnippet}`)
      .join('\n\n---\n\n');
    const ghUser = this.activeResume.structured_data.identity?.github || 'GitHub';
    this.indexIntoLocalRAG('github_code', repoDoc, `GitHub Repositories (${ghUser}) - ${count} selected`);

    console.log(`[LocalKnowledgeOrchestrator] Updated selected repositories: ${count} of ${repos.length} selected for interview.`);
    return { success: true, selectedCount: count };
  }

  public async syncGithubRepositories(usernameOrUrl?: string): Promise<{ success: boolean; count: number; repositories: any[]; error?: string }> {
    try {
      let username = (usernameOrUrl || '').trim();
      if (!username) {
        username = this.activeResume?.structured_data?.identity?.github || '';
      }
      if (!username && this.activeResume?.raw_text) {
        const ghMatch = this.activeResume.raw_text.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
        if (ghMatch) username = ghMatch[1];
      }

      username = username.replace(/^https?:\/\/github\.com\//i, '').replace(/\/.*$/, '').trim();
      if (!username) {
        return { success: false, count: 0, repositories: [], error: 'No GitHub username or URL found in resume or input.' };
      }

      console.log(`[LocalKnowledgeOrchestrator] Syncing GitHub repositories for user: ${username}...`);
      const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`, {
        headers: { 'User-Agent': 'natively-ai' },
      });
      if (!res.ok) {
        return { success: false, count: 0, repositories: [], error: `GitHub API returned ${res.status}: ${res.statusText}` };
      }

      const reposRaw: any = await res.json();
      if (!Array.isArray(reposRaw)) {
        return { success: false, count: 0, repositories: [], error: 'Invalid response from GitHub.' };
      }

      const existingMap = new Map<string, boolean>();
      (this.activeResume?.structured_data?.githubRepositories || []).forEach((r: any) => {
        if (typeof r.selected === 'boolean') existingMap.set(r.name.toLowerCase(), r.selected);
      });

      const processedRepos = await Promise.all(
        reposRaw.slice(0, 20).map(async (r: any) => {
          let readmeSnippet = '';
          try {
            const readmeRes = await fetch(`https://raw.githubusercontent.com/${username}/${r.name}/${r.default_branch || 'main'}/README.md`, {
              headers: { 'User-Agent': 'natively-ai' },
            });
            if (readmeRes.ok) {
              const text = await readmeRes.text();
              readmeSnippet = text.slice(0, 800).replace(/<[^>]*>/g, '').trim();
            }
          } catch {}

          const normName = (r.name || '').toLowerCase().replace(/[-_]/g, '');
          const resumeLower = (this.activeResume?.raw_text || '').toLowerCase().replace(/[-_]/g, '');
          const matchesResume = resumeLower.includes(normName) || ['threshold', 'healthforecast', 'intel', 'dealerdesk', 'voicefusion', 'mediquery'].some(k => normName.includes(k));
          const isSelected = existingMap.has((r.name || '').toLowerCase())
            ? existingMap.get(r.name.toLowerCase())!
            : (matchesResume || true);

          return {
            name: r.name,
            description: r.description || '',
            language: r.language || '',
            url: r.html_url || `https://github.com/${username}/${r.name}`,
            stars: r.stargazers_count || 0,
            topics: r.topics || [],
            readmeSnippet,
            selected: isSelected,
          };
        })
      );

      if (this.activeResume?.structured_data) {
        if (!this.activeResume.structured_data.identity) {
          this.activeResume.structured_data.identity = { name: 'Candidate', role: 'Developer' };
        }
        this.activeResume.structured_data.identity.github = `https://github.com/${username}`;
        this.activeResume.structured_data.githubRepositories = processedRepos;
        this.activeResume.structured_data.githubSyncStatus = {
          syncedAt: new Date().toISOString(),
          repoCount: processedRepos.length,
        };
        this.saveToDisk();

        const selectedRepos = processedRepos.filter((pr: any) => pr.selected !== false);
        const repoDoc = selectedRepos
          .map((pr: any) => `Repository: ${pr.name} (${pr.language})\nDescription: ${pr.description}\nREADME Overview:\n${pr.readmeSnippet}`)
          .join('\n\n---\n\n');
        this.indexIntoLocalRAG('github_code', repoDoc, `GitHub Repositories (${username})`);
      }

      console.log(`[LocalKnowledgeOrchestrator] Synced ${processedRepos.length} GitHub repositories for ${username}!`);
      return { success: true, count: processedRepos.length, repositories: processedRepos };
    } catch (err: any) {
      console.error('[LocalKnowledgeOrchestrator] Error syncing GitHub repos:', err);
      return { success: false, count: 0, repositories: [], error: err?.message || String(err) };
    }
  }

  public deleteDocumentsByType(docType: DocType | string): void {
    const dt = String(docType).toLowerCase();
    if (dt.includes('resume')) {
      this.activeResume = null;
      console.log('[LocalKnowledgeOrchestrator] Deleted active resume');
    }
    if (dt.includes('jd')) {
      this.activeJD = null;
      console.log('[LocalKnowledgeOrchestrator] Deleted active job description');
    }
    this.saveToDisk();
  }

  public setKnowledgeMode(enabled: boolean): void {
    this.knowledgeMode = enabled;
    this.saveToDisk();
    console.log(`[LocalKnowledgeOrchestrator] Knowledge mode set to: ${enabled}`);
  }

  public isKnowledgeMode(): boolean {
    return this.knowledgeMode;
  }

  public isIngesting(_docType: any): boolean {
    return false;
  }

  public getAOTPipeline(): { isRunning: () => boolean } {
    return { isRunning: () => false };
  }

  public getCompanyResearchEngine(): { getCachedDossier: (company: string) => any } {
    return { getCachedDossier: () => null };
  }

  public getNegotiationTracker(): { getState: () => { stage: string } } {
    return { getState: () => ({ stage: 'idle' }) };
  }

  public resetNegotiationSession(): void {}
  public getRoleInsightService(): any { return this.roleInsightService; }
  public getNegotiationScript(): any { return null; }
  public generateNegotiationScriptOnDemand(): Promise<any> { return Promise.resolve(null); }
  public getCoverLetter(): any { return null; }
  public generateCoverLetterOnDemand(): Promise<any> { return Promise.resolve(null); }
  public attachRoleInsight(_db: any): void {}
  public setGenerateContentFn(_fn: any): void {}
  public setLiveCoachingContentFn(_fn: any): void {}
  public setSearchProviderResolver(_fn: any): void {}
  public setCompanyResearchAllowedFn(_fn: any): void {}
  public setEmbedFn(_fn: any): void {}
  public setEmbedWithMetadataFn(_fn: any): void {}
  public setEmbedBatchWithMetadataFn(_fn: any): void {}
  public setActiveSpaceFn(_fn: any): void {}
  public setEmbedQueryFn(_fn: any): void {}
  public setConversationContextProvider(_fn: any): void {}
  public ensureEmbeddingSpace(): Promise<void> { return Promise.resolve(); }

  public async processQuestion(question: string): Promise<{ relevantFacts: string; sources: string[] } | null> {
    if (!this.knowledgeMode || !this.activeResume?.structured_data) return null;
    const id = this.activeResume.structured_data.identity;
    const skills = (this.activeResume.structured_data.skillsFlat || []).slice(0, 15).join(', ');
    const exp = (this.activeResume.structured_data.experience || [])
      .map((e) => `${e.role} at ${e.company} (${e.duration || ''})`)
      .join('\n');
    const allRepos = this.activeResume.structured_data.githubRepositories || [];
    const selectedRepos = allRepos.filter((r: any) => r.selected !== false);
    const repos = selectedRepos
      .slice(0, 6)
      .map((r: any) => `- ${r.name} (${r.language || 'Code'}): ${r.description}`)
      .join('\n');

    let relevantFacts = `Candidate Name: ${id.name}\nTitle: ${id.role}\nSkills: ${skills}\nExperience:\n${exp}`;
    if (repos) {
      relevantFacts += `\nCandidate Selected GitHub Code Repositories:\n${repos}`;
    }

    return {
      relevantFacts,
      sources: [this.activeResume.file_name || 'Resume', 'GitHub Repositories'],
    };
  }
}
